# Visual Narrative Framework

Cross-post visual coherence for campaign-level storytelling. When multiple content pieces form a sequence (e.g., a week-long LinkedIn series, a multi-day launch campaign), their visuals should tell a connected story.

## Campaign-Level Visual Planning

A `campaign.md` artifact tracks the visual narrative across a sequence of posts:

```yaml
campaign_name: "Product Launch Week"
visual_theme: "rocket launch metaphor"
seed_image: "content/2026-04-07-x-launch-visual-1.png"
color_arc: ["#1a1a2e (start: grounded)", "#e94560 (mid: energy)", "#f5f5f5 (end: clarity)"]
posts:
  - file: "content/2026-04-07-x-launch-thread.md"
    visual_role: "setup — introduce the rocket metaphor, grounded colors"
  - file: "content/2026-04-08-linkedin-launch.md"
    visual_role: "escalation — rocket lifting off, accent colors dominate"
  - file: "content/2026-04-09-x-results.md"
    visual_role: "payoff — rocket in space, clean white background, achievement"
```

## Visual Coherence Techniques

### Seed Images
The first image in a sequence establishes the visual vocabulary. Later images reference it:
- Same subject/metaphor across posts (rocket, building blocks, path)
- Consistent art style (flat illustration, photography, abstract)
- Same color palette from brand.md

**Implementation:** When generating the second+ image in a campaign, include in the visual_prompt: "Continuation of visual series. Previous image showed {seed description}. This image should {evolution}. Maintain same art style: {brand.md image_type}."

### Color Progression
Colors can evolve across a sequence to build emotional momentum:
- Post 1: Primary color dominant (grounded, familiar)
- Post 2-3: Accent color increases (energy, tension)
- Final post: Clean palette (resolution, clarity)

Encode this in the visual_prompt per post.

### Visual Callbacks
Later posts can reference visual elements from earlier ones:
- Same object in different contexts
- Zooming in/out on the same scene
- Before/after of the same subject

This requires the AI to maintain consistency. Include explicit instructions in the visual_prompt: "Use the same {object/style/composition} as the first post in this series."

## Brand Evolution

Over time, brand.md gains a `visual_history` section recording what works:

```yaml
visual_history:
  - date: "2026-04-07"
    insight: "ai-image posts on X got 2.3x more engagement than text-only"
    adjustment: "increased ai-image usage for X thread hooks"
  - date: "2026-04-14"
    insight: "flat illustrations outperformed photography for developer ICP"
    adjustment: "changed image_type to flat illustration"
  - date: "2026-04-21"
    insight: "text-cards with stat highlights drive more saves than quote cards"
    adjustment: "prioritize stat type for text-cards"
```

Written by `/forbotsake-retro` when it detects visual performance patterns. Read by `/forbotsake-create` to adjust visual_treatment decisions over time.

## A/B Testing

For high-value content, optionally generate two variants:
1. The visually enhanced version (with ai-image or text-card)
2. A text-only version

Publish both if platform supports it (different times, same content). Track engagement:

```yaml
# In published-log.md
## 2026-04-07 - X/Twitter (A/B: visual)
- Visual: ai-image via gemini-browser
- Engagement: 340 likes, 28 replies

## 2026-04-08 - X/Twitter (A/B: text-only)
- Visual: none (control)
- Engagement: 142 likes, 12 replies
```

`/forbotsake-retro` calculates the visual lift: `(340-142)/142 = 139% engagement lift from image`.

## When to Use Narrative Arcs

Not every post needs to be part of a visual narrative. Use arcs for:
- **Product launches:** 3-5 posts building to launch day
- **Weekly themes:** content-calendar weekly themes can share a visual thread
- **Story-driven series:** "How we built X" multi-part content

For standalone posts, individual visual_treatment decisions (from visual-strategy.md) are sufficient. Don't force narrative coherence on unrelated content.

## Implementation Notes

- Campaign.md is manually created or auto-suggested by `/forbotsake-content-plan` when it detects a thematic sequence
- `/forbotsake-create` reads campaign.md (if exists) to inform visual_prompt generation
- The seed image is the first generated image in the campaign. Reference it in subsequent prompts.
- Visual narrative arcs are a quality enhancement. They're not required for visual generation to work. The system degrades gracefully to per-post independent visuals.
