# Media Providers Framework

Provider abstraction for multi-modal content generation. Loaded by `/forbotsake-create` and `/forbotsake-go` for backend selection.

## media-providers.md Schema

```yaml
---
schema_version: 1
generated_by: forbotsake
generated_at: "2026-04-05T12:00:00Z"
auto_detected: true
---
image_providers:
  - name: local-satori
    type: local
    enabled: true
    treatments: [text-card]
    requires: bun
    description: "Local text-card renderer (free, instant, <2s)"

  - name: gemini-browser
    type: browser
    enabled: true
    treatments: [ai-image]
    requires: claude-for-chrome
    url: "https://gemini.google.com"
    description: "Google Gemini via browser (free with subscription)"

  - name: nano-banana-api
    type: api
    enabled: false
    treatments: [ai-image]
    requires: NANO_BANANA_API_KEY
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/nano-banana"
    description: "Nano Banana API (~$0.04/image)"

video_providers:
  - name: veo-browser
    type: browser
    enabled: false
    treatments: [video]
    requires: claude-for-chrome
    url: "https://veo.google.com"
    description: "Google Veo via browser (free with subscription)"

  - name: seedance-api
    type: api
    enabled: false
    treatments: [video]
    requires: SEEDANCE_API_KEY
    description: "Seedance 2.0 API"

fallback: prompt-only
```

## Selection Logic

For a given `visual_treatment` value:

1. Combine `image_providers` and `video_providers` into a single list
2. Filter to providers whose `treatments` array includes the requested treatment
3. Filter to enabled providers only
4. Pick the first one in the filtered list (list order = priority)
5. If none found: use `fallback` behavior (`prompt-only` saves the visual_prompt for manual generation)

**Example:** Content has `visual_treatment: ai-image`
- `local-satori` filtered out (treatments: [text-card], doesn't include ai-image)
- `gemini-browser` matches (treatments: [ai-image], enabled: true) → selected
- `nano-banana-api` matches but gemini-browser is first → not selected

## Auto-Detection Flow

Runs in `/forbotsake-go` Stage 1.5 or `/forbotsake-create` Phase 0.5 when `media-providers.md` doesn't exist.

```bash
# 1. Check for local runtime (text-card support)
command -v bun >/dev/null 2>&1 && SATORI="bun" || {
  command -v node >/dev/null 2>&1 && SATORI="node" || SATORI=""
}

# 2. Chrome MCP tools checked at runtime (can't detect in bash)
# Enabled by default, falls back gracefully if Chrome not available
CHROME="true"

# 3. API keys from environment
NANO_BANANA="${NANO_BANANA_API_KEY:+true}"
SEEDANCE="${SEEDANCE_API_KEY:+true}"
```

Write `media-providers.md` with detected state. All providers are listed; only detected ones are `enabled: true`.

## Provider Types

### `local` — Runs on the user's machine

No network required. Instant results. Currently only `local-satori` for text-cards.

**Implementation:** The skill runs `bun run bin/src/satori-card.ts` (or `node` equivalent) with the content file and brand.md as inputs. Outputs a PNG file.

### `browser` — Uses Chrome automation via Claude for Chrome

Free with existing subscriptions. Requires the Claude for Chrome extension. Subject to UI changes on the provider's website.

**Gemini browser flow:**
1. Navigate to `https://gemini.google.com`
2. Check for login (look for compose area)
3. Type the visual_prompt
4. Wait for image generation (poll, 60s timeout)
5. Extract image as base64 via javascript_tool (canvas.toDataURL)
6. Decode and save to content/ directory

**Veo browser flow:**
1. Navigate to Veo URL
2. Submit video prompt
3. Video generation takes 2-5 minutes
4. Poll for completion, download when ready
5. Save as MP4 to content/ directory

### `api` — Direct API calls

Most reliable. Costs money per generation. Requires API keys in environment variables.

**Nano Banana API:** Standard Gemini API call with image generation parameters.
**Seedance API:** REST API for video generation.

## Fallback Behavior

`fallback: prompt-only` (default):
- Save the `visual_prompt` in the content file's frontmatter
- Set `visual_status: pending`
- Log: "No provider available for {treatment}. Visual prompt saved. Generate manually or configure a provider."
- The pipeline continues with text-only content. No blocking.

## Error Handling

- Provider times out → log warning, try next enabled provider for same treatment, then fallback
- API key invalid → disable that provider, try next, then fallback
- Chrome not logged in → disable browser providers for this session, try API, then fallback
- Satori crashes → log error, fall back to prompt-only for text-cards

Every error must include:
1. What happened
2. Why (likely cause)
3. How to fix (actionable)

Example: "Gemini browser timed out after 60s. Google may be rate-limiting or the page changed. Fix: set NANO_BANANA_API_KEY for API fallback, or try again in a few minutes."

## Adding a New Provider

To add a new image or video generation backend:

1. **Add to media-providers.md schema:** Add a new entry under `image_providers` or `video_providers` with name, type, enabled, treatments, requires, and description.

2. **Add detection logic:** In the auto-detection section of `/forbotsake-create` Phase 0.5, add a check for the new provider's requirements (env var, binary, etc).

3. **Add generation logic:** In `/forbotsake-create` Phase 3.6, add a branch for the new provider under the appropriate treatment type (ai-image or video).

4. **Test the flow:** Run `/forbotsake-create` with the new provider enabled. Verify image/video generation, download, and frontmatter update.

5. **Document:** Add the provider to this file's schema example and to the README provider table.

**Provider interface (informal):**
- Input: `visual_prompt` (string), `brand.md` colors/style, dimensions (WxH)
- Output: image file (PNG) or video file (MP4) saved to content/ directory
- Error: return empty, set `visual_status: failed`, log the error
