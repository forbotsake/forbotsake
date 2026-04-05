---
name: forbotsake
description: |
  Marketing skills for Claude Code. From zero marketing knowledge to published
  content. Run /forbotsake to set up all marketing skills, check installation
  health, or get routed to the right skill.
  Use when: "forbotsake", "install forbotsake", "marketing skills",
  "how should I market this", "help me sell this".
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

## Preamble (run first)

```bash
# Ensure all forbotsake skills are discoverable
_FB_ROOT="${HOME}/.claude/skills/forbotsake"
if [ -d "$_FB_ROOT" ]; then
  [ -x "$_FB_ROOT/bin/sync-links.sh" ] && bash "$_FB_ROOT/bin/sync-links.sh"
  [ -f "$_FB_ROOT/bin/forbotsake-update-check" ] && "$_FB_ROOT/bin/forbotsake-update-check" 2>/dev/null || true
fi
```

## forbotsake — Marketing Skills for Claude Code

You can build the product. This helps you sell it.

### The Pipeline

Skills follow a sequence. Start at the top, work down.

```
UNDERSTAND → CHALLENGE → RESEARCH → PLAN → CREATE → REVIEW → SHIP → MEASURE
```

| # | Stage | Command | What it does |
|---|-------|---------|-------------|
| 1 | UNDERSTAND | `/forbotsake-marketing-start` | Ask 5 hard questions, produce strategy.md |
| 2 | CHALLENGE | `/forbotsake-cmo-check` | Push back on your strategy, score it |
| 3 | RESEARCH | `/forbotsake-spy` | Browse competitors, build messaging matrix |
| 4 | RESEARCH | `/forbotsake-icp` | Deep-dive ideal customer profile |
| 5 | PLAN | `/forbotsake-content-plan` | Content calendar: themes, formats, cadence |
| 6 | CREATE | `/forbotsake-create` | Write actual content: X threads, posts, emails |
| 7 | REVIEW | `/forbotsake-content-check` | Pre-publish check: brand voice, messaging |
| 8 | SHIP | `/forbotsake-publish` | Format for platform, copy-paste ready |
| 9 | MEASURE | `/forbotsake-retro` | Weekly retro: what worked, what to change |

### One Command: `/forbotsake-go`

Don't know where to start? `/forbotsake-go` detects your pipeline state and runs
remaining stages automatically. One command from zero to published.

### Routing

- "do marketing", "market this", "I need to do marketing", "run the pipeline" → invoke `/forbotsake-go`
- "ship my marketing", "commit and publish", "land my content" → invoke `/forbotsake-go`
- If this is the user's first time and no `strategy.md` exists, suggest `/forbotsake-go` (it starts from strategy).
- If `strategy.md` exists but no content, suggest `/forbotsake-go` (it picks up from create).
- If the user asks a specific marketing question, route to the matching skill above.
- If the user asks to upgrade, suggest `/forbotsake-upgrade`.
