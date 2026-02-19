import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

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

export async function POST(request: NextRequest) {
  try {
    const { content, filename } = await request.json();

    if (!content || !filename) {
      return NextResponse.json(
        { error: 'Missing content or filename' },
        { status: 400 }
      );
    }

    // Create temp files
    const tempDir = tmpdir();
    const typFilename = filename.replace(/\.typ$/, '') + '.typ';
    const pdfFilename = filename.replace(/\.typ$/, '') + '.pdf';
    const typPath = join(tempDir, typFilename);
    const pdfPath = join(tempDir, pdfFilename);

    // Write Typst content to temp file
    await writeFile(typPath, content, 'utf-8');

    // Find typst binary
    const typstBin = findTypst();

    // Compile Typst file to PDF
    try {
      const execEnv = { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}` };
      const { stdout, stderr } = await execAsync(`"${typstBin}" compile --font-path "${fontsDir}" "${typPath}" "${pdfPath}"`, {
        timeout: 30000,
        env: execEnv,
      });

      if (stderr && !stderr.includes('compiled successfully')) {
        console.error('Typst compilation warning:', stderr);
      }

      // Read the generated PDF
      const pdfBuffer = await readFile(pdfPath);

      // Clean up temp files
      await unlink(typPath).catch(() => { });
      await unlink(pdfPath).catch(() => { });

      // Return PDF as blob
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfFilename}"`,
        },
      });
    } catch (compileError: any) {
      // Clean up temp files
      await unlink(typPath).catch(() => { });
      await unlink(pdfPath).catch(() => { });

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
  }
}
