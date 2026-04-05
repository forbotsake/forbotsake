# Execution Intelligence Framework

How to turn a strategic opportunity into a multi-touch execution plan. Not broadcast marketing. Targeted outreach.

This framework is used by `/forbotsake-sharpen` (standalone) and referenced by other skills when they detect a high-value target opportunity.

## Scope (v0.2)

This framework covers **person and organization** targets only. Community, platform, and trend targets are planned for v0.3 after validating the core methodology.

## The 5-Step Process

### Step 1: Classify the Opportunity

Determine what kind of target you're working with:

| Type | Description | Research Focus |
|------|-------------|----------------|
| **Person** | A specific individual (founder, investor, influencer, community leader) | Communication style, platforms, opinions, values, recent activity |
| **Organization** | A company, project, or community org (YC, gstack, a competitor) | Decision makers, culture, public channels, contribution norms |

Ask: "Who is the target? What outcome do you want from engaging them?"

The outcome shapes everything. "Get Gary Tan to try forbotsake" is different from "Get Gary Tan to tweet about forbotsake." Be specific about the desired response.

### Step 2: Deep Contextual Research

**Default entry (fast path):** Ask the user first: "Do you have existing research on [target]? Paste what you know, or say 'search for me.'"

If the user provides context, use it as the primary source. Skip WebSearch or use it only to fill gaps.

If the user says "search for me," use WebSearch to build a target profile:

**For a person:**
1. Search "[name] [role/company]" to confirm identity
2. Search "[name] twitter OR X" for communication style and recent takes
3. Search "[name] interview OR podcast" for values and opinions
4. Search "[name] [relevant topic]" for their stance on what you're pitching

**For an organization:**
1. Search "[org name] about" for mission and positioning
2. Search "[org name] contributing OR community" for engagement norms
3. Search "[org name] [relevant topic]" for their stance

**Low-signal handling:** If WebSearch returns thin or ambiguous results (common names, private individuals), tell the user: "I couldn't find reliable info about [target]. Tell me what you know: their communication style, where they're active, what they care about." Use the user's input as the profile.

**Wrong-person risk:** After assembling research, present 2-3 identifying facts and ask: "Is this the right [name]? Key details I found: [fact 1], [fact 2], [fact 3]." This prevents building an outreach strategy for the wrong person.

### Step 3: Map Your Position

Read `~/.forbotsake/founder-profile.md`. Cross-reference the target profile with the founder's:

- **Shared affiliations:** Both in YC? Same industry? Same community?
- **Mutual connections:** Anyone who knows both parties?
- **Shared experiences:** Attended same event? Used same tool? Worked on same problem?
- **Credibility signals:** What about you would make this target take you seriously?

**Output a warm-path declaration:** Before generating angles, explicitly list:

```
Warm Paths Found:
- [path 1] — [how it connects you]
- [path 2] — [how it connects you]
- (none found) — cold outreach required
```

This declaration is what the quality gate checks against. If you declare warm paths here and don't use them in the plan, the gate catches it.

### Step 4: Generate Angles

Based on research + your position, generate 3+ outreach angles. Each angle must include:

| Field | Description |
|-------|-------------|
| **Angle name** | A short label (e.g., "Challenge framing", "Warm YC intro", "Public value-add") |
| **Why this works** | What about the target's profile makes this angle effective |
| **Primary channel** | Where the first touch happens |
| **What you're asking for** | The specific desired response (try the tool, retweet, take a meeting) |
| **Risk** | What could go wrong with this approach |

Present all angles to the user. Let them pick, combine, or propose their own.

### Step 5: Build Multi-Touch Plan

Design a coordinated sequence of touchpoints. Each touchpoint builds on the previous.

**Minimum requirements:**
- Each touchpoint specifies: channel, action, timing, content summary, success signal
- Touchpoints are sequenced (Touch 2 depends on Touch 1's outcome)
- At least one touchpoint uses a warm path (if one was declared in Step 3)
- Each touchpoint has a clear "why this channel for this target" rationale

**Single-touch exception:** A deliberate single-touch plan is acceptable IF the user explicitly justifies why one touch is optimal for this target. The quality gate catches *unplanned* single-touch, not *intentional* single-touch.

## Quality Gates

Run these checks after the plan is assembled. Present results to the user.

| Gate | Level | Condition | What Happens on Fail |
|------|-------|-----------|---------------------|
| Multi-touch | FAIL | Plan has only 1 touchpoint AND no explicit justification | Show: "This plan has only 1 touchpoint. Multi-touch increases response rates for targeted outreach. Proceed anyway? (y/N)" |
| Warm path usage | FAIL | Warm paths were declared in Step 3 but none appear in the plan | Show: "You have warm paths to [target] but the plan doesn't use them. Warm intros have 5-10x response rates vs cold outreach. Proceed anyway? (y/N)" |
| Angle reasoning | FAIL | Any touchpoint lacks "why this channel for this target" | Show: "Touch [N] doesn't explain why [channel] is right for [target]. Add reasoning or proceed anyway? (y/N)" |
| Research evidence | WARN | No research findings cited in angle selection | Show: "The angle selection isn't grounded in specific research about [target]. This may reduce effectiveness." |

**Override:** Every FAIL-level gate asks "Proceed anyway? (y/N)". The founder knows their relationships better than the framework. Gates are guardrails, not walls.

## Error Handling

| Step | What Can Fail | User Sees | Recovery |
|------|--------------|-----------|----------|
| Step 1 | User provides vague target ("someone important") | "I need a specific name or organization. Who exactly?" | Re-ask with examples |
| Step 2 | WebSearch unavailable or rate-limited | "WebSearch is unavailable. Paste what you know about [target] and I'll work with that." | Switch to fast path |
| Step 2 | WebSearch returns wrong person (common name) | "I found multiple people named [name]. Key details: [facts]. Is this the right person?" | User corrects or provides context |
| Step 3 | founder-profile.md missing | "No founder profile found. Quick: what communities/orgs are you part of?" | Create minimal profile inline |
| Step 3 | founder-profile.md has empty sections | "Your profile is missing [sections]. For better angles, update ~/.forbotsake/founder-profile.md." | Continue with available data |
| Step 4 | User rejects all 3 angles | "Tell me your angle. What approach feels right to you?" | User provides custom angle |
| Step 5 | Quality gate FAIL | "[Gate explanation]. Proceed anyway? (y/N)" | User overrides or revises |
