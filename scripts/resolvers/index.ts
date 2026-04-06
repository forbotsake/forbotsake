import type { ResolverFn } from './types';
import { FBS_PREAMBLE } from './preamble';
import { FBS_BROWSER_DETECT } from './browser';
import { FBS_CHROME_PUBLISH_FLOW } from './chrome-publish';
import { FBS_ADVERSARIAL_REVIEW } from './adversarial-review';

export const RESOLVERS: Record<string, ResolverFn> = {
  FBS_PREAMBLE,
  FBS_BROWSER_DETECT,
  FBS_CHROME_PUBLISH_FLOW,
  FBS_ADVERSARIAL_REVIEW,
};
