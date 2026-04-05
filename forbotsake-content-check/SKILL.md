---
name: forbotsake-content-check
description: |
  Reviews your marketing content against your strategy before publishing. Checks brand voice
  consistency, messaging alignment, channel format fit, CTA clarity, and length. Rates each
  dimension pass/fail with specific feedback and gives an overall READY TO PUBLISH or
  NEEDS REVISION verdict.
  Use when: "review my content", "check this post", "is this ready to publish", "content review",
  "check my thread", "review before posting", "does this match my brand", "content check".
  Proactively invoke when the user has written content and is about to publish, or when
  /forbotsake-create suggests running this as a next step.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
---

# /forbotsake-content-check

The gate between "written" and "published." Catches messaging drift, weak CTAs,
and channel misfits before your audience sees them.

## Preamble

```bash
FORBOTSAKE_HOME="${FORBOTSAKE_HOME:-$HOME/.forbotsake}"
mkdir -p "$FORBOTSAKE_HOME"

# Check for updates
_SKILL_DIR=$(dirname "$(find ~/.claude/skills -path "*/forbotsake-marketing-start/SKILL.md" -type f 2>/dev/null | head -1)" 2>/dev/null)
_FBS_ROOT=$(cd "${_SKILL_DIR}/.." 2>/dev/null && pwd || true)
_UPD=""
[ -n "$_FBS_ROOT" ] && [ -x "$_FBS_ROOT/bin/forbotsake-update-check" ] && _UPD=$("$_FBS_ROOT/bin/forbotsake-update-check" 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"

# Check for strategy.md
if [ -f strategy.md ]; then
  echo "STRATEGY_EXISTS: yes"
  echo "STRATEGY_FILE: strategy.md"
elif [ -f forbotsake-strategy.md ]; then
  echo "STRATEGY_EXISTS: yes"
  echo "STRATEGY_FILE: forbotsake-strategy.md"
else
  echo "STRATEGY_EXISTS: no"
fi

# Check for content directory and list recent files
if [ -d content ]; then
  echo "CONTENT_DIR: exists"
  echo "RECENT_CONTENT:"
  ls -1t content/*.md 2>/dev/null | head -10
  echo "LATEST_FILE: $(ls -1t content/*.md 2>/dev/null | head -1)"
else
  echo "CONTENT_DIR: missing"
fi
```

If the preamble output shows `UPGRADE_AVAILABLE <old> <new>`: tell the user
"forbotsake v{new} is available (you're on v{old}). Run `/forbotsake-upgrade` to update."
Then continue with the skill normally. Do not block on the upgrade.

If the output shows `JUST_UPGRADED <old> <new>`: tell the user
"Running forbotsake v{new} (just updated!)." Then continue.

If `STRATEGY_EXISTS` is `no`:

> "No strategy.md found. I can still review content for general quality, but I can't
> check it against your brand voice, ICP, or messaging pillars without a strategy.
>
> Want to proceed with a general review, or run `/forbotsake-marketing-start` first?"

Use AskUserQuestion with options: A) General review (no strategy checks), B) I'll create a strategy first.

If option B, stop here.

If `CONTENT_DIR` is `missing`:

> "No content/ directory found. What file do you want me to review?
> Paste the path or the content directly."

Use AskUserQuestion.

## Phase 1: Select the Content to Review

If content files exist, ask via AskUserQuestion:

> "Which content piece should I review?
>
> **Recent files:**
> {numbered list of files from RECENT_CONTENT, showing filename and frontmatter channel/topic}
>
> Pick a number, paste a file path, or paste raw content directly."

If only one file exists in content/, default to it:

> "Found one content file: `{filename}`. Reviewing that one. Say 'no' if you meant something else."

Read the selected content file completely. Extract from its frontmatter:
- `channel` -- which platform this is for
- `messaging_pillar` -- which pillar it supports
- `topic` -- what it's about
- `status` -- current status

## Phase 2: Load the Review Criteria

Read `strategy.md` completely. Extract:

1. **Positioning statement** -- the reference frame for all content
2. **ICP** -- person, title, pain, language they use
3. **Messaging pillars** -- the 3 claims, each with proof points
4. **Channel strategy** -- the channel's score and rationale
5. **Brand voice** -- if explicitly defined; otherwise infer from the positioning and ICP:
   - Technical ICP = direct, precise, no fluff
   - Business ICP = outcome-focused, professional but not corporate
   - Creative ICP = conversational, personality-driven
   - Developer ICP = show-don't-tell, code examples over claims

## Phase 3: Run the Review

Evaluate the content against these 7 dimensions. For each, give a **PASS** or **FAIL** with specific, actionable feedback. Not vague ("could be better") -- specific ("tweet 3 uses 'leverage' which your ICP wouldn't say; replace with 'use'").

### Dimension 1: Brand Voice Consistency

Does the content sound like it comes from the same person/brand as the strategy?

Check for:
- Tone match (formal vs casual, technical vs accessible)
- Vocabulary alignment (does it use the ICP's words, not marketing jargon?)
- Personality consistency (if strategy says "direct and no-BS" but content is hedging and passive)
- First-person vs third-person consistency

**PASS criteria:** A reader familiar with the brand would recognize this as on-brand.
**FAIL example:** "Strategy says 'direct, technical, no fluff' but this post opens with 'In today's fast-paced world of innovation...'"

### Dimension 2: Messaging Alignment

Does the content reinforce at least one messaging pillar without contradicting the others?

Check for:
- Clear connection to a specific pillar
- Claims that are supported by the pillar's proof points
- No contradictions with positioning statement
- No accidental repositioning (claiming to be something the strategy doesn't support)

**PASS criteria:** You can point to the specific pillar this content supports.
**FAIL example:** "Strategy positions you as the 'simple' alternative, but this post emphasizes 'powerful enterprise features.'"

### Dimension 3: ICP Targeting

Is this content written FOR the ICP, not for a generic audience?

Check for:
- Does it reference the ICP's specific pain point?
- Would the ICP recognize their situation in this content?
- Is it using language the ICP uses (not your internal terminology)?
- Is the assumed knowledge level correct for the ICP?

**PASS criteria:** The ICP from strategy.md would feel "this was written for me."
**FAIL example:** "ICP is 'backend engineers at Series A startups' but this post reads like it's targeting CTOs at enterprises."

### Dimension 4: Channel Format Fit

Does the content respect the platform's conventions and constraints?

Check per channel:
- **X/Twitter thread:** Each tweet under 280 chars? Hook in tweet 1? Tweets stand alone? Thread length 3-10 tweets?
- **X/Twitter single:** Under 280 chars? Punchy? One clear point?
- **Blog:** Scannable headers? 1500+ words for SEO? Clear structure? Meta description?
- **LinkedIn:** First 2 lines hook before fold? Under 1300 chars? No hashtag spam? Line breaks?
- **Email:** Compelling subject line? Short paragraphs? Single CTA? Mobile-friendly length?
- **Reddit:** Value-first? No overt self-promotion? Matches subreddit norms?
- **Hacker News:** Zero marketing speak? Technical substance? Genuine?

**PASS criteria:** The content would not look out of place on the target platform.
**FAIL example:** "This X thread has 15 tweets -- that's too long. Most readers drop off after tweet 5-7."

### Dimension 5: CTA Clarity

Is there one clear call-to-action, and does it match the content's funnel position?

Check for:
- Single CTA (not competing asks)
- CTA matches funnel stage: awareness content = soft CTA (follow, bookmark), consideration = medium CTA (try, sign up for beta), decision = hard CTA (buy, subscribe)
- CTA is specific, not vague ("Try the free tier at {url}" not "check it out")
- CTA placement (end of content, not buried in the middle)

**PASS criteria:** A reader knows exactly what to do next and why.
**FAIL example:** "CTA says 'sign up now' but this is an awareness-stage thread. Try 'follow for more' or 'bookmark this.'"

### Dimension 6: Length Appropriateness

Is the content the right length for its channel and purpose?

Guidelines:
- X thread: 3-10 tweets (sweet spot: 5-7)
- X single tweet: 100-280 chars (sweet spot: 200-240)
- Blog post: 1500-2500 words for SEO, 800-1200 for thought leadership
- LinkedIn post: 500-1300 chars (sweet spot: 800-1000)
- Email: 200-500 words for newsletters, 50-150 for transactional
- Reddit: varies by subreddit, but substance over brevity

**PASS criteria:** Length serves the content. Nothing feels padded or cut short.
**FAIL example:** "This blog post is 600 words. For the SEO goal noted in your strategy, aim for 1500+."

### Dimension 7: Hook Strength

Would the first line/tweet/sentence make the ICP stop scrolling?

Check for:
- Opens with a specific, surprising, or relatable claim (not generic)
- Creates curiosity or recognition ("that's me" feeling)
- Avoids cliches ("In today's world...", "Have you ever...", "Let me tell you about...")
- Front-loads value -- doesn't bury the lead

**PASS criteria:** Reading only the first line, the ICP would want to read the second.
**FAIL example:** "Opens with 'Excited to announce...' -- nobody stops scrolling for your excitement. Lead with the benefit."

## Phase 4: Deliver the Verdict

Present the review as a scorecard:

```
## Content Review: {filename}

| Dimension | Verdict | Notes |
|-----------|---------|-------|
| Brand Voice | PASS/FAIL | {one-line summary} |
| Messaging Alignment | PASS/FAIL | {one-line summary} |
| ICP Targeting | PASS/FAIL | {one-line summary} |
| Channel Format | PASS/FAIL | {one-line summary} |
| CTA Clarity | PASS/FAIL | {one-line summary} |
| Length | PASS/FAIL | {one-line summary} |
| Hook Strength | PASS/FAIL | {one-line summary} |

**Overall: READY TO PUBLISH / NEEDS REVISION**
```

### If all 7 dimensions pass:

> "**READY TO PUBLISH.** This content is on-brand, on-strategy, and channel-appropriate.
>
> Quick sanity checks before hitting post:
> - Read it out loud one more time
> - Verify all links work
> - Double-check any specific numbers or claims
>
> When ready, use `/forbotsake-publish` to ship it."

### If any dimension fails:

Present the failures with specific edit suggestions. Not "make the hook better" -- provide an actual rewritten alternative.

> "**NEEDS REVISION.** {N} of 7 dimensions failed. Here are the specific fixes:
>
> **{Failed Dimension 1}:**
> Current: "{quote the problematic part}"
> Problem: {why it fails}
> Suggested fix: "{rewritten version}"
>
> **{Failed Dimension 2}:**
> Current: "{quote the problematic part}"
> Problem: {why it fails}
> Suggested fix: "{rewritten version}"
>
> Want me to apply these fixes? Or do you want to revise manually?"

Use AskUserQuestion with options:
A) Apply all suggested fixes
B) Apply some fixes (tell me which)
C) I'll revise manually
D) Override -- publish as-is (I disagree with the review)

If A or B: apply the edits to the content file using the Edit tool, then re-run the review on the updated version. Repeat until all dimensions pass or the user overrides.

If D: update the content file's frontmatter status to `reviewed-override` and proceed.

## Phase 5: Update Content Status

After the review is complete (pass or override), update the content file's frontmatter:

```bash
# Update status in frontmatter
```

Use the Edit tool to change `status: draft` to:
- `status: reviewed` if all dimensions passed
- `status: reviewed-override` if the user chose to override failures
- `status: revised` if edits were applied and the re-review passed

## Phase 6: Next Steps

Tell the user:

> "Review complete for `content/{filename}`.
>
> {If READY TO PUBLISH:}
> **Next step:** Use `/forbotsake-publish` to ship it.
>
> {If NEEDS REVISION and user chose to revise manually:}
> **Next step:** Edit the file, then run `/forbotsake-content-check` again.
>
> {If user wants to create more content:}
> **Create more:** `/forbotsake-create` to write your next piece from the calendar.
>
> {If no content calendar exists:}
> **Get organized:** `/forbotsake-content-plan` to build a content calendar
> so you always know what to write next."
