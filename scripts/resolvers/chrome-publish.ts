import type { ResolverFn } from './types';

/**
 * {{FBS_CHROME_PUBLISH_FLOW}} - Chrome MCP posting flow.
 *
 * On Claude: Full Chrome MCP automation for POST mode.
 * On Codex/others: Suppressed (returns empty string via suppressedResolvers).
 *
 * When suppressed, the skill falls back to COPY mode only.
 * A runtime notice informs the user: "Chrome automation unavailable on [host].
 * Using COPY mode. Content formatted for manual copy-paste."
 */
export const FBS_CHROME_PUBLISH_FLOW: ResolverFn = (ctx) => {
  // This resolver only produces content for Claude.
  // On other hosts, it's in suppressedResolvers and returns ''.
  return generateChromePublishFlow();
};

function generateChromePublishFlow(): string {
  return `### POST Mode (Chrome Automation)

If \`CHROME_AVAILABLE\` is \`yes\` and the user chose POST mode:

1. **Open platform:**
   Use \`mcp__claude-in-chrome__tabs_create_mcp\` to open the platform's compose page.

2. **Verify login:**
   Use \`mcp__claude-in-chrome__read_page\` or \`mcp__claude-in-chrome__get_page_text\` to verify the user is logged in. If not logged in, switch to COPY mode and tell the user.

3. **Navigate to compose:**
   Use \`mcp__claude-in-chrome__navigate\` to go to the compose URL for the platform.

4. **Enter content:**
   Use \`mcp__claude-in-chrome__find\` to locate the text input field.
   Use \`mcp__claude-in-chrome__computer\` to click the field and type/paste the content.

5. **Upload visual (if applicable):**
   If the content has an associated visual file (\`content/*-visual-*.png\`):
   Use \`mcp__claude-in-chrome__upload_image\` with the visual file path.

6. **Post:**
   Use \`mcp__claude-in-chrome__find\` to locate the Post/Publish button.
   Use \`mcp__claude-in-chrome__computer\` to click it.

7. **Verify:**
   Wait 3 seconds. Use \`mcp__claude-in-chrome__read_page\` to verify the post appeared.`;
}
