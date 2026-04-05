#!/usr/bin/env bash
# Compile satori-card.ts into a zero-dependency binary using bun
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="$SCRIPT_DIR/src/satori-card.ts"
OUT="$SCRIPT_DIR/satori-card"

if ! command -v bun >/dev/null 2>&1; then
  echo "Error: bun is required to compile satori-card."
  echo "Install: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

# Install deps if needed
if [ ! -d "$SCRIPT_DIR/src/node_modules" ]; then
  echo "Installing dependencies..."
  cd "$SCRIPT_DIR/src" && bun install
fi

echo "Compiling satori-card..."
bun build --compile "$SRC" --outfile "$OUT"

echo "Done: $OUT ($(du -h "$OUT" | cut -f1) binary)"
echo "Test: $OUT --content sample.md --brand brand.md --output test.png --type title"
