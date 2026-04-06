import type { HostConfig } from '../host-config';

export interface TemplateContext {
  skillName: string;
  tmplPath: string;
  host: string;
  hostConfig: HostConfig;
}

export type ResolverFn = (ctx: TemplateContext, args?: string[]) => string;
