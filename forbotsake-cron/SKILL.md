---
name: forbotsake-cron
description: |
  Autopilot mode for forbotsake. Installs a cron job that auto-posts reviewed content
  on schedule using Claude Code + Chrome. Content-calendar.md drives the timing.
  Subcommands: install, status, uninstall, pause, resume, doctor, run-now.
  Use when: "auto-post", "schedule posts", "autopilot", "cron", "forbotsake-cron",
  "schedule my content", "post without me", "autonomous posting".
  Proactively invoke when the user wants content posted on a schedule without
  being present for each post.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
  - mcp__claude-in-chrome__tabs_context_mcp
  - mcp__claude-in-chrome__tabs_create_mcp
  - mcp__claude-in-chrome__navigate
  - mcp__claude-in-chrome__read_page
  - mcp__claude-in-chrome__get_page_text
  - mcp__claude-in-chrome__find
  - mcp__claude-in-chrome__computer
---

# /forbotsake-cron

Autopilot mode. Your content posts itself.

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
```

```bash

# Check prerequisites
echo "--- PREREQUISITES ---"

# Chrome
if pgrep -x "Google Chrome" > /dev/null 2>&1 || pgrep -f "Google Chrome Canary" > /dev/null 2>&1; then
  echo "CHROME: running"
else
  echo "CHROME: not running"
fi

# Content calendar
if [ -f content-calendar.md ]; then
  echo "CALENDAR: yes"
  # Check for scheduled_datetime column
  if grep -q "scheduled_datetime" content-calendar.md 2>/dev/null; then
    echo "CALENDAR_SCHEMA: v2 (has scheduled_datetime)"
  else
    echo "CALENDAR_SCHEMA: v1 (missing scheduled_datetime)"
  fi
else
  echo "CALENDAR: no"
fi

# Reviewed content
if [ -d content ] && grep -rl 'status: reviewed\|status: revised\|status: reviewed-override' content/*.md 2>/dev/null | head -1 > /dev/null; then
  REVIEWED=$(grep -rl 'status: reviewed\|status: revised\|status: reviewed-override' content/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "REVIEWED_CONTENT: $REVIEWED files"
else
  echo "REVIEWED_CONTENT: 0"
fi

# Cron status
if crontab -l 2>/dev/null | grep -q "forbotsake-cron"; then
  echo "CRON: installed"
else
  echo "CRON: not installed"
fi

# Pause status
if [ -f "$FORBOTSAKE_HOME/cron-paused" ]; then
  echo "PAUSED: yes"
else
  echo "PAUSED: no"
fi

# Cron script location
_CRON_SCRIPT="$_FBS_ROOT/bin/forbotsake-cron"
if [ -x "$_CRON_SCRIPT" ]; then
  echo "CRON_SCRIPT: $_CRON_SCRIPT"
else
  echo "CRON_SCRIPT: not found"
fi

echo "--- END PREREQUISITES ---"
```

## Subcommand Detection

Parse the user's input to determine which subcommand to run:

- "install", "set up", "enable autopilot" -> **install**
- "status", "how's it going", "what's scheduled" -> **status**
- "uninstall", "remove", "disable" -> **uninstall**
- "pause", "stop for now" -> **pause**
- "resume", "unpause", "start again" -> **resume**
- "doctor", "check", "diagnose", "is it working" -> **doctor**
- "run now", "post now", "trigger", "test" -> **run-now**
- No subcommand specified -> show status + suggest install if not installed

## Install

### Prerequisites Check

If `CHROME` is `not running`: "Chrome must be running with the Claude for Chrome extension. Open Chrome and try again."

If `CALENDAR` is `no`: "No content-calendar.md found. Run `/forbotsake-content-plan` first to create a calendar with scheduled dates."

If `CALENDAR_SCHEMA` is `v1`: "Your content-calendar.md doesn't have `scheduled_datetime` columns yet. Run `/forbotsake-content-plan` to regenerate with scheduling support, or add the column manually. Format: `2026-04-07T10:00:00-07:00` (ISO 8601 with timezone offset)."

If `REVIEWED_CONTENT` is `0`: "No reviewed content found. Run `/forbotsake-create` then `/forbotsake-content-check` to create and review content first."

### Chrome Verification

1. Use `mcp__claude-in-chrome__tabs_context_mcp` to verify Chrome MCP connectivity
2. Navigate to the primary posting platform (X or LinkedIn) to verify login status
3. Report which account is logged in

### Dry Run

Run the cron script in dry-run mode to validate everything works:

```bash
"$_CRON_SCRIPT" --dry-run "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
```

Show the output to the user.

### Authorization

Use AskUserQuestion:

> "Autopilot will auto-post all reviewed content from your content-calendar.md on schedule.
>
> What I verified:
> - Chrome: connected, logged in as {handle} on {platform}
> - Calendar: {N} posts scheduled
> - Content: {N} reviewed pieces ready
>
> This grants blanket posting authorization for reviewed content only.
> Draft or unreviewed content is never posted. You can pause anytime
> with `/forbotsake-cron pause`.
>
> Ready to enable autopilot?"

Options: A) Enable autopilot, B) Not yet

If A:

### Write Crontab

```bash
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
CRON_SCRIPT="$_FBS_ROOT/bin/forbotsake-cron"
CLAUDE_BIN="$(which claude 2>/dev/null || echo claude)"
PYTHON3_BIN="$(which python3 2>/dev/null || echo python3)"

# Write config (captures full paths from interactive shell for cron's minimal PATH)
cat > "$FORBOTSAKE_HOME/cron.config" << EOF
project_root=$PROJECT_ROOT
catch_up_policy=skip
cron_interval_min=30
claude_bin=$CLAUDE_BIN
python3_bin=$PYTHON3_BIN
EOF

# Add to crontab (preserving existing entries safely)
# Distinguish "no crontab" from real errors
CRONTAB_ERR=$(crontab -l 2>&1 >/dev/null) || true
if echo "$CRONTAB_ERR" | grep -qi "no crontab"; then
  # No existing crontab, safe to write fresh
  EXISTING=""
elif [ -n "$CRONTAB_ERR" ]; then
  echo "ERROR: Could not read crontab: $CRONTAB_ERR"
  echo "  Fix: check crontab permissions and retry."
  exit 1
else
  # Existing crontab, remove only THIS project's forbotsake-cron entry (not other projects)
  EXISTING=$(crontab -l 2>/dev/null | grep -v "$PROJECT_ROOT.*forbotsake-cron\|forbotsake-cron.*$PROJECT_ROOT")
fi
# Quote paths in crontab entry to handle spaces
echo "${EXISTING:+$EXISTING
}*/30 * * * * \"$CRON_SCRIPT\" \"$PROJECT_ROOT\" >> \"$FORBOTSAKE_HOME/cron.log\" 2>&1" | crontab -

echo "CRON_INSTALLED"
```

Confirm: "Autopilot enabled. Cron runs every 30 minutes. Your next scheduled post will go out automatically. Run `/forbotsake-cron status` to check."

## Status

Run the status command:

```bash
"$_CRON_SCRIPT" --status "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" 2>/dev/null || echo "Status check failed"
```

Show the output to the user.

## Uninstall

```bash
# Remove from crontab
EXISTING=$(crontab -l 2>/dev/null | grep -v "forbotsake-cron" || true)
echo "$EXISTING" | crontab -
# Clean up lockfile (uses same hash as bin/forbotsake-cron)
_PROJ_HASH=$(echo "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" | md5 2>/dev/null | cut -c1-8 || basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
rm -f "/tmp/forbotsake-cron-${_PROJ_HASH}.lock"
# Keep config and logs (user data)
echo "CRON_REMOVED"
```

Confirm: "Autopilot disabled. Your config and logs are preserved at ~/.forbotsake/. Reviewed content won't be auto-posted. Run `/forbotsake-cron install` to re-enable."

## Pause / Resume

```bash
# Pause
touch "$FORBOTSAKE_HOME/cron-paused"
```

"Autopilot paused. Content won't auto-post until you resume. Run `/forbotsake-cron resume` when ready."

```bash
# Resume
rm -f "$FORBOTSAKE_HOME/cron-paused"
```

"Autopilot resumed. Next scheduled post will go out on time."

## Doctor

Run a health check:

1. **Cron installed?** Check `crontab -l`
2. **Chrome running?** Check process
3. **Chrome MCP connected?** Try `mcp__claude-in-chrome__tabs_context_mcp`
4. **Calendar exists?** Check file
5. **Calendar has scheduling?** Check for `scheduled_datetime` column
6. **Reviewed content?** Check frontmatter status
7. **Paused?** Check pause file
8. **Recent errors?** Check error log
9. **claude binary accessible?** Check path

For each check, show pass/fail with fix instructions if failed.

## Run Now

Force one tick immediately:

```bash
"$_CRON_SCRIPT" --run-now "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
```

If the script says "No posts due right now", tell the user. Suggest running `bin/forbotsake-cron --dry-run` to see upcoming scheduled posts, or manually posting via `/forbotsake-publish`.

## Tick Mode (called by cron, not interactive)

When this skill is invoked by `claude -p` in tick mode (the tick flag file exists at `~/.forbotsake/tick-{project}`):

1. Read the tick flag file to get the content file path
2. Read the content file, verify `status: reviewed` (or `revised`/`reviewed-override`)
3. Set the content file frontmatter to `status: posting` (atomic claim)
4. Invoke `/forbotsake-publish` in orchestrated mode for that single file
5. On success: set `status: published`, write receipt to `published-log.md`
6. On failure: set `status: failed`, write failure receipt to `published-log.md`
7. Exit cleanly

### Receipt format for autonomous posts

```markdown
## {date} - {platform} (AUTO)

- **Content:** {title or first line}
- **Source file:** {path to content file}
- **Format:** {thread/tweet/linkedin/other}
- **Mode:** POST (autonomous/cron)
- **Link:** {captured URL}
- **Scheduled:** {ISO 8601 from calendar}
- **Posted:** {ISO 8601 actual post time}
- **Result:** success
- **Notes:** Auto-posted by forbotsake-cron

---
```

### Failed receipt

```markdown
## {date} - {platform} (AUTO/FAILED)

- **Content:** {title or first line}
- **Source file:** {path to content file}
- **Mode:** POST (autonomous/cron)
- **Result:** failed
- **Failure reason:** {specific error}
- **Notes:** Content status set to `failed`. Set back to `reviewed` to retry.

---
```

## Next Steps (interactive mode only)

After any subcommand, suggest:

- If just installed: "Run `/forbotsake-cron doctor` to verify everything is working."
- If status shows missed posts: "Check your Chrome session and run `/forbotsake-cron doctor`."
- If no calendar: "Run `/forbotsake-content-plan` to create a calendar with scheduled dates."
- If no reviewed content: "Run `/forbotsake-go` to create and review content."
