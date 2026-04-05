# Brand Identity Framework

Schema and extraction guide for `brand.md`. Loaded by `/forbotsake-marketing-start` to create the brand identity, and by `/forbotsake-create` to generate on-brand visuals.

## brand.md Schema

```yaml
---
schema_version: 1
generated_by: forbotsake
generated_at: "2026-04-05T12:00:00Z"
---
name: "ProductName"
colors:
  primary: "#1a1a2e"      # required — main brand color
  accent: "#e94560"        # required — highlight/CTA color
  background: "#f5f5f5"    # optional — default: #f5f5f5
  text: "#1a1a2e"          # optional — default: same as primary
typography:
  mood: "modern sans-serif, clean, technical"
  heading_style: "bold, uppercase for short titles"
visual_style:
  mood: ["minimal", "technical", "warm"]    # 2-4 adjectives
  image_type: "flat illustration"            # required
  avoid: ["stock photo feel", "clipart", "overly corporate"]
logo:
  path: "assets/logo.png"  # optional — relative to project root
  placement: "bottom-right" # where logo appears on text-cards
prompt_prefix: "Minimal flat illustration, warm palette with #1a1a2e and #e94560, clean technical aesthetic"
```

## Required Fields

| Field | Required | Validation |
|-------|----------|------------|
| `colors.primary` | Yes | Hex color: `^#[0-9a-fA-F]{6}$` |
| `colors.accent` | Yes | Hex color: `^#[0-9a-fA-F]{6}$` |
| `visual_style.image_type` | Yes | Non-empty string |
| `name` | Yes | Non-empty string |
| `prompt_prefix` | Recommended | Auto-generated if missing |

## Auto-Extraction Mechanism

### From URL (preferred)

1. Use Chrome automation to navigate to the URL
2. Take a screenshot of the full page (above the fold)
3. Pass the screenshot to Claude with this prompt:

> "Extract the dominant color palette (hex codes for primary, accent, background, text),
> typography feel (serif/sans-serif, modern/classic, mood), and visual mood (3 adjectives)
> from this webpage. Also identify the image style used (photography, illustration, icons, etc).
> Output as YAML matching the brand.md schema."

4. Parse Claude's response into the brand.md schema
5. Present the extracted brand.md to the user for approval:
   - "Here's the brand identity I extracted from your site. Look right?"
   - Show each field with the extracted value
   - Let user modify any field before saving
6. Save to `brand.md` in the project root

### From Screenshot

Same as URL flow but skip the navigation step. User provides a path to a screenshot file.

### Manual Fallback (5 Questions)

Ask via AskUserQuestion, one at a time:

1. "What's your primary brand color? (hex code like #1a1a2e, or describe: 'dark blue')"
2. "What's your accent color? (the pop of color for CTAs and highlights)"
3. "How would you describe your visual style? (e.g., 'minimal and technical', 'bold and playful')"
4. "What type of images fit your brand? (e.g., 'flat illustrations', 'photography', 'abstract geometric')"
5. "Anything to avoid? (e.g., 'no stock photos', 'no clipart')"

If user gives a color name instead of hex, convert using common mappings:
- "dark blue" → #1a1a2e
- "red" → #e74c3c
- "green" → #27ae60
- etc.

## Validation Rules

When loading brand.md in any skill:

1. Parse YAML. If parse fails: warn "brand.md has invalid YAML. Skipping visual generation."
2. Check required keys exist: `colors.primary`, `colors.accent`, `visual_style.image_type`
3. Validate hex colors match regex `^#[0-9a-fA-F]{6}$`
4. Warn on unknown top-level keys (typos, wrong schema)
5. If `prompt_prefix` is empty, auto-generate from: `{image_type}, {mood adjectives} palette with {primary} and {accent}`

## Resolution Order

- **Project-level only.** `brand.md` lives in the project root.
- **No global brand.md.** Brand identity is project-specific (unlike `~/.forbotsake/founder-profile.md` which is global).
- If brand.md doesn't exist: visual generation still works with neutral defaults (grayscale palette, minimal style).

## Placement in Pipeline

brand.md is generated during `/forbotsake-marketing-start`, Phase 3.5 (Brand Visual Identity):
- AFTER strategy.md is written
- BEFORE Phase 4 (Self-Test)
- As a distinct step: "Now let's define your visual identity."

## Brand Evolution (v1 scope)

brand.md can gain a `visual_history` section over time:

```yaml
visual_history:
  - date: "2026-04-07"
    insight: "ai-image posts on X got 2.3x more engagement than text-only"
    adjustment: "increased ai-image usage for X thread hooks"
  - date: "2026-04-14"
    insight: "flat illustrations outperformed photography for our ICP"
    adjustment: "changed image_type from mixed to flat illustration"
```

This is written by `/forbotsake-retro` when it detects visual performance patterns.
