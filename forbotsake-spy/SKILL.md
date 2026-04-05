---
name: forbotsake-spy
description: |
  Stage 3: RESEARCH (competitors). Analyzes 3-5 competitors to find messaging whitespace
  and positioning gaps. Produces competitor-analysis.md with a messaging matrix showing
  what each competitor says, what's missing, and where you can win.
  Use when: "competitor analysis", "competitive research", "what are others doing",
  "market landscape", "who am I competing with", "spy on competitors",
  "messaging whitespace", "differentiation research".
  Proactively invoke when the user mentions competitors or asks how to differentiate.
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

# /forbotsake-spy

The competitive research step. Know your battlefield before you fight.

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
  head -20 strategy.md
elif [ -f forbotsake-strategy.md ]; then
  echo "STRATEGY_FOUND: yes"
  echo "STRATEGY_FILE: forbotsake-strategy.md"
  head -20 forbotsake-strategy.md
else
  echo "STRATEGY_FOUND: no"
fi

# Check for existing competitor analysis
if [ -f competitor-analysis.md ]; then
  echo "EXISTING_ANALYSIS: yes"
  head -5 competitor-analysis.md
else
  echo "EXISTING_ANALYSIS: no"
fi

# Check for gstack browse binary
if command -v gstack-browse &>/dev/null || [ -f "$HOME/.gstack/bin/browse" ]; then
  echo "BROWSE_AVAILABLE: yes"
else
  echo "BROWSE_AVAILABLE: no"
fi

# Check for session resume file
_SESSION_FILE="$FORBOTSAKE_HOME/spy-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)").json"
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

> "No strategy.md found. I can still run competitor analysis, but it's more powerful
> when I know your positioning first. Run `/forbotsake-marketing-start` to generate
> your strategy, or tell me about your product and I'll work with what you give me."

Use AskUserQuestion with options: A) Continue without strategy, B) I'll run /forbotsake-marketing-start first.

If they choose B, stop here.

If `EXISTING_ANALYSIS` is `yes`: "Found existing competitor-analysis.md. Want to update it or start fresh?"
Use AskUserQuestion with options: A) Update existing, B) Start fresh.

If `RESUME_AVAILABLE` is `yes`: "Found a previous spy session in progress. Resume where you left off?"
Use AskUserQuestion with options: A) Resume, B) Start fresh.

**Research tool selection:** If `BROWSE_AVAILABLE` is `yes`, use gstack browse for deep page analysis. Otherwise, use WebSearch for all research. Both approaches work; browse gives richer page content, WebSearch gives broader coverage.

## Phase 1: Identify Competitors

If strategy.md exists, extract the product description, ICP, and "current solution" field. The current solution is often competitor #1.

Ask the user via AskUserQuestion:

> "Based on your strategy, your ICP currently uses [current solution from strategy.md].
> Name 3-5 competitors or alternatives your audience considers. Include:
> - Direct competitors (same problem, same audience)
> - Indirect competitors (same problem, different approach)
> - Status quo (what people do when they use nothing — spreadsheets, manual processes, etc.)
>
> If you're not sure, I can search for competitors. Just tell me your product category."

If the user doesn't know their competitors or asks for discovery, use WebSearch to find them:

1. Search for "[product category] alternatives"
2. Search for "[product category] vs"
3. Search for "best [product category] for [ICP role]"

Present discovered competitors and let the user confirm or adjust the list.

Save the competitor list:
```bash
echo '{"phase": "competitors", "list": ["COMP1", "COMP2", "COMP3"]}' >> "$_SESSION_FILE"
```

## Phase 2: Analyze Each Competitor

For each competitor (3-5), research and document:

### Research Process

For each competitor, use WebSearch (or browse if available) to gather:

1. **Their website homepage** — What's their headline? What do they promise in the first 5 seconds?
2. **Their pricing page** — Who are they targeting based on pricing tiers?
3. **Their "about" or "why us" page** — How do they position against alternatives?
4. **Their social presence** — Search "[competitor name] site:twitter.com OR site:linkedin.com" to see their content strategy
5. **Their content/blog** — Search "[competitor name] blog" to see what topics they cover
6. **Reviews/mentions** — Search "[competitor name] review" or "[competitor name] reddit" for real user sentiment

### Per-Competitor Profile

For each competitor, build this profile:

- **Name & URL**
- **Positioning statement** (their headline or tagline — quote it exactly)
- **Target audience** (who are they selling to, based on their copy?)
- **Key messaging themes** (what 3 things do they repeat most?)
- **Channels used** (where do they show up? Blog, Twitter, LinkedIn, YouTube, podcasts, etc.)
- **Content strategy** (what type of content? How often? What format?)
- **Pricing model** (free, freemium, paid, enterprise?)
- **Strengths** (what are they doing well?)
- **Weaknesses** (where are the gaps in their messaging or offering?)

Present each competitor profile to the user as you complete it. After every 2 competitors, check in:

> "Here's what I'm seeing so far. [Brief observation about patterns]. Want me to dig deeper
> on any of these, or continue to the next?"

Save each profile:
```bash
echo '{"phase": "analysis", "competitor": "NAME", "positioning": "...", "themes": [...]}' >> "$_SESSION_FILE"
```

## Phase 3: Build the Messaging Matrix

After analyzing all competitors, construct a messaging matrix that shows the landscape at a glance.

The matrix compares what each competitor (and the user's product) says across key messaging dimensions:

**Dimensions to compare:**
- Primary promise (what they say they do)
- Target persona (who they talk to)
- Key differentiator (why them, not others)
- Tone/voice (technical, friendly, corporate, edgy)
- Social proof type (logos, testimonials, metrics, community)
- Content focus (education, product updates, thought leadership, SEO)

## Phase 4: Identify Whitespace

This is the most valuable output. Analyze the matrix to find:

1. **Messaging positions nobody is taking** — What benefits or angles are none of the competitors claiming?
2. **Underserved audiences** — Is there a segment everyone ignores?
3. **Channel gaps** — Is there a channel where the audience exists but no competitor shows up?
4. **Tone gaps** — Is everyone corporate? Everyone casual? Where's the opening?
5. **Content format gaps** — All doing blog posts? Nobody doing video? Nobody in communities?

Present whitespace findings to the user:

> "Here's what nobody is saying — and these are your openings:
>
> 1. [Whitespace opportunity 1 — specific and actionable]
> 2. [Whitespace opportunity 2]
> 3. [Whitespace opportunity 3]
>
> The strongest opportunity is [X] because [specific reasoning tied to their ICP]."

## Phase 5: Write competitor-analysis.md

Write `competitor-analysis.md` to the project root with this schema:

```markdown
---
schema_version: 1
generated_by: forbotsake
generated_at: {ISO timestamp}
competitors_analyzed: {number}
---
# Competitor Analysis: {product name}

Generated by /forbotsake-spy on {date}

## Your Positioning (from strategy.md)

{Brief summary of the user's current positioning for easy comparison}

## Competitor Profiles

### {Competitor 1 Name}

- **URL:** {url}
- **Positioning:** "{their exact headline or tagline}"
- **Target Audience:** {who they sell to}
- **Key Messaging Themes:**
  1. {theme 1}
  2. {theme 2}
  3. {theme 3}
- **Channels:** {where they show up}
- **Content Strategy:** {what they publish, how often, what format}
- **Pricing:** {model}
- **Strengths:** {what they do well}
- **Weaknesses:** {gaps in their approach}

### {Competitor 2 Name}
{same structure}

### {Competitor 3 Name}
{same structure}

## Messaging Matrix

| Dimension | {Your Product} | {Competitor 1} | {Competitor 2} | {Competitor 3} |
|-----------|---------------|----------------|----------------|----------------|
| Primary Promise | {value} | {value} | {value} | {value} |
| Target Persona | {value} | {value} | {value} | {value} |
| Key Differentiator | {value} | {value} | {value} | {value} |
| Tone/Voice | {value} | {value} | {value} | {value} |
| Social Proof | {value} | {value} | {value} | {value} |
| Content Focus | {value} | {value} | {value} | {value} |

## Whitespace Opportunities

### 1. {Opportunity Title}

{2-3 sentences: what the gap is, why it exists, and how the user can exploit it}

### 2. {Opportunity Title}

{2-3 sentences}

### 3. {Opportunity Title}

{2-3 sentences}

## Recommended Positioning Adjustments

Based on this analysis, consider:

1. {Specific adjustment to positioning}
2. {Specific adjustment to messaging}
3. {Specific adjustment to channel strategy}

## Open Questions

{Things that need further research — user interviews, deeper channel analysis, etc.}
```

## Phase 6: Self-Test

After writing competitor-analysis.md, verify:

1. Does the messaging matrix have at least 3 competitors plus the user's product?
2. Are whitespace opportunities specific and actionable (not just "be different")?
3. Are competitor profiles based on actual research, not assumptions?
4. Do the recommended adjustments connect back to specific whitespace findings?

If any check fails, revise before presenting.

## Phase 7: Next Steps

Tell the user:

> "Your competitor analysis is ready in competitor-analysis.md.
>
> **Strongest move from here:**
> - `/forbotsake-icp` to build a deep audience profile — now that you know the whitespace,
>   research whether your ICP actually cares about those gaps
> - `/forbotsake-content-plan` to build your content calendar using the whitespace
>   opportunities as your content pillars
>
> The whitespace only matters if your audience feels the gap. Validate with
> `/forbotsake-icp` before building a content plan around assumptions."

## Cleanup

Remove the session file on successful completion:
```bash
rm -f "$_SESSION_FILE" 2>/dev/null
```
