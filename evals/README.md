# forbotsake Trigger Evals

Measures whether forbotsake skills trigger correctly when they should, and
DON'T trigger when they shouldn't.

## Quick Start

```bash
# Run all skills against Claude
bun run eval

# Run a single skill
bun run eval --skill forbotsake-go

# Verbose output (shows each query)
bun run eval --verbose

# JSON output for scripting
bun run eval --json
```

## Eval Set Format

Each file in `trigger-sets/` is a JSON array or object with `cases`:

```json
[
  {"query": "realistic user prompt here", "should_trigger": true},
  {"query": "near-miss that needs a different skill", "should_trigger": false, "intended_skill": "forbotsake-create"}
]
```

### Writing good queries

- **Realistic**: multi-sentence, include context ("I just finished my strategy.md and...")
- **Near-miss negatives**: share keywords with the target skill but need a different one
- **No em-dashes**: use commas or periods instead
- **10-15 positives + 10-15 negatives** per skill
- **intended_skill**: always include on negatives (enables confusion analysis)

See `confusion-matrix.md` for which skills to test against each other.

## Interpreting Results

| Metric | What it means |
|--------|---------------|
| Precision | Of queries that triggered this skill, what % should have? |
| Recall | Of queries that should trigger this skill, what % did? |
| F1 | Harmonic mean of P and R. Target: >80% |
| Confused With | Skills that falsely triggered for this skill's negatives |

### What to do with results

- **F1 > 90%**: Description is working well. No action needed.
- **F1 80-90%**: Check which queries failed. May need description tweaks.
- **F1 < 80%**: Description needs rewriting or skill may need merging.
- **High "Confused With"**: The two skills may need clearer differentiation or merging.

## Architecture

```
evals/trigger-sets/*.json     (host-agnostic test queries)
         |
  scripts/run-trigger-evals.ts     (orchestrator)
         |
  scripts/eval-adapters/claude.ts  (stream-json parser)
```

The eval runner creates temporary `.claude/commands/` files to make skills
discoverable, runs `claude -p` with stream-json output, and parses the stream
to detect WHICH skill was triggered (not just boolean).
