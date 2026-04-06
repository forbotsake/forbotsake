#!/usr/bin/env bun
/**
 * One-time conversion script: SKILL.md -> SKILL.md.tmpl
 * Replaces the common preamble block with {{FBS_PREAMBLE}} placeholder.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(import.meta.dir, '..');
const SKIP = ['forbotsake-create']; // Already converted

// The common preamble pattern to replace.
// Matches from the first ```bash + FORBOTSAKE_HOME through echo "BRANCH:
const PREAMBLE_REGEX = /```bash\nFORBOTSAKE_HOME="\$\{FORBOTSAKE_HOME:-\$HOME\/\.forbotsake\}"\nmkdir -p "\$FORBOTSAKE_HOME"\n\n# Check for updates\n_SKILL_DIR=\$\(dirname[^\n]+\n_FBS_ROOT=\$\(cd[^\n]+\n_UPD=""\n\[.*forbotsake-update-check.*\n\[.*\$_UPD.*\n_BRANCH=\$\(git branch[^\n]+\necho "BRANCH: \$_BRANCH"/;

const entries = fs.readdirSync(ROOT, { withFileTypes: true });

let converted = 0;
let skipped = 0;

for (const entry of entries) {
  if (!entry.isDirectory() || !entry.name.startsWith('forbotsake-')) continue;
  if (SKIP.includes(entry.name)) { skipped++; continue; }

  const skillMd = path.join(ROOT, entry.name, 'SKILL.md');
  if (!fs.existsSync(skillMd)) continue;

  const content = fs.readFileSync(skillMd, 'utf-8');
  const tmplPath = path.join(ROOT, entry.name, 'SKILL.md.tmpl');

  if (PREAMBLE_REGEX.test(content)) {
    const tmpl = content.replace(PREAMBLE_REGEX, '{{FBS_PREAMBLE}}\n\n```bash');
    fs.writeFileSync(tmplPath, tmpl);
    console.log(`[converted] ${entry.name}/SKILL.md.tmpl (preamble replaced)`);
    converted++;
  } else {
    // No standard preamble found, copy as-is for manual handling
    fs.writeFileSync(tmplPath, content);
    console.log(`[copied] ${entry.name}/SKILL.md.tmpl (no standard preamble, needs manual edit)`);
    converted++;
  }
}

console.log(`\nConverted: ${converted}, Skipped: ${skipped}`);
