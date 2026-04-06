import type { HostConfig } from '../scripts/host-config';

const codex: HostConfig = {
  name: 'codex',
  displayName: 'OpenAI Codex CLI',
  cliCommand: 'codex',
  cliAliases: ['agents'],

  globalRoot: '.codex/skills/forbotsake',
  localSkillRoot: '.agents/skills/forbotsake',
  hostSubdir: '.agents',
  usesEnvVars: true,

  frontmatter: {
    mode: 'allowlist',
    keepFields: ['name', 'description'],
    descriptionLimit: 1024,
  },

  generation: {
    generateMetadata: true,
    metadataFormat: 'openai.yaml',
    skipSkills: ['forbotsake-cron'],  // Chrome-only, no meaningful fallback
  },

  pathRewrites: [
    { from: '~/.claude/skills/forbotsake', to: '$FBS_ROOT' },
    { from: '~/.claude/skills', to: '$HOME/.codex/skills' },
    { from: '.claude/skills/forbotsake', to: '.agents/skills/forbotsake' },
    { from: '.claude/skills', to: '.agents/skills' },
  ],

  toolRewrites: {
    'Use AskUserQuestion': 'Ask the user directly in conversation',
    'use AskUserQuestion': 'ask the user directly in conversation',
    'AskUserQuestion': 'direct conversation with the user',
    'use the Agent tool to spawn': 'run the review inline (do not spawn a subagent). Use',
    'Use the Agent tool': 'Run the review inline',
    'use the Skill tool to invoke': 'read the skill file at $FBS_ROOT and follow its instructions for',
    'Invoke `/forbotsake': 'Read and follow the skill file for `/forbotsake',
    'using the Skill tool': 'by reading its SKILL.md and following its instructions',
  },

  suppressedResolvers: [
    'FBS_CHROME_PUBLISH_FLOW',  // No Chrome MCP on Codex
  ],
};

export default codex;
