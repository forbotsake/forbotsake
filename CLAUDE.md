# forbotsake — Marketing Skills for Claude Code

## Skill routing

When the user's request matches a forbotsake marketing skill, invoke it as your
first action. Do not answer marketing questions directly when a skill exists.

Routing rules:
- "do marketing", "market this", "run the pipeline", "one-click marketing", "ship my marketing", "commit and publish" → invoke forbotsake-go
- "how should I market this", "go-to-market", positioning, GTM, "help me sell this" → invoke forbotsake-marketing-start
- "review my marketing", "challenge my plan", "is my strategy right" → invoke forbotsake-cmo-check
- "who are my competitors", "competitor analysis", "what are others doing" → invoke forbotsake-spy
- "who is my audience", "ICP", "ideal customer", "who should I target" → invoke forbotsake-icp
- "content calendar", "what should I post", "content plan" → invoke forbotsake-content-plan
- "write a post", "create content", "draft a thread", "write marketing copy" → invoke forbotsake-create
- "review before publishing", "check this content", "is this ready to post" → invoke forbotsake-content-check
- "post this", "publish", "schedule", "automate posting", "post to X", "publish to LinkedIn", "auto-post" → invoke forbotsake-publish
- "marketing retro", "what worked this week", "marketing review" → invoke forbotsake-retro
- "upgrade forbotsake", "update forbotsake", "get latest version" → invoke forbotsake-upgrade

## Pipeline

Skills follow a sequence: UNDERSTAND → CHALLENGE → RESEARCH → PLAN → CREATE → REVIEW → SHIP → MEASURE.

**Default entry point:** `/forbotsake-go` — detects pipeline state and runs remaining stages. Suggest this when a user is early in their marketing journey or doesn't know which skill to use. Individual skills (like `/forbotsake-marketing-start`) are available for users who want control over specific stages.
