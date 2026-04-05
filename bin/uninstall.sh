#!/usr/bin/env bash
# uninstall.sh — remove forbotsake skills and optionally the repo.
#
# Usage:
#   bash ~/.claude/skills/forbotsake/bin/uninstall.sh
#   bash ~/.claude/skills/forbotsake/bin/uninstall.sh --force  (skip confirmation)
set -euo pipefail

INSTALL_DIR="${HOME}/.claude/skills/forbotsake"
SKILLS_DIR="${HOME}/.claude/skills"
FORCE=false

if [ "${1:-}" = "--force" ]; then
  FORCE=true
fi

if [ ! -d "$INSTALL_DIR" ]; then
  echo "forbotsake is not installed at ${INSTALL_DIR}"
  exit 0
fi

removed=0

# Remove symlink directories
for skill_dir in "$INSTALL_DIR"/forbotsake-*/; do
  [ -d "$skill_dir" ] || continue
  skill_name=$(basename "$skill_dir")
  target="${SKILLS_DIR}/${skill_name}"
  target_skill="${target}/SKILL.md"

  if [ -L "$target_skill" ]; then
    link_dest=$(readlink "$target_skill" 2>/dev/null || true)
    case "$link_dest" in
      "${INSTALL_DIR}/"*)
        rm -f "$target_skill"
        rmdir "$target" 2>/dev/null || true
        removed=$((removed + 1))
        ;;
      *)
        echo "SKIP: ${skill_name} — symlink points to ${link_dest} (not this forbotsake install)"
        ;;
    esac
  fi
done

echo "Removed ${removed} skill symlinks."

# Remove repo directory
if [ "$FORCE" = true ]; then
  rm -rf "$INSTALL_DIR"
  echo "Removed ${INSTALL_DIR}"
else
  echo ""
  printf "Also remove the forbotsake repo at %s? [y/N] " "$INSTALL_DIR"
  read -r REPLY </dev/tty 2>/dev/null || REPLY="n"
  case "$REPLY" in
    [Yy]*)
      rm -rf "$INSTALL_DIR"
      echo "Removed ${INSTALL_DIR}"
      ;;
    *)
      echo "Kept ${INSTALL_DIR} (symlinks removed, repo intact)"
      ;;
  esac
fi
