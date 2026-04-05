---
name: forbotsake-cmo-check
description: |
  Stage 2: CHALLENGE. Reads your strategy.md and ruthlessly evaluates it section by
  section. Rates positioning, ICP, channels, and messaging as weak/adequate/strong.
  Forces you to consider 2 alternative approaches you haven't explored. Scores overall
  readiness and suggests specific revisions.
  Use when: "review my strategy", "is my strategy good", "challenge my marketing",
  "CMO review", "strategy check", "poke holes in my plan", "what am I missing".
  Proactively invoke when the user has a strategy.md and asks for feedback or
  wants to improve their marketing approach.
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

# /forbotsake-cmo-check

The challenge step. A skeptical CMO reading your strategy before you waste time executing a weak plan.

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
  echo "STRATEGY_FOUND: yes"
  head -20 strategy.md
elif [ -f forbotsake-strategy.md ]; then
  echo "STRATEGY_FOUND: yes"
  echo "STRATEGY_FILE: forbotsake-strategy.md"
  head -20 forbotsake-strategy.md
else
  echo "STRATEGY_FOUND: no"
fi

# Check for session resume file
_SESSION_FILE="$FORBOTSAKE_HOME/cmo-check-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").json"
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

If `STRATEGY_FOUND` is `no`:

> "No strategy.md found. Run `/forbotsake-marketing-start` first to generate your strategy.
> I need something to challenge."

Stop here. Do not proceed without a strategy.

If `RESUME_AVAILABLE` is `yes`: "Found a previous CMO check in progress. Resume where you left off?"
Use AskUserQuestion with options: A) Resume, B) Start fresh.

## Phase 1: Read the Full Strategy

Read the entire strategy.md (or forbotsake-strategy.md). Parse out these sections:

1. **Positioning Statement**
2. **Ideal Customer Profile**
3. **Channel Strategy**
4. **Messaging Pillars**
5. **First 2-Week Experiment / First Move**

If any section is missing, note it as a gap. A missing section automatically scores "weak."

Also read the codebase context:
1. Read `README.md` (if exists)
2. Read `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, or equivalent
3. Run `git log --oneline -10` for recent activity context

This context lets you validate claims in the strategy against what the product actually does.

## Phase 2: Section-by-Section Evaluation

Rate each section as **WEAK**, **ADEQUATE**, or **STRONG** with specific rationale.

Present each rating ONE AT A TIME. After presenting, ask for the user's reaction before moving to the next.

### 2a: Positioning Statement

Evaluate against these criteria:
- **Specificity:** Does it name a real person (not a category)?
- **Differentiation:** Does "unlike [alternative]" name a real competitor or real behavior?
- **Benefit clarity:** Is the key benefit measurable or at least observable?
- **Forward test:** Would the ICP forward this sentence to a colleague?

Rate and explain:

> **Positioning: [WEAK/ADEQUATE/STRONG]**
>
> [2-3 sentences explaining the rating with specific examples from their text.
> Quote their words back to them when pointing out vagueness.]

Save rating to session file:
```bash
echo '{"section": "positioning", "rating": "RATING", "rationale": "RATIONALE"}' >> "$_SESSION_FILE"
```

### 2b: Ideal Customer Profile

Evaluate against these criteria:
- **Person vs. category:** Is it a specific person or a demographic bucket?
- **Pain specificity:** Is the pain point something you could observe in their day?
- **Current solution:** Do they name what the ICP uses NOW, even if it's manual/bad?
- **Trigger event:** Is there a clear moment when this person would search for a solution?

Rate and explain, same format as 2a.

### 2c: Channel Strategy

Evaluate against these criteria:
- **Score justification:** Are the channel scores backed by reasoning, or just vibes?
- **Focus:** Are they picking 1-2 channels, or spreading across 5+?
- **Format fit:** Does the content format match what the founder can actually produce?
- **Measurement:** Is there a clear success metric per channel?

Rate and explain, same format as 2a.

### 2d: Messaging Pillars

Evaluate against these criteria:
- **Proof points:** Does each pillar have evidence, or is it just claims?
- **Audience language:** Does it sound like the ICP talks, or like a marketer talks?
- **Hierarchy:** Is there a clear primary message, or are all three equally weighted?
- **Scroll-stop test:** Would any of these make the ICP stop scrolling?

Rate and explain, same format as 2a.

## Phase 3: Force Alternatives

This is the hardest part. The user is anchored on their current strategy. Break the anchor.

Present TWO alternative approaches the user has NOT considered. Each alternative should change at least one major axis (ICP, channel, or positioning).

Use AskUserQuestion to present them:

> "Before I give you an overall score, I want you to sit with two roads not taken.
> You don't have to change anything. But if you can't explain why your current
> approach is better than these, your strategy isn't ready.
>
> **Alternative A: [Different ICP or Channel]**
> What if instead of targeting [their ICP], you targeted [alternative ICP]?
> [2-3 sentences explaining why this could work, with specific reasoning.]
>
> **Alternative B: [Different Positioning or Channel]**
> What if instead of [their positioning/channel], you [alternative approach]?
> [2-3 sentences explaining why this could work, with specific reasoning.]
>
> Which of these (if either) makes you nervous? Nervousness usually means
> there's something worth exploring."

Wait for the user's response. Their reaction reveals conviction vs. default thinking.

Save their response:
```bash
echo '{"phase": "alternatives", "response": "USER_RESPONSE"}' >> "$_SESSION_FILE"
```

## Phase 4: Overall Readiness Score

Score the strategy on a scale of 1-10:

- **1-3: NOT READY.** Major gaps. Go back to `/forbotsake-marketing-start` and redo.
- **4-6: NEEDS WORK.** Foundation is there, but specific sections need revision before executing.
- **7-8: SOLID.** Ready to execute with minor tweaks. Proceed to content planning.
- **9-10: EXCEPTIONAL.** Rare. Move fast.

Present the score with a summary:

> **Overall Readiness: [X]/10**
>
> | Section | Rating | Key Issue |
> |---------|--------|-----------|
> | Positioning | [rating] | [one-line summary] |
> | ICP | [rating] | [one-line summary] |
> | Channels | [rating] | [one-line summary] |
> | Messaging | [rating] | [one-line summary] |
>
> **What's working:** [1-2 sentences on strongest elements]
>
> **What needs fixing before you execute:** [numbered list of specific revisions]

## Phase 5: Write Revisions

If the score is 6 or below, offer to update strategy.md directly:

> "Want me to apply the suggested revisions to strategy.md? I'll mark the changes
> so you can see what I modified."

Use AskUserQuestion with options: A) Apply revisions, B) I'll do it myself, C) Let's discuss first.

If they choose A, edit strategy.md with the specific improvements. Add a revision note in the frontmatter:

```markdown
---
schema_version: 1
generated_by: forbotsake
generated_at: {original timestamp}
cmo_check_at: {current ISO timestamp}
cmo_check_score: {X}/10
---
```

If the score is 7+, skip the revision offer and go directly to next steps.

## Phase 6: Next Steps

Tell the user:

> "Your strategy has been challenged. Here's where to go next:
>
> **If you want deeper research:**
> - `/forbotsake-spy` to analyze competitors and find messaging whitespace
> - `/forbotsake-icp` to build a detailed audience profile with real research
>
> **If you're ready to execute:**
> - `/forbotsake-content-plan` to build your content calendar
>
> The strongest move is usually research first, execute second. But if your
> score was 7+ and you're itching to ship, go straight to content planning."

## Cleanup

Remove the session file on successful completion:
```bash
rm -f "$_SESSION_FILE" 2>/dev/null
```
