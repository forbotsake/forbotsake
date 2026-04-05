---
name: forbotsake-go
description: |
  One command, zero to published. Detects your marketing pipeline state and runs
  remaining stages automatically. If you have nothing, it starts from strategy.
  If you have strategy, it creates content. If you have content, it reviews and ships.
  Use when: "do marketing", "market this", "forbotsake-go", "I need to do marketing",
  "help me publish", "one-click marketing", "run the pipeline".
  Proactively invoke when the user expresses intent to do marketing but hasn't
  specified which forbotsake skill to use.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Skill
  - AskUserQuestion
---

# /forbotsake-go

One command. Zero to published.

## Preamble

```bash
FORBOTSAKE_HOME="${FORBOTSAKE_HOME:-$HOME/.forbotsake}"
mkdir -p "$FORBOTSAKE_HOME"

# Check for updates
_SKILL_DIR=$(dirname "$(find ~/.claude/skills -path "*/forbotsake-go/SKILL.md" -type f 2>/dev/null | head -1)" 2>/dev/null)
_FBS_ROOT=$(cd "${_SKILL_DIR}/.." 2>/dev/null && pwd || true)
_UPD=""
[ -n "$_FBS_ROOT" ] && [ -x "$_FBS_ROOT/bin/forbotsake-update-check" ] && _UPD=$("$_FBS_ROOT/bin/forbotsake-update-check" 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"

# Set orchestrated mode for sub-skills via file flag (env vars don't propagate across Skill tool invocations)
_ORCH_FLAG="$FORBOTSAKE_HOME/orchestrated-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")"
echo "1" > "$_ORCH_FLAG"
echo "ORCHESTRATED: 1"
echo "ORCH_FLAG: $_ORCH_FLAG"

# Fast mode propagation (skip adversarial gates)
# Env vars don't propagate across Skill tool invocations, so use file flag (same pattern as orchestrated mode)
FORBOTSAKE_FAST="${FORBOTSAKE_FAST:-0}"
_FAST_FLAG="$FORBOTSAKE_HOME/fast-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")"
if [ "$FORBOTSAKE_FAST" = "1" ]; then
  echo "1" > "$_FAST_FLAG"
  echo "NOTE: Fast mode active. Adversarial review gates will be skipped."
elif [ -f "$_FAST_FLAG" ]; then
  FORBOTSAKE_FAST=$(cat "$_FAST_FLAG" 2>/dev/null || echo 0)
fi
echo "FAST_MODE: $FORBOTSAKE_FAST"
echo "FAST_FLAG: $_FAST_FLAG"

# Pipeline state detection
echo "--- PIPELINE STATE ---"

# Strategy
if [ -f strategy.md ]; then
  echo "STRATEGY: exists"
  # Check if it has real content (not just a template)
  STRATEGY_LINES=$(wc -l < strategy.md 2>/dev/null | tr -d ' ')
  echo "STRATEGY_LINES: $STRATEGY_LINES"
elif [ -f forbotsake-strategy.md ]; then
  echo "STRATEGY: exists (forbotsake-strategy.md)"
  STRATEGY_LINES=$(wc -l < forbotsake-strategy.md 2>/dev/null | tr -d ' ')
  echo "STRATEGY_LINES: $STRATEGY_LINES"
else
  echo "STRATEGY: missing"
fi

# Content
if [ -d content ] && ls content/*.md 1>/dev/null 2>&1; then
  echo "CONTENT: exists"
  CONTENT_COUNT=$(ls -1 content/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "CONTENT_COUNT: $CONTENT_COUNT"
  # Check review status via frontmatter
  DRAFT_COUNT=$(grep -l -e 'status: draft' content/*.md 2>/dev/null | wc -l | tr -d ' ')
  HARD_FAILED_COUNT=$(grep -l -e 'status: hard-failed' content/*.md 2>/dev/null | wc -l | tr -d ' ')
  REVIEWED_COUNT=$(grep -l -e 'status: reviewed' -e 'status: revised' -e 'status: reviewed-override' content/*.md 2>/dev/null | wc -l | tr -d ' ')
  PUBLISHED_COUNT=$(grep -l -e 'status: published' content/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "DRAFT_COUNT: $DRAFT_COUNT"
  echo "HARD_FAILED_COUNT: $HARD_FAILED_COUNT"
  echo "REVIEWED_COUNT: $REVIEWED_COUNT"
  ls -1t content/*.md 2>/dev/null | head -5
else
  echo "CONTENT: missing"
fi

# Content calendar
[ -f content-calendar.md ] && echo "CALENDAR: exists" || echo "CALENDAR: missing"

# Published log
if [ -f published-log.md ]; then
  echo "PUBLISHED_LOG: exists"
  # Check what's been published
  PUBLISHED_FILES=$(grep -c 'Source file:' published-log.md 2>/dev/null || echo 0)
  echo "PUBLISHED_COUNT: $PUBLISHED_FILES"
else
  echo "PUBLISHED_LOG: missing"
fi

# State file for resume
_STATE_FILE="$FORBOTSAKE_HOME/go-state-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").md"
if [ -f "$_STATE_FILE" ]; then
  echo "RESUME: available"
  echo "STATE_FILE: $_STATE_FILE"
  cat "$_STATE_FILE"
else
  echo "RESUME: none"
fi

echo "--- END PIPELINE STATE ---"
```

**Recursion guard:** If `ORCHESTRATED` is already `1` (the flag file exists before this skill created it), this skill is being invoked recursively. Say: "forbotsake-go is already running. Skipping to avoid recursion." Then stop.

If preamble shows `UPGRADE_AVAILABLE <old> <new>`: read `$_FBS_ROOT/forbotsake-upgrade/SKILL.md`
and follow the "Inline upgrade flow" section Step 1 only. If upgrade proceeds, continue after.
If declined, continue with this skill immediately.

If `JUST_UPGRADED <old> <new>`: "Running forbotsake v{new} (just updated!)." Continue.

## Phase 1: Determine Starting Point

Based on the pipeline state, determine which stage to start from:

```
IF RESUME is available:
  → Read state file, resume from last completed stage
IF STRATEGY is missing:
  → Start at STAGE 1 (strategy)
ELIF CONTENT is missing:
  → Start at STAGE 3 (create)
ELIF HARD_FAILED_COUNT > 0 AND DRAFT_COUNT = 0 AND REVIEWED_COUNT = 0 (only hard-failed content, nothing else to process):
  → Tell user: "{HARD_FAILED_COUNT} content file(s) failed adversarial review.
    Run /forbotsake-create to rewrite, or /forbotsake-content-check to override."
  → Clean up flags before stopping:
    ```bash
    rm -f "$_ORCH_FLAG" "$_FAST_FLAG" 2>/dev/null
    ```
  → Stop. Do not proceed to publish with only hard-failed content.
ELIF HARD_FAILED_COUNT > 0 AND (DRAFT_COUNT > 0 OR REVIEWED_COUNT > 0):
  → Warn: "{HARD_FAILED_COUNT} file(s) are hard-failed (will be skipped). Processing remaining content."
  → Continue with drafts/reviewed content. Do not block the entire pipeline for unrelated files.
ELIF DRAFT_COUNT > 0 (unreviewed content exists):
  → Start at STAGE 4 (review)
ELIF REVIEWED_COUNT > 0 (reviewed but not published):
  → Start at STAGE 5 (publish + ship)
ELSE:
  → Everything is done. Suggest: "All content is published. Run /forbotsake-retro to measure results, or /forbotsake-create for new content."
```

Tell the user briefly where you're starting:
- "No strategy yet. Let's figure out your positioning first."
- "Found your strategy. Creating content..."
- "Found draft content. Reviewing it..."
- "Content is reviewed. Shipping it."

Do NOT show pipeline scores, percentages, or technical details. Just the status in plain language.

## Phase 2: Run Stages

Execute remaining stages in order. Between each stage, write the state file for crash recovery.

### STAGE 1: Strategy (if needed)

Invoke `/forbotsake-marketing-start` using the Skill tool.

The skill will run in orchestrated mode (FORBOTSAKE_ORCHESTRATED=1):
- If strategy.md already exists, it will skip and return immediately
- If not, it will ask the 5 strategy questions (these require human input)
- It will write strategy.md and return

After it returns, save state:
```bash
_STATE_FILE="${FORBOTSAKE_HOME:-$HOME/.forbotsake}/go-state-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").md"
echo "stage: strategy-complete" > "$_STATE_FILE"
echo "timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$_STATE_FILE"
```

Brief transition: "Strategy done. Now let's create some content."

### STAGE 2: Content Calendar (skip — optional)

Do NOT run forbotsake-content-plan. It's optional and adds friction. The orchestrator
should get to published content as fast as possible. If no calendar exists, forbotsake-create
will work without one.

### STAGE 3: Create Content (if needed)

Invoke `/forbotsake-create` using the Skill tool.

The skill will run in orchestrated mode:
- Auto-selects channel and topic from calendar or strategy
- Still shows the draft for user approval (this is the high-value interaction)
- Writes to content/ and returns

After it returns, save state:
```bash
_STATE_FILE="${FORBOTSAKE_HOME:-$HOME/.forbotsake}/go-state-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").md"
echo "stage: create-complete" > "$_STATE_FILE"
echo "timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$_STATE_FILE"
echo "content_files: $(ls -1t content/*.md 2>/dev/null | head -3 | tr '\n' ',')" >> "$_STATE_FILE"
```

Brief transition: "Content created. Checking quality..."

### STAGE 4: Review Content (if needed)

Invoke `/forbotsake-content-check` using the Skill tool.

The skill will run in orchestrated mode:
- Auto-selects draft content files
- Runs the 7-dimension review
- Auto-applies fixes if any dimensions fail
- Updates frontmatter status and returns

After it returns, save state:
```bash
_STATE_FILE="${FORBOTSAKE_HOME:-$HOME/.forbotsake}/go-state-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").md"
echo "stage: review-complete" > "$_STATE_FILE"
echo "timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$_STATE_FILE"
```

Brief transition: "Content reviewed. Formatting for publishing..."

### STAGE 5: Publish + Ship

**5A: Format for platform**

Invoke `/forbotsake-publish` using the Skill tool.

The skill will run in orchestrated mode:
- Auto-selects reviewed content and target platform
- Formats and logs to published-log.md
- Returns with formatted content

**5B: Git workflow (inline — no sub-skill needed)**

After publish completes:

```bash
# Stage marketing files (only .md files from content/, not binaries or other artifacts)
git add strategy.md content/*.md published-log.md content-calendar.md 2>/dev/null
git add forbotsake-strategy.md forbotsake-content-calendar.md 2>/dev/null

# Check if there are changes to commit
if ! git diff --cached --quiet 2>/dev/null; then
  echo "STAGED_CHANGES: yes"
else
  echo "STAGED_CHANGES: no"
fi

_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "GIT_BRANCH: $_BRANCH"
```

If `STAGED_CHANGES` is `yes`:
- Generate commit message: `marketing: [brief description of content created]`
- Commit using heredoc for safe quoting: `git commit -m "$(cat <<'EOF'\nmarketing: [description]\nEOF\n)"`
- Push: `git push` (if remote exists)
- If push fails: "Committed locally. Push when ready: `git push`"
- If `GIT_BRANCH` is NOT `main` and NOT `master`: `gh pr create --fill --draft 2>/dev/null || true` (silently, don't block if fails or PR already exists)

If no changes: skip git steps silently.

After git, save state:
```bash
_STATE_FILE="${FORBOTSAKE_HOME:-$HOME/.forbotsake}/go-state-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").md"
echo "stage: shipped" > "$_STATE_FILE"
echo "timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$_STATE_FILE"
```

## Phase 3: Done

Show the founder three things:

1. **What was created:** List content files written
2. **Copy-paste content:** The platform-formatted content (already displayed by forbotsake-publish)
3. **Git status:** "Committed and pushed to {branch}." (or "Committed locally.")

Then:

> "That's it. Your content is ready to post.
>
> Run `/forbotsake-retro` next week to see what worked."

Clean up state file and orchestrated flag:
```bash
_STATE_FILE="${FORBOTSAKE_HOME:-$HOME/.forbotsake}/go-state-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").md"
_ORCH_FLAG="${FORBOTSAKE_HOME:-$HOME/.forbotsake}/orchestrated-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")"
_FAST_FLAG="${FORBOTSAKE_HOME:-$HOME/.forbotsake}/fast-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")"
rm -f "$_STATE_FILE" "$_ORCH_FLAG" "$_FAST_FLAG" 2>/dev/null
```

## Dry Run Mode

If the user says `--dry-run` or "what would you do":

Run Phase 1 (pipeline detection) only. Show:
- Current pipeline state
- Which stages would run
- Estimated time

Do NOT invoke any sub-skills.

## Error Handling

- **Sub-skill fails or user cancels mid-stage:** Save state file with last completed stage. Tell user: "Saved progress. Run `/forbotsake-go` again to continue from where you left off."
- **Context window running low:** Save state file. Tell user: "Session getting long. Run `/forbotsake-go` again to continue — I'll pick up where we left off."
- **No git remote:** Skip push silently. Content is still created and formatted.
- **Strategy questions take too long:** State file saves after strategy is written. If session ends during questions, the resume file from forbotsake-marketing-start handles it.
