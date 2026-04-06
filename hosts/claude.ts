import type { HostConfig } from '../scripts/host-config';

const claude: HostConfig = {
  name: 'claude',
  displayName: 'Claude Code',
  cliCommand: 'claude',

  globalRoot: '.claude/skills/forbotsake',
  localSkillRoot: '.claude/skills/forbotsake',
  hostSubdir: '.claude',
  usesEnvVars: false,

  frontmatter: {
    mode: 'denylist',
    stripFields: [],
    descriptionLimit: null,
  },

  generation: {
    generateMetadata: false,
    skipSkills: [],
  },

  pathRewrites: [],
  toolRewrites: {},
  suppressedResolvers: [],
};

export default claude;
