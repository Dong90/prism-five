import { describe, expect, it } from 'vitest';
import { checkUpstreamForRole, getRoleIndex } from './upstream.js';
import type { Feature, AgentRole } from './schema.js';

function makeFeature(overrides: Partial<Feature> = {}): Feature {
  return {
    slug: 'test',
    status: 'draft',
    currentRole: 'builder',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    stageHistory: [{ role: 'prototyper', enteredAt: '2026-01-01' }],
    gates: { prototype_approved: false, build_reviewed: false, sweep_passed: false, release_approved: false },
    ...overrides,
  };
}

describe('checkUpstreamForRole', () => {
  it('rejects builder when prototyper not completed', () => {
    const f = makeFeature();
    const r = checkUpstreamForRole(f, 'builder');
    expect(r.ok).toBe(false);
    expect(r.missing).toContain('prototyper');
  });

  it('accepts builder when prototyper completed', () => {
    const f = makeFeature({
      stageHistory: [{ role: 'prototyper', enteredAt: '2026-01-01', completedAt: '2026-01-02' }],
    });
    const r = checkUpstreamForRole(f, 'builder');
    expect(r.ok).toBe(true);
  });

  it('accepts builder when prototyper is exempted (non-expired)', () => {
    const f = makeFeature({
      exemptions: [{ stage: 'prototyper', reason: 'migrated', createdAt: '2026-01-01', expiresAt: '2027-01-01' }],
    });
    const r = checkUpstreamForRole(f, 'builder');
    expect(r.ok).toBe(true);
    expect(r.exempted).toContain('prototyper');
  });

  it('rejects builder when exemption is expired', () => {
    const f = makeFeature({
      exemptions: [{ stage: 'prototyper', reason: 'old', createdAt: '2024-01-01', expiresAt: '2024-06-01' }],
    });
    const r = checkUpstreamForRole(f, 'builder');
    expect(r.ok).toBe(false);
    expect(r.exempted).not.toContain('prototyper');
  });

  it('prototyper has no upstream requirements', () => {
    const r = checkUpstreamForRole(makeFeature(), 'prototyper');
    expect(r.ok).toBe(true);
    expect(r.missing).toEqual([]);
  });

  it('maintainer requires builder,sweeper,grower', () => {
    const f = makeFeature({
      currentRole: 'maintainer',
      stageHistory: [
        { role: 'prototyper', enteredAt: '2026-01-01', completedAt: '2026-01-02' },
        { role: 'builder', enteredAt: '2026-01-02', completedAt: '2026-01-03' },
        { role: 'sweeper', enteredAt: '2026-01-03', completedAt: '2026-01-04' },
        { role: 'grower', enteredAt: '2026-01-04', completedAt: '2026-01-05' },
      ],
    });
    const r = checkUpstreamForRole(f, 'maintainer');
    expect(r.ok).toBe(true);
  });
});

describe('getRoleIndex', () => {
  it('prototyper = 0, maintainer = 4', () => {
    expect(getRoleIndex('prototyper')).toBe(0);
    expect(getRoleIndex('maintainer')).toBe(4);
  });
});
