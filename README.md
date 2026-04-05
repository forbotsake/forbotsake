# forbotsake

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-skills-blueviolet)](https://docs.anthropic.com/en/docs/claude-code)
[![Twitter](https://img.shields.io/twitter/follow/hanselh_?style=social)](https://x.com/hanselh_)

Marketing skills for Claude Code. From zero marketing knowledge to published content.

You can build the product. This helps you sell it.

**Who this is for:** Devtool founders who shipped v1 but have <10 qualified leads/month. You use Claude Code daily. You know how to code. You don't know how to market. forbotsake fixes that.

**What makes this different:** Every other marketing plugin gives you `/write-blog-post`. forbotsake asks you 6 hard questions first, then tells you what to write, where to post it, and why. Thinking first, then execution. The skills encode real agency methodology, not generic prompts.

## Install (30 seconds)

**Option 1 — one-liner:**
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/forbotsake/forbotsake/main/bin/install.sh)
```

**Option 2 — manual:**
```bash
git clone --single-branch --depth 1 https://github.com/forbotsake/forbotsake.git ~/.claude/skills/forbotsake
bash ~/.claude/skills/forbotsake/bin/sync-links.sh
```

No build step. No dependencies. Pure markdown.

**Verify it worked:**
```bash
bash ~/.claude/skills/forbotsake/bin/sync-links.sh --check
```

## The Pipeline

forbotsake skills follow a sequence. Start at the top, work down.

```
UNDERSTAND → CHALLENGE → RESEARCH → PLAN → SHARPEN → CREATE → RED TEAM → REVIEW → KILL SWITCH → SHIP → MEASURE
```

| # | Stage | Command | What it does |
|---|-------|---------|-------------|
| 1 | UNDERSTAND | `/forbotsake-marketing-start` | Ask 6 hard questions, produce strategy.md + founder-profile.md |
| 2 | CHALLENGE | `/forbotsake-cmo-check` | Push back on your strategy. Score it. Force alternatives. |
| 3 | RESEARCH | `/forbotsake-spy` | Browse 3-5 competitors, build a messaging matrix |
| 4 | RESEARCH | `/forbotsake-icp` | Deep-dive your ideal customer: behavior, pain, communities |
| 5 | PLAN | `/forbotsake-content-plan` | Content calendar: themes, formats, cadence per channel |
| 5.5 | SHARPEN | `/forbotsake-sharpen` | Research a specific target, map connections, build multi-touch plan |
| 6 | CREATE | `/forbotsake-create` | Write actual content: X threads, posts, emails |
| 7 | REVIEW | `/forbotsake-content-check` | Pre-publish check: brand voice, messaging, channel fit |
| 8 | SHIP | `/forbotsake-publish` | Auto-post via Chrome, schedule content, or copy-paste ready text |
| 9 | MEASURE | `/forbotsake-retro` | Weekly retro: what worked, what to change next |

## Quick start

1. Install (see above)
2. Open your project in Claude Code
3. Type `/forbotsake` to see all available skills (or go straight to `/forbotsake-marketing-start`)
4. Answer 6 questions about your product and your position
5. Get a strategy.md + founder-profile.md with your positioning, ICP, channels, and connections

Then work through the pipeline: challenge it, research competitors, plan content, create it, review it, ship it, measure it.

## See it work

Real conversation. A developer who built a DB migration CLI with 800 GitHub stars and zero paying users.

```
You:    I built a migration tool. I should probably tweet about it or something.

You:    /forbotsake-marketing-start

Claude: Before you tweet anything — 6 questions. These will hurt.

        1. "Who specifically has this problem?" Not "developers." Which
           developers, at which companies, hitting which wall, right now?

        2. "What do they do today without your tool?" If the answer is
           "nothing" — you don't have a market. If the answer is
           "a painful manual process" — now we're talking.

You:    Platform engineers at Series B+ startups. They manage 50-200
        microservices. Schema changes break staging every week. They
        use Flyway or hand-rolled bash scripts. It's a mess.

Claude: Stop. You said "migration tool." But what you actually described
        is a schema coordination layer for platform teams.

        "Migration tool" competes with Flyway, Liquibase, and 40 others.
        "Schema coordination for platform teams" has 3 competitors and
        none of them nail the multi-service case.

        [writes strategy.md — positioning, ICP, 3 channels, messaging
         pillars, founder profile with your network mapped]

You:    /forbotsake-cmo-check

Claude: Your strategy has problems.

        Positioning: STRONG. "Schema coordination" is a real gap.
        ICP: WEAK. "Series B+" is not specific enough.
        → Who is the buyer? The platform eng lead? The VP Eng?
           Different person = different message = different channel.
        Channels: ADEQUATE. But you listed "Twitter, HN, blog."
           That's what everyone lists. Where do platform engineers
           actually go when they have this problem?
        → Kubernetes Slack, CNCF channels, PlatformCon talks.

        Score: 6/10. Strong core, weak distribution.
        [rewrites the weak sections, asks you to approve]

You:    /forbotsake-spy

Claude: [researches Flyway, Liquibase, Atlas, PlanetScale, Bytebase]

        Messaging matrix:
        ┌──────────────┬─────────┬─────────┬──────────┬─────────┐
        │              │ Flyway  │ Atlas   │ Bytebase │ You     │
        ├──────────────┼─────────┼─────────┼──────────┼─────────┤
        │ Multi-svc    │ ✗       │ partial │ ✗        │ ✓ core  │
        │ Platform eng │ ✗       │ ✗       │ ✓        │ ✓       │
        │ Zero-config  │ ✗       │ ✓       │ ✗        │ ✓       │
        └──────────────┴─────────┴─────────┴──────────┴─────────┘

        Whitespace found: nobody owns "multi-service schema
        coordination." That's your lane.

You:    /forbotsake-icp

Claude: [researches platform engineering communities, content habits,
         daily workflows, pain triggers]

        Your buyer: Senior Platform Engineer, 3-7 YOE, mass hiring org.
        They mass-approve PRs on Fridays. Schema breaks hit Monday morning.
        They read: platformengineering.org, r/kubernetes, KubeCon recaps.
        They trust: peer recommendations in Slack, not blog posts.
        → Content that works: war stories, incident post-mortems, demos.
        → Content that fails: "10 best practices" listicles.

You:    /forbotsake-content-plan

Claude: 4-week calendar based on your capacity (5 hrs/week):

        Week 1: "The Monday Morning Schema Fire" — X thread + HN post
        Week 2: "Why we stopped using Flyway at 80 services" — blog
        Week 3: Live demo in Platform Engineering Slack
        Week 4: PlatformCon CFP submission + LinkedIn post

You:    /forbotsake-create — write the Week 1 X thread

Claude: [reads your strategy, ICP, competitor whitespace, channel format]

        Thread draft (7 tweets):
        1/ Every Monday at 9am, platform teams play the same game:
           "which schema change broke staging this time?"
           After managing migrations across 120 services, I built
           the tool I wished existed. Here's what I learned 🧵
        [... 6 more tweets, each with a specific technical insight,
         ending with a soft CTA to the GitHub repo]

You:    /forbotsake-content-check

Claude: Brand voice: PASS — technical, specific, no marketing fluff.
        Messaging alignment: PASS — hits "coordination" angle, not "migration."
        Channel fit: PASS — thread length right for X, hook is specific.
        CTA: NEEDS REVISION — "check it out" is weak.
        → Suggested: "If you manage >10 services, try it on one.
           5 minutes. No config. Star if it saves your Monday."

        Verdict: READY TO PUBLISH (after CTA fix)

You:    /forbotsake-publish

Claude: [opens X via Chrome, posts the thread, logs the publish event]
        Published: x.com/you/status/18294...
        Logged to publish-log.md for retro tracking.

You:    /forbotsake-retro  (one week later)

Claude: Week 1 results:
        - X thread: 12K impressions, 340 likes, 28 replies, 47 new stars
        - Best performing tweet: #3 (the "Flyway breaks at 40 services" one)
        - 4 DMs from platform engineers asking about enterprise support

        Recommendation: Double down on "war story" format.
        Drop the blog post — your audience lives on X and Slack, not blogs.
        Week 2 pivot: turn the DM conversations into a case study thread.
```

You said "I should probably tweet about it." Nine skills later, you have positioning that competitors can't copy, content your audience actually wants, and data showing what works. That's not a tweet scheduler. That's a marketing team.

## How it works

Each skill is a SKILL.md file that Claude Code reads and follows. Skills read your codebase (README, git log) to understand your product before asking questions. Outputs are markdown files in your project root.

Key outputs:
- `strategy.md` — your marketing strategy (positioning, ICP, channels, messaging)
- `competitor-analysis.md` — competitor messaging matrix
- `icp-profile.md` — ideal customer profile
- `content-calendar.md` — what to post, where, when

## Quality Gates (Adversarial Review)

forbotsake doesn't trust its own output. Three adversarial review gates catch bad content before it goes public:

| Gate | Where | What it catches | Verdict |
|------|-------|----------------|---------|
| Strategy Reviewer | `/forbotsake-marketing-start` | Vague positioning, generic ICPs, unjustified channel scores | PASS / NEEDS_REVISION |
| Content Red Team | `/forbotsake-content-check` | AI-slop patterns, wrong voice, weak originality | PASS / SOFT_FAIL / HARD_FAIL |
| Publish Kill Switch | `/forbotsake-publish` | Embarrassment risk, factual claims, banned patterns | GO / HOLD |

Gates 1 and 2 use independent reviewer subagents with fresh context that can't see the conversation that produced the content. Gate 3 is a lightweight inline check (not a subagent) for final sanity before publishing.

**Fast mode:** Set `FORBOTSAKE_FAST=1` to skip gates during rapid iteration.

**Custom patterns:** Add banned patterns to `~/.forbotsake/banned-patterns.md`. Defaults ship with forbotsake and are upgrade-safe.

**Metrics:** Gate results log to `~/.forbotsake/review-metrics.jsonl` for `/forbotsake-retro`.

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
cd ~/.claude/skills/forbotsake && git pull && bash bin/sync-links.sh
```

Every forbotsake skill checks for updates automatically. When a new version is available, you'll see a notice before the skill runs. Your strategy.md and other output files live in your project, not in the plugin directory. Upgrades are safe.

## Troubleshooting

**Skills not showing up after install?**
Run: `bash ~/.claude/skills/forbotsake/bin/sync-links.sh`
This creates the symlinks Claude Code needs to discover skills.

**`/forbotsake-*` commands not found?**
Start a new Claude Code session after installing. Skills are loaded at session start.

**Verify installation:**
Run: `bash ~/.claude/skills/forbotsake/bin/sync-links.sh --check`

**Uninstall:**
Run: `bash ~/.claude/skills/forbotsake/bin/uninstall.sh`

## Contributing

Found a bug? Have a skill idea? [Open an issue](https://github.com/forbotsake/forbotsake/issues).

Pull requests welcome. forbotsake skills are pure markdown — if you can write a prompt, you can contribute.

## License

MIT
