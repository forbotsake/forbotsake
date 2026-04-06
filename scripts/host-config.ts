/**
 * forbotsake host config system.
 *
 * Simplified version of gstack's HostConfig interface, tailored for
 * forbotsake's 13 marketing skills. Supports path rewrites, tool rewrites,
 * frontmatter transformation, and resolver suppression per host.
 */

export interface HostConfig {
  /** Unique host identifier (e.g., 'codex'). Must match filename in hosts/. */
  name: string;
  /** Human-readable name for logs (e.g., 'OpenAI Codex CLI'). */
  displayName: string;
  /** Binary name for `command -v` detection (e.g., 'codex'). */
  cliCommand: string;
  /** Alternative binary names. */
  cliAliases?: string[];

  // --- Path Configuration ---
  /** Global install path relative to $HOME (e.g., '.codex/skills/forbotsake'). */
  globalRoot: string;
  /** Project-local skill path relative to repo root. */
  localSkillRoot: string;
  /** Gitignored directory under repo root for generated docs (e.g., '.agents'). */
  hostSubdir: string;
  /** Whether preamble generates $FBS_ROOT env var (true for non-Claude hosts). */
  usesEnvVars: boolean;

  // --- Frontmatter Transformation ---
  frontmatter: {
    /** 'allowlist': ONLY keepFields survive. 'denylist': strip listed fields. */
    mode: 'allowlist' | 'denylist';
    /** Fields to preserve (allowlist mode only). */
    keepFields?: string[];
    /** Fields to remove (denylist mode only). */
    stripFields?: string[];
    /** Max chars for description field. null = no limit. */
    descriptionLimit?: number | null;
  };

  // --- Generation ---
  generation: {
    /** Whether to create sidecar metadata file (e.g., openai.yaml for Codex). */
    generateMetadata: boolean;
    /** Metadata file format (e.g., 'openai.yaml'). */
    metadataFormat?: string | null;
    /** Skill directories to exclude from generation for this host. */
    skipSkills?: string[];
  };

  // --- Content Rewrites ---
  /** Literal string replacements on generated SKILL.md content. Order matters, replaceAll. */
  pathRewrites: Array<{ from: string; to: string }>;
  /** Tool name string replacements on content. */
  toolRewrites?: Record<string, string>;
  /** Resolver functions that return empty string for this host. */
  suppressedResolvers?: string[];
}
