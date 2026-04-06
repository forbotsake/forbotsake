#!/usr/bin/env bash
# install.sh — install forbotsake marketing skills for AI coding agents.
#
# Auto-detects installed agents (Claude Code, Codex, Kimi) and sets up
# forbotsake for all of them. Generated SKILL.md files for each host are
# pre-built in the repo, so no build tools are needed at install time.
#
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/forbotsake/forbotsake/main/bin/install.sh)
#   OR: git clone ... && bash ~/.claude/skills/forbotsake/bin/install.sh
#
# Flags:
#   --clean    Remove all forbotsake symlinks across all agents
#   --hosts X  Comma-separated list of hosts (e.g., --hosts claude,codex)
set -euo pipefail

INSTALL_DIR="${HOME}/.claude/skills/forbotsake"
REPO_URL="https://github.com/forbotsake/forbotsake.git"
CLEAN_MODE=false
EXPLICIT_HOSTS=""

for arg in "$@"; do
  case "$arg" in
    --clean) CLEAN_MODE=true ;;
    --hosts) shift; EXPLICIT_HOSTS="${1:-}" ;;
    --hosts=*) EXPLICIT_HOSTS="${arg#--hosts=}" ;;
  esac
done

# --- Clean mode ---
if [ "$CLEAN_MODE" = true ]; then
  echo "Removing forbotsake symlinks..."
  removed=0
  for skills_dir in "$HOME/.claude/skills" "$HOME/.codex/skills" "$HOME/.kimi/skills"; do
    [ -d "$skills_dir" ] || continue
    for link in "$skills_dir"/forbotsake-*/SKILL.md; do
      [ -L "$link" ] || continue
      link_dest=$(readlink "$link" 2>/dev/null || true)
      case "$link_dest" in
        *forbotsake*) rm -f "$link" && rmdir "$(dirname "$link")" 2>/dev/null; removed=$((removed + 1)) ;;
      esac
    done
  done
  # Clean .agents/skills if present
  for link in .agents/skills/forbotsake-*/SKILL.md; do
    [ -L "$link" ] || [ -f "$link" ] || continue
    rm -f "$link" && rmdir "$(dirname "$link")" 2>/dev/null; removed=$((removed + 1))
  done
  echo "Removed $removed symlinks."
  exit 0
fi

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

# --- Auto-detect installed agents ---
DETECTED_HOSTS=""

detect_host() {
  local name="$1" cmd="$2"
  if command -v "$cmd" >/dev/null 2>&1; then
    DETECTED_HOSTS="${DETECTED_HOSTS}${name} "
    echo "  [detected] $name ($cmd)"
  fi
}

echo ""
echo "Detecting AI coding agents..."
detect_host "claude" "claude"
detect_host "codex" "codex"
detect_host "kimi" "kimi"

if [ -n "$EXPLICIT_HOSTS" ]; then
  DETECTED_HOSTS=$(echo "$EXPLICIT_HOSTS" | tr ',' ' ')
  echo "  [override] Using explicit hosts: $DETECTED_HOSTS"
fi

if [ -z "$DETECTED_HOSTS" ]; then
  echo "  [warn] No agents detected. Setting up for Claude Code (default)."
  DETECTED_HOSTS="claude"
fi

# --- Set up symlinks for each detected host ---
for host in $DETECTED_HOSTS; do
  echo ""
  echo "Setting up for $host..."
  case "$host" in
    claude)
      bash "$INSTALL_DIR/bin/sync-links.sh"
      ;;
    codex)
      # Codex uses pre-generated files in .agents/skills/
      CODEX_SRC="$INSTALL_DIR/.agents/skills"
      CODEX_DST="$HOME/.codex/skills"
      if [ -d "$CODEX_SRC" ]; then
        mkdir -p "$CODEX_DST"
        for skill_dir in "$CODEX_SRC"/forbotsake-*/; do
          [ -d "$skill_dir" ] || continue
          skill_name=$(basename "$skill_dir")
          target="$CODEX_DST/$skill_name"
          mkdir -p "$target"
          if [ ! -L "$target/SKILL.md" ] && [ ! -f "$target/SKILL.md" ]; then
            ln -sf "$skill_dir/SKILL.md" "$target/SKILL.md"
            echo "  [linked] $skill_name"
          else
            echo "  [exists] $skill_name"
          fi
          # Copy openai.yaml if present
          if [ -f "$skill_dir/openai.yaml" ]; then
            cp "$skill_dir/openai.yaml" "$target/openai.yaml"
          fi
        done
      else
        echo "  [warn] No Codex-generated files found. Run 'bun run gen:skill-docs' first."
      fi
      ;;
    kimi)
      echo "  [defer] Kimi support coming in a future version."
      ;;
    *)
      echo "  [skip] Unknown host: $host"
      ;;
  esac
done

VERSION=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
echo ""
echo "forbotsake v${VERSION} installed for: ${DETECTED_HOSTS}"
echo ""
echo "Getting started:"
for host in $DETECTED_HOSTS; do
  case "$host" in
    claude) echo "  Claude Code: /forbotsake-go" ;;
    codex)  echo "  Codex:       \$forbotsake-go" ;;
    kimi)   echo "  Kimi:        forbotsake-go" ;;
  esac
done
