# Cross-Skill Confusion Matrix

Documents which forbotsake skills are most likely to be confused with each other
by description-based routing. Each pair shares keywords that could cause the wrong
skill to trigger.

## High Confusion Risk

| Pair | Shared Keywords | Distinguisher |
|------|----------------|---------------|
| `cmo-check` vs `content-check` | "review", "check" | cmo-check reviews STRATEGY, content-check reviews CONTENT |
| `content-plan` vs `create` | "post", "content" | content-plan is PLANNING, create is WRITING |
| `marketing-start` vs `go` | "market", "marketing" | marketing-start produces strategy only, go runs full pipeline |

## Medium Confusion Risk

| Pair | Shared Keywords | Distinguisher |
|------|----------------|---------------|
| `publish` vs `cron` | "auto-post" | publish is one-shot, cron is scheduled/recurring |
| `spy` vs `icp` | "research" | spy researches COMPETITORS, icp researches AUDIENCE |
| `sharpen` vs `spy` | "research", "target" | sharpen targets a SPECIFIC PERSON, spy targets COMPETITORS in general |

## Critical: forbotsake-go vs everything

`forbotsake-go` is a pipeline dispatcher that should ONLY trigger for general
"do marketing" intent. It must NOT steal triggers from specific skills.

Every other skill's strongest positive query is a negative for `forbotsake-go`.

## Running the confusion matrix

```bash
bun run eval --confusion-matrix
```

This runs every positive query from every skill against every other skill,
producing a 13x13 matrix showing false trigger rates. Expensive (~5,850 API calls).
