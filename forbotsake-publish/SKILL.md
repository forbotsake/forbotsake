---
name: forbotsake-publish
description: |
  Stage 8: SHIP. Formats your content for a specific platform and gives you
  copy-paste-ready text. Handles X/Twitter threads, blog posts, and email campaigns.
  Logs everything published for retrospective analysis.
  Use when: "publish this", "format for twitter", "post to X", "ship this content",
  "format for blog", "send this email", "ready to publish".
  Proactively invoke when the user has content in content/ and says they want to ship it.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
---

# /forbotsake-publish

From draft to platform-ready. Format, publish, log.

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

# Orchestrated mode (invoked by forbotsake-go, propagated via file flag)
_ORCH_FILE="${FORBOTSAKE_HOME:-$HOME/.forbotsake}/orchestrated-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")"
FORBOTSAKE_ORCHESTRATED=$(cat "$_ORCH_FILE" 2>/dev/null || echo 0)
echo "ORCHESTRATED: $FORBOTSAKE_ORCHESTRATED"

# Check for strategy.md
if [ -f strategy.md ]; then
  echo "STRATEGY: yes"
else
  echo "STRATEGY: no"
  echo "WARNING: No strategy.md found. Run /forbotsake-marketing-start first."
fi

# Check for content directory
if [ -d content/ ]; then
  echo "CONTENT_DIR: yes"
  ls -1 content/ 2>/dev/null | head -20
else
  echo "CONTENT_DIR: no"
fi

# Check for published log
if [ -f published-log.md ]; then
  echo "PUBLISHED_LOG: yes"
  tail -5 published-log.md
else
  echo "PUBLISHED_LOG: no"
fi
```

If the preamble output shows `UPGRADE_AVAILABLE <old> <new>`: tell the user
"forbotsake v{new} is available (you're on v{old}). Run `/forbotsake-upgrade` to update."
Then continue with the skill normally. Do not block on the upgrade.

If the output shows `JUST_UPGRADED <old> <new>`: tell the user
"Running forbotsake v{new} (just updated!)." Then continue.

If `STRATEGY` is `no`: "No strategy.md found. You need positioning and channel strategy before publishing. Run `/forbotsake-marketing-start` first."
Stop here unless user insists.

If `CONTENT_DIR` is `no`: "No content/ directory found. Run `/forbotsake-create` to write your first piece, or point me to the content you want to publish."
Use AskUserQuestion to let the user provide content manually if they prefer.

## Phase 1: Select Content and Platform

**Orchestrated mode (`ORCHESTRATED` is `1`):**
- Auto-select content files: format ALL content files with `status: reviewed`, `status: revised`, or `status: reviewed-override` in frontmatter
- Auto-select platform from each file's `channel:` frontmatter field
- If a file has no channel specified, use the highest-scored channel from strategy.md
- Skip the content/platform selection AskUserQuestion
- In Phase 4: skip "Want me to format this for another platform too?" — just format and log
- After logging to published-log.md, update each published content file's frontmatter from `status: reviewed` (or `revised`/`reviewed-override`) to `status: published`. This prevents re-publish loops when forbotsake-go runs again.
- Skip Phase 5 (Next Steps) — the orchestrator handles what's next

**Interactive mode (`ORCHESTRATED` is `0`):**

Read `strategy.md` to understand the channel strategy and ICP.

Read all files in `content/` to see what's available.

Use AskUserQuestion:

> "Here's what I found in your content/ directory:
>
> {list each file with a one-line summary}
>
> Which piece do you want to publish? And which platform?
>
> Platforms I can format for:
> - **X/Twitter** (thread format, character limits enforced)
> - **Blog** (SEO-optimized, headline options, meta tags)
> - **Email** (subject lines, preview text, CTA)
> - **LinkedIn** (post format, hashtag strategy)
> - **Other** (tell me the platform and constraints)
>
> Pick a content piece and a platform."

If the user says "all platforms" or multiple platforms, format for each one sequentially. Start with the highest-scored channel from strategy.md.

## Phase 2: Format for Platform

### X/Twitter Thread Format

Read the knowledge framework for thread structure:
```bash
_SKILL_DIR=$(dirname "$(find ~/.claude/skills -path "*/forbotsake-publish/SKILL.md" -type f 2>/dev/null | head -1)")
echo "SKILL_DIR: $_SKILL_DIR"
```

Read `$_SKILL_DIR/../knowledge/frameworks/content-strategy.md` for X thread format guidelines.

Format the content as a numbered thread following these rules:

1. **Tweet 1 (The Hook):** Must stop the scroll. Lead with the most surprising, contrarian, or specific claim. No preamble. No "I've been thinking about..." Start with the insight. Must be under 280 characters.

2. **Tweets 2-N (The Body):** One idea per tweet. Each tweet must stand alone if someone screenshots it. Use line breaks for readability. Keep each under 280 characters.

3. **Final Tweet (The CTA):** What should the reader do? Follow, reply, check out the product, share? Be specific. Include the link if there is one.

Output format:
```
---
THREAD: {title}
Platform: X/Twitter
Tweets: {count}
Character counts: verified
---

1/ {hook tweet}
[{character count}/280]

2/ {body tweet}
[{character count}/280]

...

{N}/ {CTA tweet}
[{character count}/280]
```

Verify every tweet is under 280 characters. If any exceeds the limit, split or rewrite it. Do NOT deliver a thread with tweets over 280 characters.

### Blog Post Format

Format with full SEO structure:

```
---
BLOG POST: {title}
Platform: Blog
Word count: {count}
Reading time: {X} min
---

## SEO Meta
- **Title tag** (under 60 chars): {title}
- **Meta description** (under 155 chars): {description}
- **URL slug:** {slug}
- **Target keyword:** {keyword}
- **Secondary keywords:** {list}

## Headline Options
1. {headline option 1 - benefit-focused}
2. {headline option 2 - curiosity-driven}
3. {headline option 3 - specific/numbered}

## Featured Image Suggestions
- {description of image 1 - what to create or find}
- {description of image 2 - alternative option}

## Post Body

{formatted blog post with H2/H3 headers, short paragraphs, bold key phrases}

## Internal Links
- {suggest where to link to product, other content, etc.}
```

### Email Format

Format with multiple subject line options and clear structure:

```
---
EMAIL: {title}
Platform: Email
Word count: {count}
---

## Subject Line Options
1. {subject line 1} [{character count} chars]
2. {subject line 2} [{character count} chars]
3. {subject line 3} [{character count} chars]

## Preview Text
{the text that shows after the subject in inbox, under 90 chars}

## Email Body

{formatted email - short paragraphs, conversational, one clear ask}

## CTA
- **Primary CTA:** {button text} -> {URL or action}
- **Secondary CTA:** {text link or PS line}

## Send Time Suggestion
{best time to send based on audience from strategy.md}
```

### LinkedIn Post Format

Format for LinkedIn's algorithm and audience:

```
---
LINKEDIN POST: {title}
Platform: LinkedIn
Character count: {count}/3000
---

{hook line - must work as the "see more" preview}

{body - short paragraphs, line breaks between each, no walls of text}

{CTA or question to drive comments}

{3-5 relevant hashtags}
```

### Other Platform

Use AskUserQuestion to understand the platform's constraints (character limits, format, audience norms), then format accordingly.

## Phase 3: Quality Check

Before delivering the formatted content, verify:

1. **Character limits:** Every tweet under 280. Blog title under 60. Email subjects tested for length.
2. **ICP alignment:** Does this speak to the person defined in strategy.md? Would they stop scrolling?
3. **CTA present:** Every piece has a clear next action for the reader.
4. **No jargon leak:** The content uses the reader's language, not the builder's.
5. **Link placeholders:** If URLs are needed, mark them clearly as `[YOUR_LINK_HERE]` so nothing is missed.

If any check fails, fix it before presenting to the user.

## Phase 4: Deliver and Log

Present the formatted content to the user with:

> "Here's your {platform}-ready content. Copy-paste ready.
>
> {formatted content}
>
> Before you post, double-check:
> - [ ] Links are correct
> - [ ] Handle/username is right
> - [ ] Timing is good (see send time suggestion if applicable)
>
> Want me to format this for another platform too?"

### Log the Publication

Append to `published-log.md` in the project root. Create the file if it doesn't exist.

Format:
```markdown
## {date} - {platform}

- **Content:** {title or first line}
- **Source file:** {path to content file}
- **Format:** {thread/blog/email/linkedin/other}
- **Link:** {URL if user provides one, otherwise "pending"}
- **Notes:** {any relevant context}

---
```

If `published-log.md` doesn't exist, create it with a header:

```markdown
# Published Content Log

Track what was published, where, and when. Used by /forbotsake-retro for measurement.

---

{first entry}
```

## Phase 5: Next Steps

**Orchestrated mode (`ORCHESTRATED` is `1`):** Skip this phase entirely. Confirm: "Formatted and logged {N} pieces to published-log.md." Then stop.

**Interactive mode (`ORCHESTRATED` is `0`):** Tell the user:

> "Logged to published-log.md. Track results and run `/forbotsake-retro` next week
> to measure what worked and plan your next move.
>
> Want to format this for another platform? Or run `/forbotsake-create` to write
> the next piece in your content plan?"
