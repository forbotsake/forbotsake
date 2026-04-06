---
name: forbotsake-upgrade
description: |
  Upgrade forbotsake to the latest version. Detects install type (git clone
  vs vendored), runs the upgrade, and shows what's new.
  Use when: "upgrade forbotsake", "update forbotsake", "get latest version",
  "forbotsake update".
---

# /forbotsake-upgrade

Upgrade forbotsake to the latest version and show what changed.

## Inline upgrade flow

This section is referenced by all skill preambles when they detect `UPGRADE_AVAILABLE`.

### Step 1: Ask the user (or auto-upgrade)

Check if auto-upgrade is enabled:
```bash
FORBOTSAKE_HOME="${FORBOTSAKE_HOME:-$HOME/.forbotsake}"
_AUTO=""
[ -f "$FORBOTSAKE_HOME/config.yaml" ] && _AUTO=$(grep "^auto_upgrade:" "$FORBOTSAKE_HOME/config.yaml" 2>/dev/null | awk '{print $2}' || true)
echo "AUTO_UPGRADE=$_AUTO"
```

**If `AUTO_UPGRADE=true`:** Skip direct conversation with the user. Log "Auto-upgrading forbotsake..." and proceed to Step 2.

**Otherwise**, ask the user directly in conversation:
- Question: "forbotsake **v{new}** is available (you're on v{old}). Upgrade now?"
- Options: A) Yes, upgrade now B) Always keep me up to date C) Not now D) Never ask again

**If A:** Proceed to Step 2.

**If B:**
```bash
mkdir -p "$FORBOTSAKE_HOME"
echo "auto_upgrade: true" >> "$FORBOTSAKE_HOME/config.yaml"
```
Then proceed to Step 2.

**If C:** Write snooze state:
```bash
_SNOOZE_FILE="$FORBOTSAKE_HOME/update-snoozed"
_REMOTE_VER="{new}"
_CUR_LEVEL=0
if [ -f "$_SNOOZE_FILE" ]; then
  _SNOOZED_VER=$(awk '{print $1}' "$_SNOOZE_FILE")
  if [ "$_SNOOZED_VER" = "$_REMOTE_VER" ]; then
    _CUR_LEVEL=$(awk '{print $2}' "$_SNOOZE_FILE")
  fi
fi
_NEW_LEVEL=$((_CUR_LEVEL + 1))
[ "$_NEW_LEVEL" -gt 3 ] && _NEW_LEVEL=3
echo "$_REMOTE_VER $_NEW_LEVEL $(date +%s)" > "$_SNOOZE_FILE"
```
Tell user the snooze duration. Continue with the current skill.

**If D:**
```bash
mkdir -p "$FORBOTSAKE_HOME"
echo "update_check: false" >> "$FORBOTSAKE_HOME/config.yaml"
```
Tell user update checks are disabled.

### Step 2: Detect install type

```bash
_SKILL_DIR=$(find $HOME/.codex/skills -path "*/forbotsake-upgrade/SKILL.md" -type f 2>/dev/null | head -1)
INSTALL_DIR=$(cd "$(dirname "$_SKILL_DIR")/.." && pwd)

if [ -d "$INSTALL_DIR/.git" ]; then
  INSTALL_TYPE="git"
else
  INSTALL_TYPE="vendored"
fi
echo "Install type: $INSTALL_TYPE at $INSTALL_DIR"
```

### Step 3: Save old version

```bash
OLD_VERSION=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
echo "Old version: $OLD_VERSION"
```

### Step 4: Upgrade

**For git installs:**
```bash
cd "$INSTALL_DIR"
STASH_OUTPUT=$(git stash 2>&1)
git fetch origin
git reset --hard origin/main
echo "$OLD_VERSION" > "$FORBOTSAKE_HOME/just-upgraded-from"
```

If `$STASH_OUTPUT` contains "Saved working directory", warn: "Local changes were stashed."

**For vendored installs:**
```bash
TMP_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/forbotsake/forbotsake.git "$TMP_DIR/forbotsake"
mv "$INSTALL_DIR" "$INSTALL_DIR.bak"
mv "$TMP_DIR/forbotsake" "$INSTALL_DIR"
echo "$OLD_VERSION" > "$FORBOTSAKE_HOME/just-upgraded-from"
rm -rf "$INSTALL_DIR.bak" "$TMP_DIR"
```

### Step 5: Show what's new

```bash
NEW_VERSION=$(cat "$INSTALL_DIR/VERSION" 2>/dev/null || echo "unknown")
echo "Upgraded: $OLD_VERSION → $NEW_VERSION"
```

Read `$INSTALL_DIR/CHANGELOG.md` and show the entries between old and new version.

Tell the user: "forbotsake upgraded to v{new}. Here's what changed: ..."

### Step 6: Refresh symlinks

After upgrading, refresh symlinks to pick up any new skills added in the new version:

```bash
bash "$INSTALL_DIR/bin/sync-links.sh"
```

### Step 7: Verify

```bash
# Verify installation health
bash "$INSTALL_DIR/bin/sync-links.sh" --check
```

If the check reports missing skills, re-run `bash "$INSTALL_DIR/bin/sync-links.sh"` to repair.
If that fails, suggest reinstalling: `bash "$INSTALL_DIR/bin/install.sh"`
