import type { ResolverFn } from './types';

/**
 * {{FBS_ADVERSARIAL_REVIEW}} - Adversarial review gate pattern.
 *
 * On Claude: Spawns independent Agent subagent with isolated context.
 * On Codex/others: Inlines the review prompt directly (no subagent spawning).
 *
 * Used by: forbotsake-marketing-start (strategy review), forbotsake-content-check (red team)
 */
export const FBS_ADVERSARIAL_REVIEW: ResolverFn = (ctx) => {
  if (ctx.hostConfig.name === 'claude') {
    return generateAgentReview();
  }
  return generateInlineReview();
};

function generateAgentReview(): string {
  return `Use the Agent tool to spawn an independent reviewer subagent. The subagent gets a FRESH context (it cannot see this conversation). This ensures genuine independence.

The subagent prompt must contain ONLY:
- The file path(s) to review
- The review dimensions
- The JSON output contract

Do NOT include conversation history, prior analysis, or your own conclusions in the subagent prompt. The subagent must form its own opinion.`;
}

function generateInlineReview(): string {
  return `**Inline Review (no subagent available on this host):**

Perform the review directly. To maintain independence from your prior analysis:
1. Re-read the file(s) to review from scratch
2. Apply ONLY the review dimensions listed below
3. Produce the JSON output as specified
4. Do NOT reference your earlier analysis or conversation context

**Degradation notice:** On Claude Code, this review runs as an independent subagent with isolated context, providing stronger adversarial independence. On this host, the review runs inline. Results may be less adversarial due to shared context.`;
}
