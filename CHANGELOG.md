# Changelog

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
