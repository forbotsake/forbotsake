#!/usr/bin/env bun
/**
 * forbotsake trigger eval runner.
 *
 * Discovers eval sets, runs them through host-specific adapters,
 * and produces a report with precision/recall/F1 per skill.
 *
 * Usage:
 *   bun run eval                              # All skills, Claude
 *   bun run eval --skill forbotsake-go        # One skill
 *   bun run eval --verbose                    # Show each query result
 *   bun run eval --json                       # JSON output only
 *   bun run eval --runs-per-query 1           # Faster (less accurate)
 */

import * as fs from 'fs';
import * as path from 'path';
import { getAdapter, getAvailableAdapters } from './eval-adapters/index';
import type {
  TriggerQuery,
  EvalResult,
  SkillEvalReport,
  EvalRunReport,
  AdapterRunResult,
} from './eval-adapters/types';

const ROOT = path.resolve(import.meta.dir, '..');
const EVALS_DIR = path.join(ROOT, 'evals', 'trigger-sets');

// --- CLI Args ---

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const JSON_OUTPUT = args.includes('--json');
const HOST = args.find((_, i) => args[i - 1] === '--host') ?? 'claude';
const SKILL_FILTER = args.find((_, i) => args[i - 1] === '--skill') ?? null;
const RUNS_PER_QUERY = parseInt(args.find((_, i) => args[i - 1] === '--runs-per-query') ?? '3', 10);
const TIMEOUT = parseInt(args.find((_, i) => args[i - 1] === '--timeout') ?? '30000', 10);
const _MAX_WORKERS = parseInt(args.find((_, i) => args[i - 1] === '--max-workers') ?? '3', 10);
const THRESHOLD = parseFloat(args.find((_, i) => args[i - 1] === '--threshold') ?? '0.5');
void _MAX_WORKERS; // reserved for future parallel execution

// --- Eval Set Discovery ---

function discoverEvalSets(): Map<string, TriggerQuery[]> {
  const sets = new Map<string, TriggerQuery[]>();
  if (!fs.existsSync(EVALS_DIR)) return sets;

  for (const file of fs.readdirSync(EVALS_DIR).sort()) {
    if (!file.endsWith('.json')) continue;
    const skillName = file.replace('.json', '');
    if (SKILL_FILTER && skillName !== SKILL_FILTER) continue;

    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(EVALS_DIR, file), 'utf-8'));
    } catch (err) {
      if (!JSON_OUTPUT) console.warn(`  [warn] ${file}: malformed JSON, skipping`);
      continue;
    }
    // Support both array format and object-with-cases format
    const cases: TriggerQuery[] = Array.isArray(raw) ? raw : ((raw as any).cases ?? []);
    if (cases.length === 0) {
      if (!JSON_OUTPUT) console.warn(`  [warn] ${file}: no cases found`);
      continue;
    }
    sets.set(skillName, cases);
  }
  return sets;
}

// --- Single Skill Eval ---

async function evalSkill(
  skillName: string,
  queries: TriggerQuery[],
  adapter: ReturnType<typeof getAdapter>,
): Promise<SkillEvalReport> {
  if (!adapter) throw new Error(`No adapter available`);

  const skillPath = path.join(ROOT, skillName);
  const results: EvalResult[] = [];
  const confusedWith: Record<string, number> = {};

  for (const query of queries) {
    const runs: AdapterRunResult[] = [];
    let validRuns = 0;

    for (let r = 0; r < RUNS_PER_QUERY; r++) {
      try {
        const result = await adapter.runQuery(query.query, skillName, skillPath, TIMEOUT);
        runs.push(result);
        validRuns++;
      } catch {
        // Crash/error: skip this run (not counted)
      }
    }

    const minValidRuns = RUNS_PER_QUERY === 1 ? 1 : 2;
    const classification = validRuns < minValidRuns ? 'inconclusive' as const : undefined;

    const triggerCount = runs.filter(r => r.triggered).length;
    const triggerRate = validRuns > 0 ? triggerCount / validRuns : 0;
    const didTrigger = triggerRate >= THRESHOLD;

    // Determine which skill actually triggered (majority vote via frequency map)
    const skillVotes = runs
      .filter(r => r.triggeredSkillName)
      .map(r => r.triggeredSkillName!);
    let triggeredSkillName: string | null = null;
    if (skillVotes.length > 0) {
      const freq = new Map<string, number>();
      for (const v of skillVotes) freq.set(v, (freq.get(v) ?? 0) + 1);
      let maxCount = 0;
      for (const [name, count] of freq) {
        if (count > maxCount || (count === maxCount && (!triggeredSkillName || name < triggeredSkillName))) {
          triggeredSkillName = name;
          maxCount = count;
        }
      }
    }

    // Track confusion
    if (triggeredSkillName && triggeredSkillName !== skillName && !query.should_trigger) {
      confusedWith[triggeredSkillName] = (confusedWith[triggeredSkillName] ?? 0) + 1;
    }

    const pass = classification === 'inconclusive'
      ? false
      : query.should_trigger
        ? didTrigger
        : !didTrigger;

    const result: EvalResult = {
      query: query.query,
      shouldTrigger: query.should_trigger,
      didTrigger,
      triggeredSkillName,
      triggerRate,
      runs: validRuns,
      pass,
      classification: classification ?? (pass ? 'pass' : 'fail'),
    };
    results.push(result);

    if (VERBOSE && !JSON_OUTPUT) {
      const icon = result.classification === 'inconclusive' ? '?' : result.pass ? 'OK' : 'FAIL';
      const truncQ = query.query.length > 60 ? query.query.slice(0, 57) + '...' : query.query;
      console.log(`  [${icon}] ${truncQ} (rate=${triggerRate.toFixed(2)}, should=${query.should_trigger})`);
    }
  }

  // Calculate precision, recall, F1
  const truePositives = results.filter(r => r.shouldTrigger && r.didTrigger && r.classification !== 'inconclusive').length;
  const falsePositives = results.filter(r => !r.shouldTrigger && r.didTrigger && r.classification !== 'inconclusive').length;
  const falseNegatives = results.filter(r => r.shouldTrigger && !r.didTrigger && r.classification !== 'inconclusive').length;
  const inconclusiveCount = results.filter(r => r.classification === 'inconclusive').length;

  const precision = truePositives + falsePositives > 0
    ? truePositives / (truePositives + falsePositives)
    : 0;
  const recall = truePositives + falseNegatives > 0
    ? truePositives / (truePositives + falseNegatives)
    : 0;
  const f1 = precision + recall > 0
    ? 2 * (precision * recall) / (precision + recall)
    : 0;
  const passRate = results.length > 0
    ? results.filter(r => r.pass).length / results.length
    : 0;

  return {
    skillName,
    host: HOST,
    results,
    precision,
    recall,
    f1,
    passRate,
    inconclusiveCount,
    confusedWith,
  };
}

// --- Report Formatting ---

function printReport(reports: SkillEvalReport[]): void {
  console.log('\n  TRIGGER EVAL RESULTS');
  console.log('  ' + '='.repeat(85));
  console.log(
    '  ' +
    'Skill'.padEnd(30) +
    'P'.padStart(6) +
    'R'.padStart(6) +
    'F1'.padStart(7) +
    'Pass%'.padStart(7) +
    'Inc'.padStart(5) +
    '  Confused With'
  );
  console.log('  ' + '-'.repeat(85));

  for (const r of reports) {
    const confused = Object.entries(r.confusedWith)
      .sort(([, a], [, b]) => b - a)
      .map(([s, n]) => `${s}(${n})`)
      .join(', ');

    console.log(
      '  ' +
      r.skillName.padEnd(30) +
      (r.precision * 100).toFixed(0).padStart(5) + '%' +
      (r.recall * 100).toFixed(0).padStart(5) + '%' +
      (r.f1 * 100).toFixed(1).padStart(6) + '%' +
      (r.passRate * 100).toFixed(0).padStart(6) + '%' +
      String(r.inconclusiveCount).padStart(5) +
      (confused ? `  ${confused}` : '')
    );
  }

  console.log('  ' + '='.repeat(85));

  // Summary
  const avgF1 = reports.reduce((sum, r) => sum + r.f1, 0) / reports.length;
  const totalPass = reports.reduce((sum, r) => sum + r.results.filter(r2 => r2.pass).length, 0);
  const totalQueries = reports.reduce((sum, r) => sum + r.results.length, 0);
  console.log(`  Average F1: ${(avgF1 * 100).toFixed(1)}%  |  ${totalPass}/${totalQueries} queries passed`);
}

// --- Main ---

async function main(): Promise<void> {
  const adapter = getAdapter(HOST);
  if (!adapter) {
    console.error(`Unknown host: ${HOST}. Available: ${getAvailableAdapters().join(', ')}`);
    process.exit(1);
  }

  const available = await adapter.isAvailable();
  if (!available) {
    console.error(`${HOST} CLI is not available. Install it first.`);
    process.exit(1);
  }

  const evalSets = discoverEvalSets();
  if (evalSets.size === 0) {
    console.error('No eval sets found in evals/trigger-sets/');
    process.exit(1);
  }

  if (!JSON_OUTPUT) {
    console.log(`\nRunning trigger evals on ${HOST} (${evalSets.size} skills, ${RUNS_PER_QUERY} runs/query, ${TIMEOUT}ms timeout)`);
  }

  const gitSha = (() => {
    try {
      return Bun.spawnSync(['git', 'rev-parse', '--short', 'HEAD']).stdout.toString().trim();
    } catch {
      return 'unknown';
    }
  })();

  const reports: SkillEvalReport[] = [];

  for (const [skillName, queries] of evalSets) {
    if (!JSON_OUTPUT) console.log(`\n  ${skillName} (${queries.length} queries)...`);
    const report = await evalSkill(skillName, queries, adapter);
    reports.push(report);
    if (!JSON_OUTPUT) {
      console.log(`  -> F1=${(report.f1 * 100).toFixed(1)}% P=${(report.precision * 100).toFixed(0)}% R=${(report.recall * 100).toFixed(0)}%`);
    }
  }

  const fullReport: EvalRunReport = {
    host: HOST,
    timestamp: new Date().toISOString(),
    gitSha,
    skills: Object.fromEntries(reports.map(r => [r.skillName, r])),
    canaryPassed: false, // not yet implemented
  };

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(fullReport, null, 2));
  } else {
    printReport(reports);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
