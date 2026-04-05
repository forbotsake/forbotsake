---
name: forbotsake-create
description: |
  Writes actual marketing content -- X threads, blog posts, emails, LinkedIn posts, and more.
  Reads your strategy.md and content-calendar.md, asks what piece to create, then generates
  channel-tailored content using your positioning, ICP, and messaging pillars.
  Use when: "write a thread", "create content", "write a blog post", "draft an email",
  "LinkedIn post", "write marketing copy", "create a tweet", "help me write", "content piece".
  Proactively invoke when the user asks to write or draft any marketing content and a
  strategy.md exists.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
  - WebSearch
---

# /forbotsake-create

Write the actual content. Not templates. Not frameworks. Real content ready to publish.

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

# Check for content-calendar.md
if [ -f content-calendar.md ]; then
  echo "CALENDAR_EXISTS: yes"
elif [ -f forbotsake-content-calendar.md ]; then
  echo "CALENDAR_EXISTS: yes"
  echo "CALENDAR_FILE: forbotsake-content-calendar.md"
else
  echo "CALENDAR_EXISTS: no"
fi

# Check for existing content directory
if [ -d content ]; then
  echo "CONTENT_DIR: exists"
  ls -1t content/ 2>/dev/null | head -5
else
  echo "CONTENT_DIR: missing"
fi

# Today's date for file naming
echo "TODAY: $(date +%Y-%m-%d)"

# Multi-modal: check for brand.md
if [ -f brand.md ]; then
  echo "BRAND_EXISTS: yes"
  head -3 brand.md
else
  echo "BRAND_EXISTS: no"
fi

# Multi-modal: check for media-providers.md (or auto-detect)
if [ -f media-providers.md ]; then
  echo "PROVIDERS_EXISTS: yes"
else
  echo "PROVIDERS_EXISTS: no"
  # Auto-detect available providers
  echo "--- PROVIDER DETECTION ---"
  command -v bun >/dev/null 2>&1 && echo "SATORI_AVAILABLE: yes (bun)" || { command -v node >/dev/null 2>&1 && echo "SATORI_AVAILABLE: yes (node)" || echo "SATORI_AVAILABLE: no"; }
  echo "CHROME_MCP: check-at-runtime"
  [ -n "${NANO_BANANA_API_KEY:-}" ] && echo "NANO_BANANA_API: yes" || echo "NANO_BANANA_API: no"
  [ -n "${SEEDANCE_API_KEY:-}" ] && echo "SEEDANCE_API: yes" || echo "SEEDANCE_API: no"
  echo "--- END DETECTION ---"
fi

# Orchestrated mode (invoked by forbotsake-go, propagated via file flag)
_ORCH_FILE="${FORBOTSAKE_HOME:-$HOME/.forbotsake}/orchestrated-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")"
FORBOTSAKE_ORCHESTRATED=$(cat "$_ORCH_FILE" 2>/dev/null || echo 0)
echo "ORCHESTRATED: $FORBOTSAKE_ORCHESTRATED"

# Check for session resume file
_SESSION_FILE="$FORBOTSAKE_HOME/session-create-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").json"
if [ -f "$_SESSION_FILE" ]; then
  echo "RESUME_AVAILABLE: yes"
  echo "SESSION_FILE: $_SESSION_FILE"
else
  echo "RESUME_AVAILABLE: no"
fi
```

If output shows `UPGRADE_AVAILABLE <old> <new>`: read the forbotsake-upgrade SKILL.md
at `$_FBS_ROOT/forbotsake-upgrade/SKILL.md` (where `_FBS_ROOT` is the variable already
resolved in the preamble bash above) and follow the "Inline upgrade flow" section **Step 1
only**. If Step 1 results in "Yes" or "Always" (proceed with upgrade), continue through
Steps 2-7 of the inline flow. If Step 1 results in "Not now" or "Never" (declined),
skip Steps 2-7 entirely and continue with this skill immediately.

If output shows `JUST_UPGRADED <old> <new>`: tell user
"Running forbotsake v{new} (just updated from v{old})!" and continue.

If `STRATEGY_EXISTS` is `no`:

> "No strategy.md found. You need a strategy before creating content -- otherwise
> you're writing into the void.
> Run `/forbotsake-marketing-start` first to define your positioning, ICP, and channels."

Stop here. Do NOT proceed without a strategy.

If `CALENDAR_EXISTS` is `no`, note it but proceed:

> "No content-calendar.md found. That's OK -- we can create content without a calendar.
> But if you want a structured plan first, run `/forbotsake-content-plan`.
> Otherwise, let's pick what to write."

If `RESUME_AVAILABLE` is `yes` AND `ORCHESTRATED` is `0`: "Found a previous session in progress. Resume where you left off?"
Use AskUserQuestion with options: A) Resume, B) Start fresh.
If `ORCHESTRATED` is `1` and `RESUME_AVAILABLE` is `yes`: ignore the resume file and start fresh.

## Phase 0.5: Media Provider Setup

If `PROVIDERS_EXISTS` is `no`, auto-generate `media-providers.md` based on detected capabilities:

Read the provider framework:
```bash
_SKILL_DIR=$(dirname "$(find ~/.claude/skills -path "*/forbotsake-marketing-start/SKILL.md" -type f 2>/dev/null | head -1)")
echo "SKILL_DIR: $_SKILL_DIR"
```
Read `$_SKILL_DIR/../knowledge/frameworks/media-providers.md` for the schema.

Write `media-providers.md` to the project root with detected providers enabled/disabled based on preamble detection output. If no providers are available, write the config with all disabled and `fallback: prompt-only`. Tell the user: "Created media-providers.md. Visual prompts will be saved for manual generation. Install bun/node for text-cards, or Claude for Chrome extension for AI images."

If `PROVIDERS_EXISTS` is `yes`, read it to know which providers are available.

## Phase 1: Absorb the Strategy

Read `strategy.md` completely. Extract and internalize:

1. **Positioning statement** -- the core "For X, product is Y that Z" framing
2. **ICP** -- person, title, pain, current solution, where they hang out
3. **Channel strategy** -- ranked channels with rationale
4. **Messaging pillars** -- the 3 claims with proof points
5. **Brand voice** -- if defined, note the tone (if not defined, default to: direct, specific, no jargon, conversational)

If `brand.md` exists, read it and extract:
- Color palette (primary, accent, background, text)
- Visual style (mood, image_type, avoid list)
- Prompt prefix for image generation
- If brand.md is missing, visual generation still works but uses neutral defaults

### Reviewer Notes Check

Check if there are previous reviewer notes from a HARD_FAIL or SOFT_FAIL in
/forbotsake-content-check. If the user is re-creating content after a failed review,
the content file may have `reviewer_notes:` in its frontmatter.

If the user specified a content file to rewrite, read its frontmatter. If `reviewer_notes:`
exists, extract the findings and use them as constraints for this creation session:

> "I found reviewer notes from a previous review. I'll avoid these issues:
> {for each reviewer note: dimension and fix suggestion}"

Incorporate these constraints into the content generation. Do not repeat the patterns
the reviewer flagged.

If `content-calendar.md` exists, read it and extract:
- Current week's theme and messaging pillar focus
- Specific content slots that haven't been created yet
- Format templates for the relevant content types
- Suggested visual treatment per content piece (if present)

## Phase 2: Choose What to Create

**Orchestrated mode (`ORCHESTRATED` is `1`):** Auto-select the content piece:
- If content calendar exists with unfilled slots: pick the next unfilled slot (earliest date, highest-priority channel)
- If no calendar: default to X/Twitter thread (highest reach for technical founders)
- Auto-select topic from the first messaging pillar that hasn't been covered in existing content/ files
- Skip all AskUserQuestion prompts in this phase — proceed directly to Phase 3 with the auto-selected channel and topic
- Briefly note: "Creating: {channel} about {topic} (auto-selected from your calendar/strategy)"

**Interactive mode (`ORCHESTRATED` is `0`):** Follow the normal flow below.

If a content calendar exists and has upcoming slots, present them:

> "From your content calendar, here's what's next:
>
> 1. {Day} - {Channel}: {Content type} about {topic} (Week {N}: {theme})
> 2. {Day} - {Channel}: {Content type} about {topic}
> 3. {Day} - {Channel}: {Content type} about {topic}
>
> Pick one, or tell me what else you want to create."

If no calendar, ask via AskUserQuestion:

> "What content piece do you want to create?
>
> A) X/Twitter thread
> B) X/Twitter single tweet or tweet storm
> C) Blog post
> D) LinkedIn post
> E) Email / newsletter
> F) Reddit post or comment
> G) Hacker News Show HN post
> H) Product Hunt launch copy
> I) Something else -- describe it"

**Session save after answer:**
```bash
echo '{"phase": "content_choice", "channel": "CHANNEL", "type": "TYPE"}' >> "$_SESSION_FILE"
```

Follow up via AskUserQuestion:

> "What specific topic or angle? Here are suggestions based on your messaging pillars:
>
> From Pillar 1 ({pillar 1}):
> - {topic idea A}
> - {topic idea B}
>
> From Pillar 2 ({pillar 2}):
> - {topic idea C}
> - {topic idea D}
>
> From Pillar 3 ({pillar 3}):
> - {topic idea E}
>
> Or tell me your own topic."

**Session save after answer:**
```bash
echo '{"phase": "topic_choice", "topic": "TOPIC"}' >> "$_SESSION_FILE"
```

## Phase 3: Generate the Content

Create the content tailored to ALL of these simultaneously:

1. **The positioning** from strategy.md -- every piece should reinforce what makes this product different
2. **The ICP** from strategy.md -- write as if speaking directly to that one person
3. **The channel's format and norms** -- respect platform conventions:
   - X threads: hook in tweet 1, value in the middle, CTA at the end. Each tweet stands alone. 280 chars max per tweet.
   - X single tweets: punchy, one insight, optional image/link. Under 280 chars.
   - Blog posts: scannable headers, actionable, 1500-2500 words for SEO, clear structure (problem > insight > solution > CTA).
   - LinkedIn posts: story-driven, first 2 lines are the hook (before "see more"), 1300 char max, line breaks between paragraphs, no hashtag spam (3 max).
   - Email: subject line that creates curiosity, preview text, personal tone, single CTA, short paragraphs.
   - Reddit: genuine value first, product mention only if natural, match subreddit tone, no overt selling.
   - Hacker News: technical substance, no marketing speak whatsoever, Show HN format if launching.
   - Product Hunt: tagline (60 chars), description (260 chars), first comment (the story), maker comment.
4. **The messaging pillars** -- the content should embody at least one pillar without being preachy about it
5. **Format template** from content-calendar.md if one exists for this content type

### Content Generation Rules

- **No corporate speak.** If it sounds like it was written by a committee, rewrite it.
- **Specific > generic.** "Reduced API response time from 2.3s to 140ms" beats "faster performance."
- **ICP language.** Use the words your ICP uses, not marketing words.
- **One CTA per piece.** Don't ask them to follow, subscribe, buy, AND share. Pick one.
- **Hook hard.** The first line/tweet/sentence determines whether anyone reads the rest.

Present the full draft to the user inline first, then ask:

> "Here's the draft. Read it through, then tell me:
>
> A) Ship it -- write to file as-is
> B) Adjust the tone (more casual / more professional / more technical)
> C) Change the hook -- it's not grabbing me
> D) Shorter / longer
> E) Specific feedback -- tell me what to change"

Use AskUserQuestion. Iterate until the user says "ship it."

## Phase 3.5: Visual Treatment Decision

After the text content is drafted and approved, decide what visual treatment this content needs.

**Read the visual strategy framework:**
```bash
_SKILL_DIR=$(dirname "$(find ~/.claude/skills -path "*/forbotsake-marketing-start/SKILL.md" -type f 2>/dev/null | head -1)")
```
Read `$_SKILL_DIR/../knowledge/frameworks/visual-strategy.md` for the decision matrix.

**Decision logic:**
- `none`: hot takes, replies, technical deep-dives, short threads (<280 chars), quick tips, HN posts
- `text-card`: stat highlights ("2.3x faster"), quote cards, key takeaways, listicle items, comparison tables. Use when the content IS the visual.
- `ai-image`: launch announcements, storytelling posts, blog headers, Product Hunt assets. Use when the visual adds meaning beyond text (a metaphor, a scene, an emotion).
- `video`: product demos, launch teasers, explainer shorts. Use for high-impact launch content or when showing the product in action.

**Channel defaults:**
- X/Twitter thread: `ai-image` for hero (tweet 1), `none` for other tweets
- X/Twitter single: `text-card` if stat/quote, `ai-image` if storytelling, `none` if hot take
- LinkedIn: `ai-image` or `text-card` (LinkedIn posts with images get 2x engagement)
- Blog: `ai-image` for featured/OG image
- Product Hunt: `ai-image` for gallery
- Email: `none` or `text-card` (optional)
- Reddit/HN: `none` (these platforms value text over visuals)

Generate the `visual_prompt` by combining:
1. A summary of what the content is about (1 sentence)
2. The brand.md `prompt_prefix` (style, colors, mood)
3. Channel-specific style cues (e.g., "wide format 1200x675" for X)

Generate `visual_alt` accessibility text describing the image concept.

**Interactive mode:** Tell the user the visual treatment decision and why. If they disagree, let them override.
**Orchestrated mode:** Auto-decide and proceed.

## Phase 3.6: Visual Generation

If `visual_treatment` is `none`, skip this phase.

If `visual_treatment` is `text-card`:
1. Check if `local-satori` provider is available in media-providers.md
2. If available: run `bun run $_SKILL_DIR/../bin/src/satori-card.ts --content {content_file} --brand brand.md --output content/{date}-{channel}-{slug}-visual-1.png --type {quote|stat|title|takeaway} --dimensions {channel-appropriate dimensions}`
3. If not available: save the text-card spec in frontmatter for manual creation. Note: "Text-card generation requires bun or node. Install with: `curl -fsSL https://bun.sh/install | bash`"

If `visual_treatment` is `ai-image`:
1. Check media-providers.md for enabled ai-image provider
2. **Gemini browser path:**
   - Echo: "Generating image via Gemini... (this takes 30-60 seconds)"
   - Navigate to `https://gemini.google.com` via Chrome automation
   - Check if logged in (look for compose area). If login wall: warn, fall back to prompt-only
   - Type the `visual_prompt` into compose area
   - Wait for image generation (poll for image element, timeout 60s)
   - Extract image as base64 via `javascript_tool`: find the generated image element, draw it to a canvas, call `canvas.toDataURL('image/png')`, decode and save to content/ directory
   - Echo: "Image generated. Saved: content/{filename}-visual-1.png"
   - Show the image to the user (Read tool displays images)
3. **Nano Banana API path:**
   - Call the Gemini API with the visual_prompt
   - Save response image to content/ directory
4. **Prompt-only fallback:** Save visual_prompt in frontmatter, skip generation

**Image review flow (interactive mode only):**

After generating the image, show it and ask via AskUserQuestion:

> "Here's the generated image for your {channel} post."
>
> A) Use this image
> B) Regenerate with a different prompt (I'll refine it)
> C) Switch to text-card instead
> D) Skip visual for this post

Max 3 regeneration attempts. On 4th attempt, fall back to the best one or skip.

**Orchestrated mode:** Auto-accept the first generated image. If generation fails, set `visual_status: failed` and continue.

If `visual_treatment` is `video`:
1. Check media-providers.md for enabled video provider
2. **Veo browser path:** Navigate to Veo, submit video prompt, note that video generation takes 2-5 minutes. In orchestrated mode, continue pipeline and note video is pending.
3. **Seedance API path:** Submit API request, poll for completion.
4. **Prompt-only fallback:** Save video prompt for manual creation.
5. Save video as `content/{date}-{channel}-{slug}-video-1.mp4`

## Phase 4: Write to File

Create the content directory if it doesn't exist:
```bash
mkdir -p content
```

Write to `content/{date}-{channel}-{topic-slug}.md` with this schema:

```markdown
---
schema_version: 2
generated_by: forbotsake
generated_at: {ISO timestamp}
channel: {x-thread|x-tweet|blog|linkedin|email|reddit|hackernews|producthunt}
status: draft
messaging_pillar: {which pillar this content supports}
topic: {topic description}
estimated_publish_date: {from calendar if available, else blank}
visual_treatment: {none|text-card|ai-image|video}
visual_prompt: "{the prompt used or to be used for generation}"
visual_placement: {hero|inline|thumbnail}
visual_count: {number of visuals, default 1}
visual_status: {generated|failed|pending|skipped}
visual_alt: "{accessibility description of the visual}"
visual_provider: "{provider name used, e.g., gemini-browser, local-satori}"
---
# {Content Title}

Channel: {channel}
Type: {content type}
Target: {ICP description from strategy.md}

---

{THE ACTUAL CONTENT}

---

## Publishing Notes

- **Best time to post:** {channel-specific recommendation}
- **Hashtags/tags:** {if applicable, 3-5 relevant ones}
- **CTA:** {the single call-to-action in this piece}
- **Thread to conversation:** {what topic to engage on if people reply}
- **Metrics to watch:** {what to measure for this specific piece}
- **Visual:** {visual_treatment} via {provider} — {path to visual file or "prompt-only"}
```

Confirm the file was written:

> "Content written to `content/{filename}`.
>
> **Before publishing**, run `/forbotsake-content-check` to verify it's on-brand
> and on-strategy. It catches things like messaging drift and weak CTAs."

## Phase 5: Self-Test

After writing the file, read it back and verify:

1. Does the content actually address the ICP's pain point? Not a generic audience -- THE person from strategy.md.
2. Is the hook strong enough? Would this person stop scrolling?
3. Does the CTA make sense for where this person is in the funnel? (Awareness content shouldn't ask for a purchase.)
4. Is the length appropriate for the channel? (A 15-tweet thread is too long. A 200-word blog post is too short.)
5. Is the content free of jargon the ICP wouldn't use?

If any check fails, tell the user what's weak before confirming the file write.

## Phase 6: Next Steps

**Orchestrated mode (`ORCHESTRATED` is `1`):** Skip this phase entirely. Do NOT suggest next skills or show the checklist. The orchestrator (forbotsake-go) handles what comes next. Simply confirm: "Content written to `content/{filename}`." Then stop.

**Interactive mode (`ORCHESTRATED` is `0`):** Tell the user:

> "Content is ready at `content/{filename}`.
>
> **Next step:** `/forbotsake-content-check` to review it against your brand voice,
> messaging pillars, and channel format before publishing.
>
> **Quick checklist before you post:**
> - [ ] Read it out loud -- does it sound like you?
> - [ ] Check for typos (AI-generated content sometimes has subtle weirdness)
> - [ ] Make sure any links work
> - [ ] If there's an image/visual needed, create it
>
> After publishing, track the metrics in the Publishing Notes section."

## Cleanup

Remove the session file on successful completion:
```bash
rm -f "$_SESSION_FILE" 2>/dev/null
```
