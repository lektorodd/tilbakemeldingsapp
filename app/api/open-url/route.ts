import { NextRequest, NextResponse } from 'next/server';

/**
 * Opens a URL in the user's default browser.
 * Used as a fallback when window.open() doesn't work (e.g., in Tauri's WebView).
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Only allow http/https URLs for security
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return NextResponse.json({ error: 'Only http/https URLs allowed' }, { status: 400 });
    }

    try {
        const { execSync } = require('child_process');
        execSync(`open "${url.replace(/"/g, '')}"`, { timeout: 5000 });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
