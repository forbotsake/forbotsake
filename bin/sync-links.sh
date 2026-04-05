#!/usr/bin/env bash
# sync-links.sh — single symlink management primitive for forbotsake.
#
# Creates/verifies symlink directories so Claude Code discovers forbotsake skills.
# Claude Code discovers skills at ~/.claude/skills/<name>/SKILL.md (flat).
# forbotsake nests skills at ~/.claude/skills/forbotsake/forbotsake-*/SKILL.md.
# This script bridges the gap.
#
# Usage:
#   sync-links.sh          — create/repair symlinks (default)
#   sync-links.sh --check  — verify without modifying (doctor mode)
#
# Called by: SKILL.md preamble, install.sh, forbotsake-upgrade
set -euo pipefail

FORBOTSAKE_DIR="${FORBOTSAKE_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
SKILLS_DIR="${HOME}/.claude/skills"
CHECK_ONLY=false

if [ "${1:-}" = "--check" ]; then
  CHECK_ONLY=true
fi

created=0
skipped=0
existing=0
errors=0

for skill_dir in "$FORBOTSAKE_DIR"/forbotsake-*/; do
  [ -d "$skill_dir" ] || continue
  [ -f "${skill_dir}SKILL.md" ] || continue

  skill_name=$(basename "$skill_dir")
  target="${SKILLS_DIR}/${skill_name}"
  target_skill="${target}/SKILL.md"

  # Check if symlink already exists and points to us
  if [ -L "$target_skill" ]; then
    link_dest=$(readlink "$target_skill" 2>/dev/null || true)
    # Check if symlink points to OUR install directory (not just any path containing "forbotsake")
    case "$link_dest" in
      "${FORBOTSAKE_DIR}/"*)
        # Verify the symlink actually resolves (not broken)
        if [ ! -f "$target_skill" ]; then
          # Broken symlink — repair it
          if [ "$CHECK_ONLY" = true ]; then
            echo "BROKEN: ${skill_name} — symlink exists but target is missing"
            errors=$((errors + 1))
            continue
          fi
          rm -f "$target_skill"
          if ln -sf "${skill_dir}SKILL.md" "$target_skill" 2>/dev/null; then
            created=$((created + 1))
            continue
          fi
        fi
        existing=$((existing + 1))
        continue
        ;;
      *)
        echo "SKIP: ${skill_name} — symlink exists pointing to ${link_dest} (not this forbotsake install)"
        skipped=$((skipped + 1))
        continue
        ;;
    esac
  fi

  # Check if target dir has non-forbotsake content
  if [ -d "$target" ] && [ -n "$(ls -A "$target" 2>/dev/null)" ]; then
    echo "SKIP: ${skill_name} — directory exists with foreign content"
    skipped=$((skipped + 1))
    continue
  fi

  # Check if regular file exists (not a symlink)
  if [ -f "$target_skill" ] && [ ! -L "$target_skill" ]; then
    echo "SKIP: ${skill_name} — SKILL.md exists as regular file (not forbotsake)"
    skipped=$((skipped + 1))
    continue
  fi

  if [ "$CHECK_ONLY" = true ]; then
    echo "MISSING: ${skill_name} — symlink not found"
    errors=$((errors + 1))
    continue
  fi

  # Create symlink
  mkdir -p "$target"
  if ln -sf "${skill_dir}SKILL.md" "$target_skill" 2>/dev/null; then
    created=$((created + 1))
  else
    echo "ERROR: ${skill_name} — failed to create symlink"
    echo "  Fix: check permissions on ${SKILLS_DIR}"
    errors=$((errors + 1))
  fi
done

total=$((created + existing + skipped))

if [ "$CHECK_ONLY" = true ]; then
  echo ""
  if [ "$existing" -eq 0 ] && [ "$errors" -eq 0 ] && [ "$skipped" -eq 0 ]; then
    echo "forbotsake doctor: no skills found. Is forbotsake installed correctly?"
    echo "  Fix: run 'bash ${FORBOTSAKE_DIR}/bin/install.sh'"
    exit 1
  fi
  echo "forbotsake doctor: ${existing} OK, ${errors} missing, ${skipped} skipped"
  if [ "$errors" -gt 0 ]; then
    echo "  Fix: run 'bash ${FORBOTSAKE_DIR}/bin/sync-links.sh' to repair"
    exit 1
  fi
  exit 0
fi

echo ""
if [ "$created" -gt 0 ]; then
  echo "forbotsake: ${created} skills symlinked, ${existing} already linked, ${skipped} skipped"
else
  echo "forbotsake: ${existing} skills already linked, ${skipped} skipped"
fi

if [ "$skipped" -gt 0 ]; then
  echo "  Note: skipped skills may conflict with existing installations."
  echo "  Run 'bash ${FORBOTSAKE_DIR}/bin/sync-links.sh --check' for details."
fi

if [ "$errors" -gt 0 ]; then
  echo "  ${errors} errors occurred. Check permissions and retry."
  exit 1
fi
