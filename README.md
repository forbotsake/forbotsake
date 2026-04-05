# forbotsake

Marketing skills for Claude Code. From zero marketing knowledge to published content.

You can build the product. This helps you sell it.

**Who this is for:** Devtool founders who shipped v1 but have <10 qualified leads/month. You use Claude Code daily. You know how to code. You don't know how to market. forbotsake fixes that.

**What makes this different:** Every other marketing plugin gives you `/write-blog-post`. forbotsake asks you 5 hard questions first, then tells you what to write, where to post it, and why. Thinking first, then execution. The skills encode real agency methodology, not generic prompts.

## Install (30 seconds)

```bash
git clone --single-branch --depth 1 https://github.com/forbotsake/forbotsake.git ~/.claude/skills/forbotsake
```

That's it. No build step. No dependencies. Pure markdown.

## The Pipeline

forbotsake skills follow a sequence. Start at the top, work down.

```
UNDERSTAND → CHALLENGE → RESEARCH → PLAN → CREATE → REVIEW → SHIP → MEASURE
```

| # | Stage | Command | What it does |
|---|-------|---------|-------------|
| 1 | UNDERSTAND | `/forbotsake-marketing-start` | Ask 5 hard questions, produce strategy.md + your first move |
| 2 | CHALLENGE | `/forbotsake-cmo-check` | Push back on your strategy. Score it. Force alternatives. |
| 3 | RESEARCH | `/forbotsake-spy` | Browse 3-5 competitors, build a messaging matrix |
| 4 | RESEARCH | `/forbotsake-icp` | Deep-dive your ideal customer: behavior, pain, communities |
| 5 | PLAN | `/forbotsake-content-plan` | Content calendar: themes, formats, cadence per channel |
| 6 | CREATE | `/forbotsake-create` | Write actual content: X threads, posts, emails |
| 7 | REVIEW | `/forbotsake-content-check` | Pre-publish check: brand voice, messaging, channel fit |
| 8 | SHIP | `/forbotsake-publish` | Post to X, schedule content, set up automation |
| 9 | MEASURE | `/forbotsake-retro` | Weekly retro: what worked, what to change next |

## Quick start

1. Install (see above)
2. Open your project in Claude Code
3. Type `/forbotsake-marketing-start`
4. Answer 5 questions about your product
5. Get a strategy.md with your positioning, ICP, channel strategy, and first move

Then work through the pipeline: challenge it, research competitors, plan content, create it, review it, ship it, measure it.

## How it works

Each skill is a SKILL.md file that Claude Code reads and follows. Skills read your codebase (README, git log) to understand your product before asking questions. Outputs are markdown files in your project root.

Key outputs:
- `strategy.md` — your marketing strategy (positioning, ICP, channels, messaging)
- `competitor-analysis.md` — competitor messaging matrix
- `icp-profile.md` — ideal customer profile
- `content-calendar.md` — what to post, where, when

## Methodology

forbotsake encodes a 5-step marketing judgment framework. See [ETHOS.md](ETHOS.md) for the full methodology.

1. Problem/Solution Clarity
2. ICP Definition via Elimination
3. Channel-Market Fit Scoring
4. Messaging Hierarchy Construction
5. Distribution Priority Stack-Rank

## Upgrading

Type `/forbotsake-upgrade` in Claude Code. It detects your install type, pulls the latest version, and shows what changed.

Or manually:
```bash
cd ~/.claude/skills/forbotsake && git pull
```

Every forbotsake skill checks for updates automatically. When a new version is available, you'll see a notice before the skill runs. Your strategy.md and other output files live in your project, not in the plugin directory. Upgrades are safe.

## License

MIT
