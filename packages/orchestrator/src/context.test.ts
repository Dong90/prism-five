import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import type { Feature } from './schema';
import { saveContext, loadContext } from './context';

function makeFeature(overrides?: Partial<Feature>): Feature {
  return {
    slug: 'test-ctx', status: 'building', currentRole: 'builder',
    profile: 'develop', variant: 'full',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    stageHistory: [{ role: 'prototyper', enteredAt: new Date().toISOString() }],
    gates: { prototype_approved: true, design_reviewed: false, sweep_passed: false, review_approved: false, release_approved: false },
    artifacts: {}, ...overrides,
  };
}

describe('context', () => {
  const origCwd = process.cwd;
  let tmpDir = '';

  beforeAll(() => { tmpDir = mkdtempSync(path.join(tmpdir(), 'prism-ctx-')); process.cwd = () => tmpDir; });
  afterAll(() => { process.cwd = origCwd; });

  it('saveContext creates CONTEXT.md with all four sections', () => {
    const f = makeFeature({ artifacts: { 'raw/PRD.md': ['done'] } });
    const ctx = saveContext(f);
    expect(ctx.slug).toBe('test-ctx');
    const fp = path.join(tmpDir, '.prism/features/test-ctx/CONTEXT.md');
    expect(existsSync(fp)).toBe(true);
    const c = readFileSync(fp, 'utf-8');
    expect(c).toContain('## Current Role');
    expect(c).toContain('## Artifacts');
    expect(c).toContain('## Blockers');
    expect(c).toContain('## Next Action');
  });

  it('saveContext outputs (none) for empty artifacts', () => {
    saveContext(makeFeature({ artifacts: {} }));
    const fp = path.join(tmpDir, '.prism/features/test-ctx/CONTEXT.md');
    const c = readFileSync(fp, 'utf-8');
    expect((c.match(/\(none\)/g) || []).length).toBeGreaterThanOrEqual(2);
  });

  it('loadContext returns null for non-existent', () => {
    expect(loadContext('nonexistent')).toBeNull();
  });

  it('saveContext → loadContext roundtrip', () => {
    const f = makeFeature({ slug: 'test-rt', artifacts: { 'DESIGN.md': ['active'] } });
    saveContext(f);
    const ctx = loadContext('test-rt');
    expect(ctx).not.toBeNull();
    expect(ctx!.slug).toBe('test-rt');
    expect(ctx!.currentRole).toBe('builder (building)');
  });

  it('loadContext handles corrupted file gracefully', () => {
    const dir = path.join(tmpDir, '.prism/features/bad');
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'CONTEXT.md'), 'totally broken garbage %%%', 'utf-8');
    const ctx = loadContext('bad');
    expect(ctx).not.toBeNull();
    // no ## sections found, defaults to 'unknown'
    expect(ctx!.currentRole).toBe('unknown');
  });
});
