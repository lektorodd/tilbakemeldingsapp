#!/bin/bash
# Usage: ./bump.sh 0.7.0
set -e

if [ -z "$1" ]; then
  echo "Usage: ./bump.sh <version>"
  echo "Example: ./bump.sh 0.7.0"
  exit 1
fi

VERSION="$1"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔄 Bumping version to $VERSION..."

# 1. package.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$DIR/package.json"
echo "   ✓ package.json"

# 2. tauri.conf.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$DIR/src-tauri/tauri.conf.json"
echo "   ✓ src-tauri/tauri.conf.json"

# 3. Cargo.toml (line 3 — the package version)
sed -i '' '3s/version = "[^"]*"/version = "'"$VERSION"'"/' "$DIR/src-tauri/Cargo.toml"
echo "   ✓ src-tauri/Cargo.toml"

echo ""
echo "✅ All files bumped to v$VERSION"
echo ""
echo "Next steps:"
echo "  git add -A && git commit -m \"chore: bump version to v$VERSION\""
echo "  git tag v$VERSION && git push && git push --tags"
