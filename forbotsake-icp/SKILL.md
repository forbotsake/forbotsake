---
name: forbotsake-icp
description: |
  Stage 4: RESEARCH (audience). Builds a deep audience profile by combining your strategy.md
  ICP with real web research on communities, content preferences, and daily workflows.
  Produces icp-profile.md with a persona narrative, daily journey map, pain points,
  communities, and content preferences.
  Use when: "who is my audience", "audience research", "ICP deep dive", "persona",
  "where does my user hang out", "community research", "understand my customer",
  "audience profile", "buyer persona".
  Proactively invoke when the user wants to understand their audience better or
  is unsure where to find their target users online.
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

# /forbotsake-icp

The audience research step. You can't write for someone you don't understand.

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
  echo "STRATEGY_FILE: strategy.md"
  head -30 strategy.md
elif [ -f forbotsake-strategy.md ]; then
  echo "STRATEGY_FOUND: yes"
  echo "STRATEGY_FILE: forbotsake-strategy.md"
  head -30 forbotsake-strategy.md
else
  echo "STRATEGY_FOUND: no"
fi

# Check for existing ICP profile
if [ -f icp-profile.md ]; then
  echo "EXISTING_PROFILE: yes"
  head -5 icp-profile.md
else
  echo "EXISTING_PROFILE: no"
fi

# Check for competitor analysis (enriches the research)
if [ -f competitor-analysis.md ]; then
  echo "COMPETITOR_ANALYSIS: yes"
else
  echo "COMPETITOR_ANALYSIS: no"
fi

# Check for session resume file
_SESSION_FILE="$FORBOTSAKE_HOME/icp-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").json"
if [ -f "$_SESSION_FILE" ]; then
  echo "RESUME_AVAILABLE: yes"
  echo "SESSION_FILE: $_SESSION_FILE"
else
  echo "RESUME_AVAILABLE: no"
fi
```

If the preamble output shows `UPGRADE_AVAILABLE <old> <new>`: tell the user
"forbotsake v{new} is available (you're on v{old}). Run `/forbotsake-upgrade` to update."
Then continue with the skill normally. Do not block on the upgrade.

If the output shows `JUST_UPGRADED <old> <new>`: tell the user
"Running forbotsake v{new} (just updated!)." Then continue.

If `STRATEGY_FOUND` is `no`:

> "No strategy.md found. I need at least a basic ICP to research. Run `/forbotsake-marketing-start`
> first, or tell me: who is your target user? (Title, industry, what problem you solve for them.)"

Use AskUserQuestion. If they provide enough detail inline, continue. If not, stop and direct them to `/forbotsake-marketing-start`.

If `EXISTING_PROFILE` is `yes`: "Found existing icp-profile.md. Want to update it with new research or start fresh?"
Use AskUserQuestion with options: A) Update existing, B) Start fresh.

If `RESUME_AVAILABLE` is `yes`: "Found a previous ICP research session in progress. Resume where you left off?"
Use AskUserQuestion with options: A) Resume, B) Start fresh.

If `COMPETITOR_ANALYSIS` is `yes`, read it. Competitor audience data enriches the persona.

## Phase 1: Extract the Starting ICP

Read strategy.md and extract:
- **Person** (name/archetype from Q2)
- **Title/Role**
- **Pain point**
- **Current solution**
- **Trigger event**
- **Top channels**

Present what you know:

> "From your strategy, your ICP is: [person summary]. Title: [title]. Their pain is [pain].
> They currently use [current solution] and would switch when [trigger event].
>
> I'm going to research where this person actually lives online, what they read,
> and how they think. But first, 3 questions to sharpen the picture."

## Phase 2: Three Deepening Questions

Ask these ONE AT A TIME via AskUserQuestion. Each answer builds on the previous.

### Q1: Daily Workflow

> "Walk me through [ICP name]'s workday. Not the idealized version — the real one.
>
> - What's the first tool they open in the morning?
> - What takes up most of their time (even if it shouldn't)?
> - What's the task they keep pushing to 'later' because it's tedious?
> - When in their day would they encounter the problem [product] solves?
>
> If you're not sure, give me your best guess. I'll validate it with research."

Push for specificity. "They use various tools" is not useful. "They open Slack, then Jira, then spend 2 hours in meetings before they can write code" is useful.

Save to session:
```bash
echo '{"q": 1, "question": "daily_workflow", "answer": "USER_ANSWER"}' >> "$_SESSION_FILE"
```

### Q2: Biggest Frustration

> "What is [ICP name]'s single biggest professional frustration right now?
>
> Not the problem your product solves (you already told me that). The CONTEXT
> around it. The thing that makes the problem worse. The reason they haven't
> fixed it yet.
>
> Example: The problem might be 'slow deployments.' The frustration is
> 'I have to babysit a 45-minute CI pipeline because it fails silently,
> and my manager measures me on deploy frequency.'
>
> The frustration is where the emotional energy lives. That's what makes
> them click on your content."

Save to session:
```bash
echo '{"q": 2, "question": "biggest_frustration", "answer": "USER_ANSWER"}' >> "$_SESSION_FILE"
```

### Q3: What They'd Pay to Automate

> "If [ICP name] could wave a magic wand and automate ONE thing in their job,
> what would it be? And how much time/money would they save per week?
>
> This doesn't have to be what your product does. It tells me what they VALUE —
> which tells me how to frame your product in terms they care about.
>
> Bonus: what have they already tried to automate it? (Scripts, tools, hiring someone?)"

Save to session:
```bash
echo '{"q": 3, "question": "would_pay_to_automate", "answer": "USER_ANSWER"}' >> "$_SESSION_FILE"
```

## Phase 3: Web Research — Communities and Content

Now research where this person actually exists online. Use WebSearch for all queries.

### 3a: Community Discovery

Search for:
1. "[ICP role] community" (e.g., "devops engineer community")
2. "[ICP role] forum reddit" (e.g., "devops engineer forum reddit")
3. "[ICP role] slack discord community" (e.g., "devops engineer slack discord")
4. "[ICP role] [industry] newsletter" (e.g., "devops SaaS newsletter")
5. "[ICP pain point] discussion" (e.g., "slow CI pipeline discussion")

For each community found, note:
- **Platform** (Reddit, Slack, Discord, Forum, etc.)
- **Name** (r/devops, DevOps Chat Slack, etc.)
- **Size/activity** (if discoverable)
- **Relevance** (how closely does it match the ICP?)

### 3b: Content Consumption Research

Search for:
1. "[ICP role] must-read blogs" or "[ICP role] favorite blogs"
2. "[ICP role] podcast" (e.g., "devops podcast")
3. "[ICP role] youtube channels"
4. "[ICP role] twitter accounts to follow" or "[ICP role] linkedin influencers"
5. "[ICP role] conference" (e.g., "devops conference 2025 2026")

For each content source found, note:
- **Type** (blog, podcast, YouTube, newsletter, conference)
- **Name**
- **Why it matters** (what need does it serve for the ICP?)

### 3c: Language and Terminology Research

Search for:
1. "[ICP pain point] site:reddit.com" — How do real users describe the problem?
2. "[product category] review" — What language do users use in reviews?
3. "[ICP role] day in the life" — How do they describe their work?

Capture exact phrases and vocabulary the ICP uses. This feeds messaging later.

## Phase 4: Synthesize and Present

Present research findings to the user before writing the file:

> "Here's what I found about [ICP name]'s world:
>
> **Communities they're in:** [top 5 communities with brief description]
>
> **Content they consume:** [top 5 content sources]
>
> **How they talk about the problem:** [3-5 actual phrases from research]
>
> **Surprising finding:** [something unexpected from the research]
>
> Does this match your experience? Anything feel off?"

Use AskUserQuestion. Their corrections are more valuable than the research.

Save corrections:
```bash
echo '{"phase": "synthesis_feedback", "corrections": "USER_RESPONSE"}' >> "$_SESSION_FILE"
```

## Phase 5: Write icp-profile.md

Write `icp-profile.md` to the project root with this schema:

```markdown
---
schema_version: 1
generated_by: forbotsake
generated_at: {ISO timestamp}
based_on_strategy: {yes/no}
---
# ICP Profile: {persona name/archetype}

Generated by /forbotsake-icp on {date}

## Persona Narrative

{A 3-5 paragraph narrative that reads like a character sketch. NOT a bullet list.
Write it in present tense, third person. Make it feel like a real person.

Example: "Alex is a senior backend engineer at a Series B fintech startup. She's been
there 18 months — long enough to own the deployment pipeline, not long enough to have
the political capital to rewrite it. Her morning starts with Slack notifications from
overnight failures..."}

## Daily Journey Map

| Time | Activity | Tools | Emotional State | Opportunity |
|------|----------|-------|----------------|-------------|
| {time} | {what they're doing} | {tools/platforms} | {how they feel} | {where your product fits} |
| ... | ... | ... | ... | ... |

## Pain Points (Ranked)

1. **{Pain point 1}** — {description, with quote from research if available}
2. **{Pain point 2}** — {description}
3. **{Pain point 3}** — {description}

## What They'd Pay For

- **Automation wish:** {from Q3}
- **Time saved:** {estimated from Q3}
- **Value frame:** {how to position your product in terms they value}

## Communities

| Community | Platform | Size/Activity | Relevance | Notes |
|-----------|----------|--------------|-----------|-------|
| {name} | {platform} | {size} | {High/Medium/Low} | {how to participate without spamming} |
| ... | ... | ... | ... | ... |

## Content Preferences

| Source | Type | Why They Use It | Your Angle |
|--------|------|----------------|------------|
| {name} | {blog/podcast/newsletter/etc.} | {what need it serves} | {how you could contribute or replicate} |
| ... | ... | ... | ... |

## Language & Vocabulary

Words and phrases this person actually uses when talking about the problem:

- "{phrase 1}" — heard in {context}
- "{phrase 2}" — heard in {context}
- "{phrase 3}" — heard in {context}

**Words to avoid** (sounds like marketing, not like them):
- {word/phrase to avoid} — say {alternative} instead
- ...

## Trigger Events

Moments when this person actively searches for a solution:

1. {Trigger 1} — {when/why this happens}
2. {Trigger 2} — {when/why this happens}
3. {Trigger 3} — {when/why this happens}

## Open Questions

{Things you couldn't validate with web research alone. Suggest: "Talk to 3 people who
match this profile. Ask them: [specific questions]"}
```

## Phase 6: Self-Test

After writing icp-profile.md, verify:

1. Does the persona narrative sound like a real person, not a marketing document?
2. Are communities real and discoverable (not made up)?
3. Is the language section based on actual research, not assumptions?
4. Does the daily journey map include specific tools and times, not vague buckets?
5. Are there at least 3 communities and 3 content sources with real names?

If any check fails, revise before presenting.

## Phase 7: Next Steps

Tell the user:

> "Your ICP profile is ready in icp-profile.md.
>
> **Next step:** `/forbotsake-content-plan` to build a content calendar that matches
> where this person hangs out, what they read, and how they talk about the problem.
>
> **Pro tip:** The 'Language & Vocabulary' section is gold. Use those exact phrases
> in your content headlines. Your ICP will feel like you're reading their mind."

## Cleanup

Remove the session file on successful completion:
```bash
rm -f "$_SESSION_FILE" 2>/dev/null
```
