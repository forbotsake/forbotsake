# Visual Strategy Framework

Decision framework for multi-modal content generation. Loaded by `/forbotsake-create` to determine visual treatment per content piece.

## Visual Treatment Decision Matrix

| Channel | Content Type | Treatment | Rationale |
|---------|-------------|-----------|-----------|
| X/Twitter | Thread (hook tweet) | `ai-image` | Hero image stops the scroll |
| X/Twitter | Thread (body tweets) | `none` | Text carries the argument |
| X/Twitter | Single tweet (stat) | `text-card` | Bold number is the visual |
| X/Twitter | Single tweet (hot take) | `none` | Opinion needs no decoration |
| X/Twitter | Single tweet (launch) | `ai-image` | Launch needs visual impact |
| LinkedIn | Any post | `ai-image` or `text-card` | LinkedIn posts with images get 2x engagement |
| LinkedIn | Carousel | `text-card` (multiple) | Each slide is a text-card |
| Blog | Any post | `ai-image` | Featured/OG image required for social sharing |
| Product Hunt | Launch | `ai-image` | Gallery images are mandatory |
| Email | Newsletter | `none` or `text-card` | Optional, don't slow load time |
| Reddit | Any | `none` | Reddit values text substance |
| Hacker News | Any | `none` | HN is text-only culture |
| Video content | Demo/teaser | `video` | Show the product in action |

## Treatment Types

### `none`
No visual generation. Text-only content. Use for:
- Hot takes and opinions
- Technical deep-dives
- Short posts under 280 characters
- Quick tips and replies
- HN and Reddit posts

### `text-card`
Branded typography card generated locally via Satori. Use when the content IS the visual:
- Stat highlights: "2.3x faster" in large bold text
- Quote cards: a key quote with attribution
- Key takeaways: bullet points on a branded background
- Comparison tables: side-by-side data
- Listicle items: numbered points

### `ai-image`
AI-generated image via Gemini or Nano Banana. Use when the visual adds meaning beyond text:
- Launch announcements: product metaphors, celebration imagery
- Storytelling posts: scenes that evoke emotion
- Blog headers: conceptual illustrations
- Product Hunt gallery: product in context

### `video`
AI-generated video via Veo or Seedance. Use for high-impact content:
- Product demos: show the product working
- Launch teasers: 15-30 second hype clips
- Explainer shorts: how-it-works in 60 seconds

## Channel Output Specs

| Channel | Dimensions | Max Size | Format |
|---------|-----------|----------|--------|
| X/Twitter | 1200x675px | 5MB | PNG, JPG |
| LinkedIn (single) | 1200x627px | 5MB | PNG, JPG |
| LinkedIn (carousel) | 1080x1080px per slide | 5MB | PDF document |
| Blog (OG/featured) | 1200x630px | 5MB | PNG |
| Product Hunt (gallery) | 1270x760px | 5MB | PNG |
| Text-cards (default) | 1200x675px | 2MB | PNG |
| Text-cards (LinkedIn) | 1080x1080px | 2MB | PNG |

## Content Frontmatter Schema (v2)

```yaml
visual_treatment: none | text-card | ai-image | video
visual_prompt: "description for image generation"
visual_placement: hero | inline | thumbnail
visual_count: 1  # >1 for carousels
visual_status: generated | failed | pending | skipped
visual_alt: "accessibility description of the image"
visual_provider: "provider name used (e.g., gemini-browser, local-satori)"
```

## Image Review Flow

After generating an image (interactive mode only):

1. Show the image to the user using the Read tool (which displays images)
2. Present options via AskUserQuestion:
   - A) Use this image
   - B) Regenerate with refined prompt (provide feedback)
   - C) Switch to text-card instead
   - D) Skip visual for this post
3. Maximum 3 regeneration attempts
4. On 4th attempt, offer to keep the best one or skip
5. **Orchestrated mode:** Auto-accept the first generated image

## Progress UX

During image generation, emit status messages:
```
Generating image via {provider}... (this takes 30-60 seconds)
Image generated. Downloading...
Saved: content/{filename}-visual-1.png
```

During video generation:
```
Generating video via {provider}... (this takes 2-5 minutes)
Video generation queued. Continuing with text content...
Video ready. Saved: content/{filename}-video-1.mp4
```

## Accessibility Requirements

- Every generated image must have `visual_alt` in frontmatter describing the image content
- Text-cards must enforce WCAG 2.1 AA contrast ratio: 4.5:1 minimum between text and background
- Color-blind safe palettes should be flagged in brand.md review
- Alt text must describe what is depicted, not just "marketing image" or "text card"

## Feedback Loop

After publishing, track which visual treatments correlate with engagement:
- published-log.md includes `Visual:` field with treatment type and provider
- `/forbotsake-retro` correlates visual_treatment with engagement metrics
- Over time, adjust recommendations: "Posts with ai-image on X get 2.3x more engagement than text-only"
- Store performance insights in `visual-performance.md` for future reference
