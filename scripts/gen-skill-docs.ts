#!/usr/bin/env bun
/**
 * forbotsake skill doc generator.
 *
 * Reads .tmpl templates, resolves {{PLACEHOLDER}} patterns,
 * applies host-specific transformations, writes SKILL.md files.
 *
 * Usage:
 *   bun run gen:skill-docs                    # Generate for all hosts
 *   bun run gen:skill-docs --host claude      # Generate for Claude only
 *   bun run gen:skill-docs --host codex       # Generate for Codex only
 *   bun run gen:skill-docs --dry-run          # Check for drift without writing
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { ALL_HOST_CONFIGS, getHostConfig } from '../hosts/index';
import { RESOLVERS } from './resolvers/index';
import type { HostConfig } from './host-config';
import type { TemplateContext } from './resolvers/types';

const ROOT = path.resolve(import.meta.dir, '..');
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const HOST_ARG = args.find(a => a.startsWith('--host='))?.split('=')[1]
  ?? (args.includes('--host') ? args[args.indexOf('--host') + 1] : null);

// --- Template Discovery ---

function discoverTemplates(): string[] {
  const templates: string[] = [];
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    if (!entry.name.startsWith('forbotsake-')) continue;

    const tmplPath = path.join(ROOT, entry.name, 'SKILL.md.tmpl');
    if (fs.existsSync(tmplPath)) {
      templates.push(tmplPath);
    }
  }

  return templates.sort();
}

// --- Frontmatter Transformation ---

function transformFrontmatter(content: string, config: HostConfig): string {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return content;

  const fmRaw = fmMatch[1];
  const body = content.slice(fmMatch[0].length);

  if (config.frontmatter.mode === 'denylist') {
    // For Claude (primary host): preserve frontmatter as-is, only strip listed fields
    const strip = config.frontmatter.stripFields ?? [];
    if (strip.length === 0) return content;  // Nothing to strip

    let result = fmRaw;
    for (const field of strip) {
      // Remove field and its value (handles multiline YAML values)
      result = result.replace(new RegExp(`^${field}:.*(?:\\n  .*)*`, 'gm'), '');
    }
    return `---\n${result.trim()}\n---${body}`;
  }

  if (config.frontmatter.mode === 'allowlist') {
    // For external hosts: rebuild frontmatter with only allowed fields
    const parsed = yaml.parse(fmRaw) as Record<string, unknown>;
    const keep = new Set(config.frontmatter.keepFields ?? []);
    const filtered: Record<string, unknown> = {};
    for (const key of Object.keys(parsed)) {
      if (keep.has(key)) filtered[key] = parsed[key];
    }

    // Enforce description limit
    if (config.frontmatter.descriptionLimit && typeof filtered.description === 'string') {
      if (filtered.description.length > config.frontmatter.descriptionLimit) {
        filtered.description = filtered.description.slice(0, config.frontmatter.descriptionLimit);
        console.warn(`  [warn] description truncated to ${config.frontmatter.descriptionLimit} chars`);
      }
    }

    return `---\n${yaml.stringify(filtered).trim()}\n---${body}`;
  }

  return content;
}

// --- Placeholder Resolution ---

function resolvePlaceholders(content: string, ctx: TemplateContext): string {
  const suppressed = new Set(ctx.hostConfig.suppressedResolvers ?? []);

  return content.replace(/\{\{(\w+(?::[^}]+)?)\}\}/g, (match, fullKey: string) => {
    const [resolverName, ...resolverArgs] = fullKey.split(':');

    if (suppressed.has(resolverName)) return '';

    const resolver = RESOLVERS[resolverName];
    if (!resolver) {
      throw new Error(`Unknown placeholder {{${resolverName}}} in ${ctx.tmplPath}`);
    }

    return resolver(ctx, resolverArgs.length > 0 ? resolverArgs : undefined);
  });
}

// --- Path & Tool Rewrites ---

function applyRewrites(content: string, config: HostConfig): string {
  let result = content;

  for (const { from, to } of config.pathRewrites) {
    result = result.replaceAll(from, to);
  }

  if (config.toolRewrites) {
    for (const [from, to] of Object.entries(config.toolRewrites)) {
      result = result.replaceAll(from, to);
    }
  }

  return result;
}

// --- Output Path ---

function getOutputPath(tmplPath: string, config: HostConfig): string {
  const skillDir = path.basename(path.dirname(tmplPath));

  if (config.name === 'claude') {
    return path.join(path.dirname(tmplPath), 'SKILL.md');
  }

  const hostDir = path.join(ROOT, config.hostSubdir, 'skills', skillDir);
  return path.join(hostDir, 'SKILL.md');
}

// --- Metadata Generation ---

function generateMetadata(skillName: string, description: string, outputDir: string, config: HostConfig): void {
  if (!config.generation.generateMetadata) return;

  const format = config.generation.metadataFormat;
  if (format === 'openai.yaml') {
    const meta = { name: skillName, description: description.trim() };
    const metaPath = path.join(outputDir, 'openai.yaml');
    fs.mkdirSync(path.dirname(metaPath), { recursive: true });
    fs.writeFileSync(metaPath, yaml.stringify(meta));
  }
}

// --- Main Pipeline ---

function processTemplate(tmplPath: string, config: HostConfig): { outputPath: string; content: string } {
  const skillName = path.basename(path.dirname(tmplPath));
  const raw = fs.readFileSync(tmplPath, 'utf-8');

  const ctx: TemplateContext = {
    skillName,
    tmplPath,
    host: config.name,
    hostConfig: config,
  };

  // 1. Resolve placeholders
  let content = resolvePlaceholders(raw, ctx);

  // 2. Transform frontmatter
  content = transformFrontmatter(content, config);

  // 3. Apply path & tool rewrites
  content = applyRewrites(content, config);

  const outputPath = getOutputPath(tmplPath, config);
  return { outputPath, content };
}

// --- Entry Point ---

const hostsToRun = HOST_ARG
  ? [getHostConfig(HOST_ARG)]
  : ALL_HOST_CONFIGS;

let staleCount = 0;
let writeCount = 0;

for (const hostConfig of hostsToRun) {
  const skipSet = new Set(hostConfig.generation.skipSkills ?? []);
  const templates = discoverTemplates();

  console.log(`\n[${hostConfig.displayName}] Processing ${templates.length} templates...`);

  for (const tmplPath of templates) {
    const skillName = path.basename(path.dirname(tmplPath));

    if (skipSet.has(skillName)) {
      console.log(`  [skip] ${skillName} (in skipSkills for ${hostConfig.name})`);
      continue;
    }

    try {
      const { outputPath, content } = processTemplate(tmplPath, hostConfig);

      if (DRY_RUN) {
        if (fs.existsSync(outputPath)) {
          const existing = fs.readFileSync(outputPath, 'utf-8');
          if (existing !== content) {
            console.log(`  [STALE] ${path.relative(ROOT, outputPath)}`);
            staleCount++;
          } else {
            console.log(`  [ok] ${path.relative(ROOT, outputPath)}`);
          }
        } else {
          console.log(`  [MISSING] ${path.relative(ROOT, outputPath)}`);
          staleCount++;
        }
      } else {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, content);
        console.log(`  [write] ${path.relative(ROOT, outputPath)}`);
        writeCount++;

        // Generate metadata if needed
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
          const parsed = yaml.parse(fmMatch[1]) as Record<string, unknown>;
          if (typeof parsed.description === 'string') {
            generateMetadata(skillName, parsed.description, path.dirname(outputPath), hostConfig);
          }
        }
      }
    } catch (err) {
      console.error(`  [ERROR] ${skillName}: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  }
}

if (DRY_RUN) {
  if (staleCount > 0) {
    console.error(`\n${staleCount} file(s) are stale. Run \`bun run gen:skill-docs\` to regenerate.`);
    process.exit(1);
  }
  console.log('\nAll generated files are up to date.');
} else {
  console.log(`\nWrote ${writeCount} file(s).`);
}
