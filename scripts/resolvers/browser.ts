import type { ResolverFn } from './types';

/**
 * {{FBS_BROWSER_DETECT}} - Generates browser capability detection per host.
 *
 * Tier 0: Computer use (natural language browser control)
 * Tier 1: Claude for Chrome MCP
 * Tier 2: gstack browse binary ($B)
 * Tier 3: No browser (text-only)
 */
export const FBS_BROWSER_DETECT: ResolverFn = (ctx) => {
  if (ctx.hostConfig.name === 'claude') {
    return generateClaudeBrowserDetect();
  }
  return generateGenericBrowserDetect(ctx);
};

function generateClaudeBrowserDetect(): string {
  return `\`\`\`bash
# Browser capability detection
BROWSER_TIER="none"
# Check Tier 1: Claude for Chrome MCP
if command -v mcp__claude-in-chrome__tabs_context_mcp >/dev/null 2>&1; then
  BROWSER_TIER="chrome-mcp"
fi
# Check Tier 2: gstack browse binary
if [ "$BROWSER_TIER" = "none" ]; then
  B=""
  [ -x ~/.claude/skills/gstack/browse/dist/browse ] && B=~/.claude/skills/gstack/browse/dist/browse
  [ -n "$B" ] && BROWSER_TIER="browse-binary"
fi
echo "BROWSER_TIER: $BROWSER_TIER"
\`\`\``;
}

function generateGenericBrowserDetect(ctx: { hostConfig: { name: string } }): string {
  return `\`\`\`bash
# Browser capability detection
BROWSER_TIER="none"
# Check Tier 2: gstack browse binary
B=""
for _B_CANDIDATE in ~/.claude/skills/gstack/browse/dist/browse ~/.gstack/bin/browse; do
  [ -x "$_B_CANDIDATE" ] && B="$_B_CANDIDATE" && break
done
[ -n "$B" ] && BROWSER_TIER="browse-binary"
echo "BROWSER_TIER: $BROWSER_TIER"
\`\`\`

If \`BROWSER_TIER\` is \`none\`, skip all browser-dependent operations and use text-only mode.
If \`BROWSER_TIER\` is \`browse-binary\`, use \`$B goto <url>\`, \`$B screenshot <path>\` for research and verification. For publishing, use COPY mode (format content for manual copy-paste).`;
}
