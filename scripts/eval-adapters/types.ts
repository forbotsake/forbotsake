/**
 * Eval adapter types for forbotsake trigger testing.
 *
 * Host-agnostic definitions that work across Claude, Codex, and future hosts.
 * The key insight: adapters return WHICH skill triggered (not just boolean),
 * enabling cross-skill confusion detection.
 */

/** A single test query in an eval set. */
export interface TriggerQuery {
  query: string;
  should_trigger: boolean;
  /** Which skill this query is intended for (informational, for confusion analysis). */
  intended_skill?: string;
  /** Optional weight for optimization scoring (default 1.0). */
  weight?: number;
}

/** Result of running a single query against a skill. */
export interface EvalResult {
  query: string;
  shouldTrigger: boolean;
  didTrigger: boolean;
  /** Which skill actually triggered. Enables confusion matrix. */
  triggeredSkillName: string | null;
  triggerRate: number;
  runs: number;
  pass: boolean;
  classification: 'pass' | 'fail' | 'inconclusive';
}

/** Result from a single adapter query run. */
export interface AdapterRunResult {
  triggered: boolean;
  triggeredSkillName: string | null;
}

/** Adapter interface. Each host implements this. */
export interface EvalAdapter {
  name: string;
  isAvailable(): Promise<boolean>;
  runQuery(
    query: string,
    skillName: string,
    skillPath: string,
    timeout: number,
  ): Promise<AdapterRunResult>;
}

/** Report for a single skill on a single host. */
export interface SkillEvalReport {
  skillName: string;
  host: string;
  results: EvalResult[];
  precision: number;
  recall: number;
  f1: number;
  passRate: number;
  inconclusiveCount: number;
  /** Skills that falsely triggered for this skill's negatives. */
  confusedWith: Record<string, number>;
}

/** An eval set file. Supports both array format and object-with-cases format. */
export interface EvalSetFile {
  skill?: string;
  description?: string;
  cases: TriggerQuery[];
}

/** Eval runner configuration. */
export interface EvalRunConfig {
  host: string;
  skills?: string[];
  verbose: boolean;
  runsPerQuery: number;
  queryTimeout: number;
  maxWorkers: number;
  triggerThreshold: number;
  jsonOutput: boolean;
}

/** Full eval run report. */
export interface EvalRunReport {
  host: string;
  timestamp: string;
  gitSha: string;
  skills: Record<string, SkillEvalReport>;
  canaryPassed: boolean;
}
