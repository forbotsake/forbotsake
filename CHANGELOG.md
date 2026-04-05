# Changelog

## 0.5.0 (2026-04-05)

### Added
- **`/forbotsake-cron` — autonomous auto-posting via cron.** Your content posts itself. A cron job runs every 30 minutes, reads `content-calendar.md` for scheduled posts, and uses `claude -p --chrome` to post reviewed content without an active session.
  - `bin/forbotsake-cron` bash script with Python3 calendar parser, Chrome health check, lockfile with PID+TTL, catch-up policies (`skip`/`post-late`), 5MB log rotation, and 10-minute timeout.
  - `forbotsake-cron/SKILL.md` skill with `install`, `status`, `uninstall`, `pause`, `resume`, `doctor`, and `run-now` subcommands.
  - Tick mode in `forbotsake-go`: file-flag detection, Stage 5 only guard, atomic claim state (`status: posting`) to prevent double-posts, stuck-posting recovery.
  - Autonomous receipt formats in `forbotsake-publish`: AUTO, AUTO/FAILED, and MISSED entries with session ID, scheduled/posted timestamps.
  - `scheduled_datetime` ISO 8601 column support in content-calendar.md (including `Z` UTC suffix).
  - Project-scoped state files via md5 hash (supports multiple projects on one machine).
  - Headless safety guard: prevents uncontrolled pipeline runs when tick flag is missing.
- `status: posting` and `status: failed` frontmatter statuses tracked in forbotsake-go pipeline state.

### Changed
- CLAUDE.md: added Autopilot Mode section and forbotsake-cron routing rules.
- README: added Autopilot Mode section with commands and prerequisites.
- forbotsake-publish: `FAILED` receipt text corrected from "Will retry" to "Set back to reviewed to retry."

## 0.4.0 (2026-04-05)

### Added
- **Adversarial review gates** -- three quality gates that catch bad content before it goes public. forbotsake no longer trusts its own output.
  - **Strategy Reviewer** (Gate 1, in `/forbotsake-marketing-start`): independent subagent reviews strategy.md for vague positioning, generic ICPs, unjustified channel scores. 5 dimensions, max 2 revision cycles.
  - **Content Red Team** (Gate 2, in `/forbotsake-content-check`): independent subagent reviews content for AI-slop patterns, voice authenticity, ICP specificity, originality, strategy alignment, and reputation risk. PASS/SOFT_FAIL/HARD_FAIL verdicts with max 2 rewrite iterations.
  - **Publish Kill Switch** (Gate 3, in `/forbotsake-publish`): final sanity check before content goes public. Scans for banned patterns, factual claims, and embarrassment risk. GO/HOLD verdict, always requires explicit user confirmation.
- `knowledge/banned-patterns-defaults.md` -- AI-slop pattern blocklist (em-dashes, corporate buzzwords, structural tells). Upgrade-safe defaults.
- User-extensible banned patterns via `~/.forbotsake/banned-patterns.md`. Survives upgrades.
- `FORBOTSAKE_FAST=1` env var to skip all adversarial gates during rapid iteration.
- Gate metrics logging to `~/.forbotsake/review-metrics.jsonl` for retrospective analysis.
- `status: hard-failed` frontmatter status for content that failed the Content Red Team.
- `reviewer_notes:` frontmatter field in content files for reviewer feedback (per-file, not global).

### Changed
- Pipeline updated: UNDERSTAND -> CHALLENGE -> RESEARCH -> PLAN -> SHARPEN -> CREATE -> **RED TEAM** -> REVIEW -> **KILL SWITCH** -> SHIP -> MEASURE.
- `/forbotsake-content-check` now runs adversarial review (Phase 2.5) before the existing 7-dimension scorecard (Phase 3). Content must pass both.
- `/forbotsake-create` reads `reviewer_notes:` from content frontmatter to avoid repeating patterns flagged by the Content Red Team.
- `/forbotsake-go` detects `status: hard-failed` and stops pipeline instead of retrying endlessly. Supports `FORBOTSAKE_FAST=1`.
- `Agent` added to `allowed-tools` in marketing-start, content-check, and publish skills (required for subagent dispatch).
- CLAUDE.md updated with Quality Gates section and new pipeline diagram.
- README updated with Quality Gates documentation and revised pipeline.

## 0.3.1 (2026-04-05)

### Added
- `/forbotsake-sharpen` — new skill for targeted outreach. Takes a specific person or organization, does deep contextual research, maps your connections and warm paths, generates tailored outreach angles, and produces a multi-touch execution plan. The missing layer between "identify an opportunity" and "create content."
- `knowledge/frameworks/execution-intelligence.md` — 5-step methodology for execution intelligence: classify target, deep research (with fast path for known targets), map your position, generate angles, build multi-touch plan. Quality gates catch shallow single-action plans.
- `founder-profile.md` — durable founder identity file at `~/.forbotsake/`. Captures affiliations, key relationships, unfair advantages, and communication style. Written by Q6 in `/forbotsake-marketing-start`, read by `/forbotsake-sharpen` for warm path discovery.
- `.gitignore` — covers `execution-plans/` and other sensitive output artifacts.

### Changed
- `/forbotsake-marketing-start` now asks 6 questions (was 5). New Q6 captures your position: communities, connections, and unfair advantages. Writes `founder-profile.md`.
- `/forbotsake-content-plan` now flags high-value targets with "needs sharpen" notes when building the calendar. Suggests running `/forbotsake-sharpen` before creating content for specific people or organizations.
- Pipeline updated: UNDERSTAND → CHALLENGE → RESEARCH → PLAN → **SHARPEN** → CREATE → REVIEW → SHIP → MEASURE. SHARPEN is optional but recommended for targeted opportunities.
- CLAUDE.md routing rules updated with sharpen triggers and prerequisite callout.
- README updated with new skill count, pipeline diagram, and quick start reflecting 6 questions.

## 0.3.0 (2026-04-05)

### Added
- `/forbotsake-go` — one command from zero to published. Detects your marketing pipeline state (strategy, content, review status) and runs remaining stages automatically. Type `/forbotsake-go` and get content created, reviewed, formatted, committed, and pushed without thinking about which skill to invoke.
- Orchestrated mode for sub-skills. When invoked by `/forbotsake-go`, sub-skills auto-select defaults, skip interactive prompts where possible, and return control cleanly. The draft approval loop in `/forbotsake-create` is preserved (the high-value interaction).
- State file resume: if a session crashes mid-pipeline, `/forbotsake-go` picks up where it left off.
- `--dry-run` mode: see what `/forbotsake-go` would do without invoking any sub-skills.
- `knowledge/published-log-schema.md` — single source of truth for the log format shared by publish, go, and retro.

### Changed
- Default entry point is now `/forbotsake-go` instead of `/forbotsake-marketing-start`. Individual skills remain available for users who want control.
- Routing updated: "do marketing", "market this", "ship my marketing" routes to `/forbotsake-go`.
- `/forbotsake-publish` now updates content frontmatter to `status: published` after logging, preventing re-publish loops.

## 0.2.0 (2026-04-05)

### Added
- `/forbotsake-publish` now auto-posts to X/Twitter and LinkedIn via Claude for Chrome. Type `/forbotsake-publish`, pick POST mode, and Claude controls your browser to compose and publish. No API keys, no OAuth, no setup. Your Chrome session IS the auth.
- Platform tiering: X and LinkedIn get full auto-post, blog/Reddit/HN/Product Hunt get copy-paste + browser deep link, email gets copy-paste only, GitHub uses `gh` CLI.
- Account identity preflight: before posting, the skill verifies you're logged into the right account.
- Post-publish verification: after posting, reads the published content back to confirm it matches the source.
- Partial thread recovery: if a thread fails mid-post, captures what's live and gives you the rest as copy-paste.
- Failure logging: when POST mode fails, logs the reason to published-log.md so you know what happened.
- `knowledge/frameworks/publishing-automation.md`: platform-specific posting playbook with compose flows, schedule flows, failure modes, and anti-bot safety guidelines.

### Changed
- `/forbotsake-publish` rewritten from 300 to 520 lines. Now supports two modes: POST (auto-post via Chrome) and COPY (format for copy-paste, the original behavior). COPY mode still works exactly as before.
- Platform list expanded from 4 to 9+, organized by automation tier.
- Published-log.md entries now include Mode field (POST/COPY) and differentiated formats for success, partial, and failed posts.
- Content file frontmatter status only set to `published` after a successful POST, not for COPY mode.

## 0.1.2 (2026-04-05)

### Changed
- Skills now auto-upgrade (or prompt to upgrade) when a newer version is detected, instead of showing a passive "run /forbotsake-upgrade" message. Mirrors gstack's inline upgrade flow with 4 options: upgrade now, always auto-upgrade, snooze, or disable checks.

## 0.1.1 (2026-04-05)

### Fixed
- Skills are now discoverable after install. Previously, `git clone` placed skills two levels deep where Claude Code couldn't find them. A new `sync-links.sh` script creates the flat symlink structure Claude Code requires.

### Added
- `/forbotsake` router skill as the main entry point, auto-creates symlinks on first run
- `bin/sync-links.sh` with `--check` doctor mode for verifying installation health
- `bin/install.sh` for one-liner curl|bash installation
- `bin/uninstall.sh` for clean removal with `--force` flag
- CI smoke test (GitHub Actions) testing install, verify, uninstall on Ubuntu + macOS
- Troubleshooting section in README

### Changed
- README install instructions now offer two options (curl|bash + manual)
- `/forbotsake-upgrade` now refreshes symlinks after upgrading

## 0.1.0 (2026-04-05)

Initial release. 9 marketing skills covering the full pipeline:
UNDERSTAND → CHALLENGE → RESEARCH → PLAN → CREATE → REVIEW → SHIP → MEASURE.

### Skills
- `/forbotsake-marketing-start` — GTM thinking, produces strategy.md
- `/forbotsake-cmo-check` — challenge your marketing strategy
- `/forbotsake-spy` — competitor research and messaging matrix
- `/forbotsake-icp` — build ICP persona from research
- `/forbotsake-content-plan` — content calendar and themes
- `/forbotsake-create` — write actual marketing content
- `/forbotsake-content-check` — pre-publish brand and messaging review
- `/forbotsake-publish` — post, schedule, and automate content
- `/forbotsake-retro` — weekly marketing retrospective
- `/forbotsake-upgrade` — upgrade forbotsake to latest version

### Infrastructure
- Auto-update check in every skill preamble
- `bin/forbotsake-update-check` for version comparison with snooze + cache
