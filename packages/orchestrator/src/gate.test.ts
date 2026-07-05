import { describe, it, expect } from 'vitest';
import { checkHumanGate, checkAutoGate } from './gate';
import type { Feature } from './schema';

function makeFeature(overrides?: Partial<Feature>): Feature {
  return {
    slug: 'test',
    status: 'draft',
    currentRole: 'prototyper',
    profile: 'develop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stageHistory: [{ role: 'prototyper', enteredAt: new Date().toISOString() }],
    gates: { prototype_approved: false, build_reviewed: false, sweep_passed: false, release_approved: false },
    artifacts: {},
    ...overrides,
  };
}

describe('checkHumanGate', () => {
  it('blocks unapproved gate', () => {
    const f = makeFeature();
    const r = checkHumanGate(f, 'prototype_approved');
    expect(r.passed).toBe(false);
    expect(r.requiresHuman).toBe(true);
  });

  it('passes approved gate', () => {
    const f = makeFeature({ gates: { ...makeFeature().gates, prototype_approved: true } });
    const r = checkHumanGate(f, 'prototype_approved');
    expect(r.passed).toBe(true);
  });
});
