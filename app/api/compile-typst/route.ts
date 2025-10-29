import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

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

    // Check if typst is installed
    try {
      await execAsync('which typst');
    } catch (error) {
      await unlink(typPath).catch(() => {});
      return NextResponse.json(
        { error: 'Typst CLI is not installed. Please install it first: brew install typst (macOS) or cargo install --git https://github.com/typst/typst (Linux)' },
        { status: 500 }
      );
    }

    // Compile Typst file to PDF
    try {
      const { stdout, stderr } = await execAsync(`typst compile "${typPath}" "${pdfPath}"`, {
        timeout: 30000, // 30 second timeout
      });

      if (stderr && !stderr.includes('compiled successfully')) {
        console.error('Typst compilation warning:', stderr);
      }

      // Read the generated PDF
      const pdfBuffer = await readFile(pdfPath);

      // Clean up temp files
      await unlink(typPath).catch(() => {});
      await unlink(pdfPath).catch(() => {});

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
      await unlink(typPath).catch(() => {});
      await unlink(pdfPath).catch(() => {});

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
