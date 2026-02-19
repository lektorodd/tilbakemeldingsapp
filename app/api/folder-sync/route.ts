import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, writeFile, mkdir, rm, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Server-side folder sync API for Tauri desktop app.
 * Provides file system access when the browser File System Access API is unavailable.
 *
 * GET — read operations
 *   ?action=browse          → open folder dialog (returns chosen path)
 *   ?action=read&path=...   → read a JSON file
 *   ?action=list&path=...   → list directory contents
 *   ?action=exists&path=... → check if path exists
 *
 * POST — write operations
 *   { action: 'write', path: '...', data: {...} }   → write JSON file
 *   { action: 'mkdir', path: '...' }                → create directory
 *   { action: 'delete', path: '...' }               → delete file/directory
 */

// Store the chosen folder path in memory (server-side state)
let activeFolderPath: string | null = null;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        switch (action) {
            case 'browse': {
                // Use osascript (macOS) to show a folder picker dialog
                const { execSync } = require('child_process');
                try {
                    const result = execSync(
                        'osascript -e \'choose folder with prompt "Vel mappe for lagring"\' 2>/dev/null',
                        { encoding: 'utf-8', timeout: 60000 }
                    ).trim();
                    // Convert AppleScript path (Macintosh HD:Users:...) to POSIX path
                    const posixPath = '/' + result.replace(/^.*?:/, '').replace(/:/g, '/').replace(/\/$/, '');
                    activeFolderPath = posixPath;
                    return NextResponse.json({ path: posixPath, name: posixPath.split('/').pop() });
                } catch (e: any) {
                    if (e.status === 1) {
                        // User cancelled
                        return NextResponse.json({ cancelled: true });
                    }
                    return NextResponse.json({ error: 'Failed to open folder picker' }, { status: 500 });
                }
            }

            case 'status': {
                return NextResponse.json({
                    connected: activeFolderPath !== null,
                    path: activeFolderPath,
                    name: activeFolderPath?.split('/').pop() || null,
                });
            }

            case 'disconnect': {
                activeFolderPath = null;
                return NextResponse.json({ ok: true });
            }

            case 'reconnect': {
                const savedPath = searchParams.get('path');
                if (savedPath && existsSync(savedPath)) {
                    activeFolderPath = savedPath;
                    return NextResponse.json({ connected: true, path: savedPath });
                }
                return NextResponse.json({ connected: false });
            }

            case 'read': {
                const filePath = searchParams.get('path');
                if (!filePath || !activeFolderPath) {
                    return NextResponse.json({ error: 'Missing path or no folder connected' }, { status: 400 });
                }
                const fullPath = join(activeFolderPath, filePath);
                if (!existsSync(fullPath)) {
                    return NextResponse.json({ error: 'File not found' }, { status: 404 });
                }
                const content = await readFile(fullPath, 'utf-8');
                return NextResponse.json(JSON.parse(content));
            }

            case 'list': {
                const dirPath = searchParams.get('path') || '';
                if (!activeFolderPath) {
                    return NextResponse.json({ error: 'No folder connected' }, { status: 400 });
                }
                const fullPath = join(activeFolderPath, dirPath);
                if (!existsSync(fullPath)) {
                    return NextResponse.json([]);
                }
                const entries = await readdir(fullPath, { withFileTypes: true });
                return NextResponse.json(
                    entries.map(e => ({ name: e.name, isDirectory: e.isDirectory() }))
                );
            }

            case 'exists': {
                const checkPath = searchParams.get('path') || '';
                if (!activeFolderPath) {
                    return NextResponse.json({ exists: false });
                }
                return NextResponse.json({ exists: existsSync(join(activeFolderPath, checkPath)) });
            }

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Folder sync API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, path: relPath, data } = body;

        if (!activeFolderPath) {
            return NextResponse.json({ error: 'No folder connected' }, { status: 400 });
        }

        switch (action) {
            case 'write': {
                if (!relPath) {
                    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
                }
                const fullPath = join(activeFolderPath, relPath);
                // Ensure parent directory exists
                const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/'));
                if (!existsSync(parentDir)) {
                    await mkdir(parentDir, { recursive: true });
                }
                await writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
                return NextResponse.json({ ok: true });
            }

            case 'mkdir': {
                if (!relPath) {
                    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
                }
                const fullPath = join(activeFolderPath, relPath);
                await mkdir(fullPath, { recursive: true });
                return NextResponse.json({ ok: true });
            }

            case 'delete': {
                if (!relPath) {
                    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
                }
                const fullPath = join(activeFolderPath, relPath);
                if (existsSync(fullPath)) {
                    await rm(fullPath, { recursive: true });
                }
                return NextResponse.json({ ok: true });
            }

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Folder sync API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
