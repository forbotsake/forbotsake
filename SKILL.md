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

If output shows `UPGRADE_AVAILABLE <old> <new>`: read the forbotsake-upgrade SKILL.md
at `$_FB_ROOT/forbotsake-upgrade/SKILL.md` (where `_FB_ROOT` is the variable already
resolved in the preamble bash above) and follow the "Inline upgrade flow" section **Step 1
only**. If Step 1 results in "Yes" or "Always" (proceed with upgrade), continue through
Steps 2-7 of the inline flow. If Step 1 results in "Not now" or "Never" (declined),
skip Steps 2-7 entirely and continue with this skill immediately.

If output shows `JUST_UPGRADED <old> <new>`: tell user
"Running forbotsake v{new} (just updated from v{old})!" and continue.

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
| 8 | SHIP | `/forbotsake-publish` | Post to X, schedule, set up automation |
| 9 | MEASURE | `/forbotsake-retro` | Weekly retro: what worked, what to change |

### Routing

- If this is the user's first time and no `strategy.md` exists, suggest `/forbotsake-marketing-start`.
- If `strategy.md` exists but no `content-calendar.md`, suggest the next pipeline step.
- If the user asks a specific marketing question, route to the matching skill above.
- If the user asks to upgrade, suggest `/forbotsake-upgrade`.
