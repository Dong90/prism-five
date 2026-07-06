import type { AgentRole } from './schema';

export type HarnessCheck = 'brainstorming' | 'plan_review' | 'verification';

export interface HarnessResult {
  passed: boolean;
  missing: HarnessCheck[];
}

const ROLE_HARNESS_MAP: Record<AgentRole, HarnessCheck[]> = {
  prototyper: ['brainstorming'],
  builder: ['plan_review'],
  sweeper: ['verification'],
  grower: ['verification'],
  maintainer: ['verification'],
};

export function checkHarness(
  role: AgentRole,
  completedChecks: Set<HarnessCheck>,
): HarnessResult {
  const required = ROLE_HARNESS_MAP[role] ?? [];
  const missing = required.filter(c => !completedChecks.has(c));
  return { passed: missing.length === 0, missing };
}
