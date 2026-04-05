#!/usr/bin/env bash
# install.sh — install forbotsake marketing skills for Claude Code.
#
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/forbotsake/forbotsake/main/bin/install.sh)
#   OR: git clone ... && bash ~/.claude/skills/forbotsake/bin/install.sh
set -euo pipefail

INSTALL_DIR="${HOME}/.claude/skills/forbotsake"
REPO_URL="https://github.com/forbotsake/forbotsake.git"

echo "Installing forbotsake..."

# Ensure parent directory exists
mkdir -p "$(dirname "$INSTALL_DIR")"

# Clone if not present
if [ ! -d "$INSTALL_DIR" ]; then
  if ! command -v git >/dev/null 2>&1; then
    echo "ERROR: git is required but not installed."
    echo "  Fix: install git (https://git-scm.com/downloads) and retry."
    exit 1
  fi
  git clone --single-branch --depth 1 "$REPO_URL" "$INSTALL_DIR"
elif [ ! -f "$INSTALL_DIR/VERSION" ]; then
  echo "ERROR: ${INSTALL_DIR} exists but doesn't look like forbotsake."
  echo "  Fix: remove or rename that directory, then retry."
  exit 1
else
  echo "forbotsake already cloned at ${INSTALL_DIR}"
fi

# Run sync-links
bash "$INSTALL_DIR/bin/sync-links.sh"

VERSION=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
echo ""
echo "forbotsake v${VERSION} installed."
echo "Start a new Claude Code session and type: /forbotsake-marketing-start"
