import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, rm } from 'fs/promises';
import { mkdtemp } from 'fs/promises';
import { join, resolve } from 'path';
import { tmpdir } from 'os';

const execFileAsync = promisify(execFile);

const fontsDir = resolve(process.cwd(), 'fonts');

// Find typst binary — check common paths first for .app compatibility
function findTypst(): string {
  const candidates = [
    '/opt/homebrew/bin/typst',
    '/usr/local/bin/typst',
    '/usr/bin/typst',
  ];
  const fs = require('fs');
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return 'typst'; // fallback to PATH
}

/**
 * Sanitize filename: strip directory separators, traversal, and dangerous chars.
 * Returns only the basename with safe characters.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/\.\./g, '')           // remove traversal
    .replace(/[/\\]/g, '')          // remove directory separators
    .replace(/[^a-zA-Z0-9_\-æøåÆØÅ .]/g, '') // keep safe chars
    .trim() || 'document';
}

export async function POST(request: NextRequest) {
  // Create a unique per-request temp directory to prevent file collisions
  const tempDir = await mkdtemp(join(tmpdir(), 'typst-'));

  try {
    const { content, filename, chartImage } = await request.json();

    if (!content || !filename) {
      return NextResponse.json(
        { error: 'Missing content or filename' },
        { status: 400 }
      );
    }

    // Sanitize the filename to prevent traversal and injection
    const safeName = sanitizeFilename(filename.replace(/\.typ$/, ''));
    const typFilename = safeName + '.typ';
    const pdfFilename = safeName + '.pdf';
    const typPath = join(tempDir, typFilename);
    const pdfPath = join(tempDir, pdfFilename);

    // Save chart image if provided (unique dir prevents collisions)
    let chartImagePath: string | null = null;
    if (chartImage) {
      chartImagePath = join(tempDir, 'radar-chart.png');
      const base64Data = chartImage.replace(/^data:image\/png;base64,/, '');
      await writeFile(chartImagePath, Buffer.from(base64Data, 'base64'));
    }

    // Write Typst content to temp file
    await writeFile(typPath, content, 'utf-8');

    // Find typst binary
    const typstBin = findTypst();

    // Compile Typst file to PDF using execFile (no shell interpretation)
    try {
      const execEnv = { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}` };
      const { stderr } = await execFileAsync(typstBin, [
        'compile',
        '--root', tempDir,
        '--font-path', fontsDir,
        typPath,
        pdfPath,
      ], {
        timeout: 30000,
        env: execEnv,
      });

      if (stderr && !stderr.includes('compiled successfully')) {
        console.error('Typst compilation warning:', stderr);
      }

      // Read the generated PDF
      const pdfBuffer = await readFile(pdfPath);

      // Return PDF as blob
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfFilename}"`,
        },
      });
    } catch (compileError: any) {
      return NextResponse.json(
        {
          error: 'Typst compilation failed',
          details: compileError.message,
          stderr: compileError.stderr,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  } finally {
    // Always clean up the per-request temp directory
    await rm(tempDir, { recursive: true }).catch(() => { });
  }
}
