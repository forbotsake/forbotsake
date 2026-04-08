/**
 * Claude Code eval adapter.
 *
 * Ports the stream-json detection logic from skill-creator's run_eval.py
 * to TypeScript. Creates a temporary command file so the skill appears in
 * Claude's available_skills list, then parses stream events to detect
 * WHICH skill was triggered (not just boolean).
 *
 * Key implementation notes (from run_eval.py):
 * - UUID suffix on temp files prevents parallel race conditions
 * - CLAUDECODE env var must be stripped for nested claude -p
 * - Stream events arrive before the full assistant message
 * - Both Skill and Read tool invocations count as triggers
 */

import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import type { EvalAdapter, AdapterRunResult } from './types';

function findProjectRoot(): string {
  let current = process.cwd();
  while (current !== '/') {
    if (fs.existsSync(path.join(current, '.claude'))) return current;
    current = path.dirname(current);
  }
  return process.cwd();
}

function extractSkillName(json: string): string | null {
  // Try to parse accumulated JSON to extract the skill name
  // The Skill tool input looks like: {"skill": "forbotsake-create", ...}
  const skillMatch = json.match(/"skill"\s*:\s*"([^"]+)"/);
  if (skillMatch) return skillMatch[1];

  // The Read tool input looks like: {"file_path": "...forbotsake-create/SKILL.md"}
  const pathMatch = json.match(/forbotsake-[\w-]+(?=\/SKILL|(?=-skill-))/);
  if (pathMatch) return pathMatch[0];

  return null;
}

async function runSingleQuery(
  query: string,
  skillName: string,
  skillDescription: string,
  timeout: number,
  projectRoot: string,
): Promise<AdapterRunResult> {
  const uniqueId = randomUUID().slice(0, 8);
  const cleanName = `${skillName}-skill-${uniqueId}`;
  const commandsDir = path.join(projectRoot, '.claude', 'commands');
  const commandFile = path.join(commandsDir, `${cleanName}.md`);

  try {
    fs.mkdirSync(commandsDir, { recursive: true });

    const indentedDesc = skillDescription.split('\n').join('\n  ');
    const commandContent = [
      '---',
      'description: |',
      `  ${indentedDesc}`,
      '---',
      '',
      `# ${skillName}`,
      '',
      `This skill handles: ${skillDescription}`,
    ].join('\n');

    fs.writeFileSync(commandFile, commandContent);

    const env = Object.fromEntries(
      Object.entries(process.env).filter(([k]) => k !== 'CLAUDECODE'),
    );

    return await new Promise<AdapterRunResult>((resolve) => {
      const proc = spawn(
        'claude',
        ['-p', query, '--output-format', 'stream-json', '--verbose', '--include-partial-messages'],
        { cwd: projectRoot, env, stdio: ['ignore', 'pipe', 'ignore'] },
      );

      let buffer = '';
      let pendingToolName: string | null = null;
      let accumulatedJson = '';
      let resolved = false;

      const finish = (result: AdapterRunResult) => {
        if (resolved) return;
        resolved = true;
        proc.kill();
        resolve(result);
      };

      const timer = setTimeout(() => {
        finish({ triggered: false, triggeredSkillName: null });
      }, timeout);

      proc.stdout.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf-8');

        while (buffer.includes('\n')) {
          const idx = buffer.indexOf('\n');
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);

          if (!line) continue;

          let event: any;
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }

          // Early detection via stream events
          if (event.type === 'stream_event') {
            const se = event.event ?? {};
            const seType = se.type ?? '';

            if (seType === 'content_block_start') {
              const cb = se.content_block ?? {};
              if (cb.type === 'tool_use') {
                const toolName = cb.name ?? '';
                if (toolName === 'Skill' || toolName === 'Read') {
                  pendingToolName = toolName;
                  accumulatedJson = '';
                } else {
                  // Non-skill tool use means the skill was NOT triggered
                  clearTimeout(timer);
                  finish({ triggered: false, triggeredSkillName: null });
                  return;
                }
              }
            } else if (seType === 'content_block_delta' && pendingToolName) {
              const delta = se.delta ?? {};
              if (delta.type === 'input_json_delta') {
                accumulatedJson += delta.partial_json ?? '';
                if (accumulatedJson.includes(cleanName)) {
                  clearTimeout(timer);
                  finish({
                    triggered: true,
                    triggeredSkillName: extractSkillName(accumulatedJson) ?? skillName,
                  });
                  return;
                }
              }
            } else if (seType === 'content_block_stop' || seType === 'message_stop') {
              if (pendingToolName) {
                const triggered = accumulatedJson.includes(cleanName);
                clearTimeout(timer);
                finish({
                  triggered,
                  triggeredSkillName: triggered
                    ? (extractSkillName(accumulatedJson) ?? skillName)
                    : extractSkillName(accumulatedJson),
                });
                return;
              }
              if (seType === 'message_stop') {
                clearTimeout(timer);
                finish({ triggered: false, triggeredSkillName: null });
                return;
              }
            }
          }

          // Fallback: full assistant message
          if (event.type === 'assistant') {
            const message = event.message ?? {};
            for (const item of message.content ?? []) {
              if (item.type !== 'tool_use') continue;
              const toolName = item.name ?? '';
              const toolInput = item.input ?? {};
              if (toolName === 'Skill' && (toolInput.skill ?? '').includes(cleanName)) {
                clearTimeout(timer);
                finish({
                  triggered: true,
                  triggeredSkillName: toolInput.skill ?? skillName,
                });
                return;
              }
              if (toolName === 'Read' && (toolInput.file_path ?? '').includes(cleanName)) {
                clearTimeout(timer);
                finish({
                  triggered: true,
                  triggeredSkillName: extractSkillName(toolInput.file_path ?? '') ?? skillName,
                });
                return;
              }
              // Other tool means no trigger
              clearTimeout(timer);
              finish({ triggered: false, triggeredSkillName: null });
              return;
            }
          }

          if (event.type === 'result') {
            clearTimeout(timer);
            finish({ triggered: false, triggeredSkillName: null });
            return;
          }
        }
      });

      proc.on('close', () => {
        clearTimeout(timer);
        finish({ triggered: false, triggeredSkillName: null });
      });

      proc.on('error', () => {
        clearTimeout(timer);
        finish({ triggered: false, triggeredSkillName: null });
      });
    });
  } finally {
    try {
      if (fs.existsSync(commandFile)) fs.unlinkSync(commandFile);
    } catch {
      // Best-effort cleanup
    }
  }
}

export const claudeAdapter: EvalAdapter = {
  name: 'claude',

  async isAvailable(): Promise<boolean> {
    try {
      const proc = Bun.spawnSync(['claude', '--version'], { stderr: 'pipe' });
      return proc.exitCode === 0;
    } catch {
      return false;
    }
  },

  async runQuery(
    query: string,
    skillName: string,
    skillPath: string,
    timeout: number,
  ): Promise<AdapterRunResult> {
    // Read the skill description from the SKILL.md file
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      return { triggered: false, triggeredSkillName: null };
    }

    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return { triggered: false, triggeredSkillName: null };

    // Extract description from YAML frontmatter
    const descMatch = fmMatch[1].match(/description:\s*[>|]?\s*\n?([\s\S]*?)(?=\n\w|\n---)/);
    const description = descMatch ? descMatch[1].replace(/^\s*>\s*/, '').trim() : '';
    if (!description) return { triggered: false, triggeredSkillName: null };

    const projectRoot = findProjectRoot();
    return runSingleQuery(query, skillName, description, timeout, projectRoot);
  },
};
