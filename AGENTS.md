# forbotsake

Marketing skills for AI coding agents. From zero marketing knowledge to published content.

## Skills

| Skill | Purpose | Entry point |
|---|---|---|
| forbotsake-go | One-command marketing pipeline | Primary entry point. Detects state, runs remaining stages. |
| forbotsake-marketing-start | Build marketing strategy from scratch | Start here if no strategy.md exists. |
| forbotsake-cmo-check | Challenge and review your strategy | Run after strategy.md to improve it. |
| forbotsake-spy | Competitor analysis and messaging gaps | Research 3-5 competitors. |
| forbotsake-icp | Deep audience research and persona building | Build detailed ICP profile. |
| forbotsake-sharpen | Targeted outreach execution plans | Refine approach for specific people/orgs. |
| forbotsake-content-plan | Convert strategy into content calendar | Produces 4-week calendar with cadence. |
| forbotsake-create | Write channel-specific marketing content | X threads, blog posts, emails, LinkedIn. |
| forbotsake-content-check | Adversarial content review before publishing | Brand voice, messaging alignment, CTA check. |
| forbotsake-publish | Format content for posting or copy-paste | POST mode (Claude only) or COPY mode (all agents). |
| forbotsake-retro | Weekly marketing retrospective | Measure what worked, plan what's next. |
| forbotsake-upgrade | Self-upgrade to latest version | Updates forbotsake to newest release. |

## Getting Started

Run `forbotsake-go` to start the marketing pipeline. It auto-detects your current state:
- No strategy.md? Starts from scratch with 5 positioning questions.
- Have strategy but no content? Creates content based on your calendar.
- Have content? Reviews and formats for publishing.

## Key Files (created by skills)

- `strategy.md` -- marketing strategy (positioning, ICP, channels, messaging)
- `brand.md` -- visual identity (colors, typography, style)
- `content-calendar.md` -- 4-week content calendar
- `content/*.md` -- individual content pieces with frontmatter
- `~/.forbotsake/` -- global config, session state, metrics

## Installation

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/forbotsake/forbotsake/main/bin/install.sh)
```

The install script auto-detects which AI coding agents you have installed (Claude Code, Codex, Kimi, etc.) and sets up forbotsake for all of them.

## Known Limitations by Agent

| Agent | Limitations |
|---|---|
| Claude Code | None. Full feature set. |
| Codex | forbotsake-cron unavailable (requires Chrome). Publishing in COPY mode only. Adversarial reviews run inline (no independent subagent). |
| Other agents | Similar to Codex. See host config for specifics. |
