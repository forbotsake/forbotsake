# Changelog

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
