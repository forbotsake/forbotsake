# Banned Patterns (Defaults)

Patterns that signal AI-generated content. The adversarial review gates check for
these. Content containing these patterns will contribute to a SOFT_FAIL or HOLD verdict.

**User extensions:** Add your own patterns to `~/.forbotsake/banned-patterns.md`.
The gates read both files and merge them. Your file survives upgrades.

## Punctuation Tells

- Em-dashes (--) in any form
- Excessive semicolons joining independent clauses
- Ellipsis used for dramatic effect more than once per piece

## Structural Tells

- Three-point lists where all items start with the same grammatical structure
- Every paragraph has exactly the same number of sentences
- Opening with a rhetorical question followed by "Let me explain" or "Here's why"
- Closing with "The bottom line is..." or "At the end of the day..."
- Alternating short/long paragraphs in a rigid ABAB pattern

## Vocabulary Tells

### Words that immediately signal AI authorship:
- delve, crucial, robust, comprehensive, nuanced, multifaceted
- furthermore, moreover, additionally, pivotal
- landscape, tapestry, underscore, foster, showcase
- intricate, vibrant, fundamental, significant, interplay
- harness, leverage (as verb), synergize, streamline
- cutting-edge, game-changer, paradigm shift

### Phrases that must fail:
- "In today's [adjective] world/landscape/environment"
- "It's worth noting that..."
- "This is where [X] comes in"
- "Let's dive in" / "Let's break this down"
- "Here's the thing" / "Here's the kicker"
- "Make no mistake"
- "Can't stress this enough"
- "At its core"
- "The bottom line"
- "When it comes to [topic]"
- "Whether you're a [X] or a [Y]"
- "Without further ado"

## Tonal Tells

- Corporate enthusiasm without specifics ("We're excited to announce...")
- Hedging that adds no information ("It's important to consider that...")
- Explaining obvious things ("As we all know...")
- Performative empathy ("We understand your frustration...")
- Generic calls to action ("Don't miss out!" / "Act now!")

## How These Are Used

The Content Red Team (Gate 2) and Publish Kill Switch (Gate 3) check content
against these patterns. Individual pattern matches contribute to a score.
Multiple matches push toward SOFT_FAIL. No single pattern is an automatic fail,
they are signals that accumulate.

To add your own patterns, create `~/.forbotsake/banned-patterns.md` with the same
format. Both files are read and merged by the gates.
