#!/bin/bash
# Build script: assembles the Next.js standalone server for Tauri bundling
set -e

echo "📦 Assembling standalone server for Tauri..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$SCRIPT_DIR/server"

# Clean previous server bundle
rm -rf "$SERVER_DIR"
mkdir -p "$SERVER_DIR"

# Build Next.js standalone
cd "$PROJECT_DIR"
npm run build

# Copy standalone server (use rsync to include dotfiles like .next/)
rsync -a .next/standalone/ "$SERVER_DIR/"

# Copy static assets into the server bundle (Next.js standalone requires this)
mkdir -p "$SERVER_DIR/.next/static"
cp -r .next/static/* "$SERVER_DIR/.next/static/"

# Copy public assets
if [ -d "public" ]; then
  cp -r public "$SERVER_DIR/public"
fi

# Copy fonts directory (used by Typst API route)
if [ -d "fonts" ]; then
  cp -r fonts "$SERVER_DIR/fonts"
fi

echo "✅ Server assembled at $SERVER_DIR"
echo "   Size: $(du -sh "$SERVER_DIR" | cut -f1)"
echo "   .next contents: $(ls "$SERVER_DIR/.next/" | tr '\n' ' ')"
