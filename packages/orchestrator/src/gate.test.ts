import { describe, it, expect } from 'vitest';
import { checkHumanGate, checkAutoGate } from './gate';
import type { Feature } from './schema';

function makeFeature(overrides?: Partial<Feature>): Feature {
  return {
    slug: 'test',
    status: 'draft',
    currentRole: 'prototyper',
    profile: 'develop',
    variant: 'full',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stageHistory: [{ role: 'prototyper', enteredAt: new Date().toISOString() }],
    gates: { prototype_approved: false, design_reviewed: false, sweep_passed: false, review_approved: false, release_approved: false },
    artifacts: {
      'raw/RESEARCH.md': ['done'],
      'raw/PRD.md': ['done'],
      'raw/INITIATE.md': ['done'],
    },
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

describe('checkAutoGate', () => {
  it('passes valid feature with artifacts', () => {
    const f = makeFeature();
    expect(checkAutoGate(f).passed).toBe(true);
  });

  it('fails when artifacts missing', () => {
    const f = makeFeature({ artifacts: {} });
    expect(checkAutoGate(f).passed).toBe(false);
  });

  it('names missing artifact in reason', () => {
    const f = makeFeature({ artifacts: {} });
    expect(checkAutoGate(f).reason).toContain('artifact');
  });

  it('checks role-specific artifacts for builder', () => {
    const f = makeFeature({ currentRole: 'builder', artifacts: {} });
    const r = checkAutoGate(f);
    expect(r.passed).toBe(false);
    expect(r.reason).toContain('built/DESIGN.md');
  });

  it('blocks on token budget exceeded', () => {
    const f = makeFeature();
    expect(checkAutoGate(f, { used: 50000, limit: 30000 }).passed).toBe(false);
  });
});
