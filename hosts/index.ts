import type { HostConfig } from '../scripts/host-config';
import claude from './claude';
import codex from './codex';

export const ALL_HOST_CONFIGS: HostConfig[] = [claude, codex];

export type Host = (typeof ALL_HOST_CONFIGS)[number]['name'];

export function getHostConfig(name: string): HostConfig {
  const config = ALL_HOST_CONFIGS.find(c => c.name === name);
  if (!config) {
    const alias = ALL_HOST_CONFIGS.find(c => c.cliAliases?.includes(name));
    if (alias) return alias;
    throw new Error(`Unknown host: ${name}. Available: ${ALL_HOST_CONFIGS.map(c => c.name).join(', ')}`);
  }
  return config;
}

export function getExternalHosts(): HostConfig[] {
  return ALL_HOST_CONFIGS.filter(c => c.name !== 'claude');
}
