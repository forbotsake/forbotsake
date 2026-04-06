import type { ResolverFn } from './types';

/**
 * {{FBS_PREAMBLE}} - Generates the host-aware preamble for every forbotsake skill.
 *
 * On Claude: Uses ~/.claude/skills path discovery (current behavior).
 * On Codex/others: Sets $FBS_ROOT env var, discovers install path dynamically.
 */
export const FBS_PREAMBLE: ResolverFn = (ctx) => {
  if (ctx.hostConfig.usesEnvVars) {
    return generateEnvVarPreamble(ctx);
  }
  return generateClaudePreamble();
};

function generateClaudePreamble(): string {
  return `\`\`\`bash
FORBOTSAKE_HOME="\${FORBOTSAKE_HOME:-$HOME/.forbotsake}"
mkdir -p "$FORBOTSAKE_HOME"

# Check for updates
_SKILL_DIR=$(dirname "$(find ~/.claude/skills -path "*/forbotsake-marketing-start/SKILL.md" -type f 2>/dev/null | head -1)" 2>/dev/null)
_FBS_ROOT=$(cd "\${_SKILL_DIR}/.." 2>/dev/null && pwd || true)
_UPD=""
[ -n "$_FBS_ROOT" ] && [ -x "$_FBS_ROOT/bin/forbotsake-update-check" ] && _UPD=$("$_FBS_ROOT/bin/forbotsake-update-check" 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"
\`\`\``;
}

function generateEnvVarPreamble(ctx: { hostConfig: { globalRoot: string; name: string } }): string {
  const root = ctx.hostConfig.globalRoot;
  return `\`\`\`bash
FORBOTSAKE_HOME="\${FORBOTSAKE_HOME:-$HOME/.forbotsake}"
mkdir -p "$FORBOTSAKE_HOME"

# Discover forbotsake install directory
_FBS_ROOT=""
for _FBS_CANDIDATE in "$HOME/${root}" "$HOME/.claude/skills/forbotsake"; do
  [ -d "$_FBS_CANDIDATE" ] && _FBS_ROOT="$_FBS_CANDIDATE" && break
done
if [ -z "$_FBS_ROOT" ]; then
  echo "WARNING: forbotsake not found. Install: bash <(curl -fsSL https://raw.githubusercontent.com/forbotsake/forbotsake/main/bin/install.sh)"
fi

# Check for updates
_UPD=""
[ -n "$_FBS_ROOT" ] && [ -x "$_FBS_ROOT/bin/forbotsake-update-check" ] && _UPD=$("$_FBS_ROOT/bin/forbotsake-update-check" 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"
\`\`\``;
}
