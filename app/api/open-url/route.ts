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

    // Validate URL structure — only allow http/https
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return NextResponse.json({ error: 'Only http/https URLs allowed' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        // Use execFileSync with array args to avoid shell interpretation entirely
        const { execFileSync } = require('child_process');
        execFileSync('open', [url], { timeout: 5000 });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
