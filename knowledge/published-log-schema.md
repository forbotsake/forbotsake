# published-log.md Schema

Single source of truth for the published content log format. Referenced by:
- `/forbotsake-publish` (writes entries)
- `/forbotsake-go` (writes entries via publish, reads for delta detection)
- `/forbotsake-retro` (reads entries for measurement)

## File Structure

```markdown
# Published Content Log

Track what was published, where, and when. Used by /forbotsake-retro for measurement.

---

## {YYYY-MM-DD} - {Platform Name}

- **Content:** {title or first line preview}
- **Source file:** {path relative to project root, e.g. content/2026-04-05-x-thread-ai-tools.md}
- **Format:** {thread|blog|email|linkedin|reddit|hackernews|producthunt|other}
- **Link:** {URL after posting, or "pending"}
- **Notes:** {any context — e.g. "Shipped via /forbotsake-go | NEW"}

---
```

## Field Definitions

| Field | Required | Description |
|-------|----------|-------------|
| Date header | Yes | `## YYYY-MM-DD - {Platform}` format |
| Content | Yes | Title or first ~80 chars of the content |
| Source file | Yes | Path to the source .md file in content/ |
| Format | Yes | Platform format identifier (lowercase) |
| Link | Yes | URL once posted, "pending" before posting |
| Notes | No | Free text for context |

## Delta Detection

To check if a content file has been published:
```bash
grep "Source file.*content/{filename}" published-log.md
```

Note: The log format uses markdown bold (`**Source file:**`), so use a wildcard pattern that matches both `Source file:` and `**Source file:**`.

If found, the file has been published before. Check the date header to see when.

## Rules

1. Each platform gets its own entry (one source file published to X AND LinkedIn = 2 entries)
2. Entries are append-only (never edit or delete existing entries)
3. Date headers use ISO format (YYYY-MM-DD)
4. The `---` separator between entries is required for parsing
5. "pending" in Link field means formatted but not yet posted to the platform
