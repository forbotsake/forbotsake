/**
 * Eval adapter registry.
 *
 * Maps host names to their eval adapters. New hosts add an adapter file
 * and register it here.
 */

import type { EvalAdapter } from './types';
import { claudeAdapter } from './claude';

export const ADAPTERS: Record<string, EvalAdapter> = {
  claude: claudeAdapter,
};

export function getAdapter(host: string): EvalAdapter | undefined {
  return ADAPTERS[host];
}

export function getAvailableAdapters(): string[] {
  return Object.keys(ADAPTERS);
}
