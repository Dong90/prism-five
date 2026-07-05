import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import type { Feature } from './schema';
import { saveCheckpoint, loadCheckpoint, deleteCheckpoint } from './checkpoint';

function makeFeature(overrides?: Partial<Feature>): Feature {
  return {
    slug: 'test-cp',
    status: 'draft',
    currentRole: 'prototyper',
    profile: 'develop',
    variant: 'full',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stageHistory: [{ role: 'prototyper', enteredAt: new Date().toISOString() }],
    gates: { prototype_approved: false, design_reviewed: false, sweep_passed: false, review_approved: false, release_approved: false },
    artifacts: { 'raw/PRD.md': ['done'] },
    ...overrides,
  };
}

describe('checkpoint', () => {
  const origCwd = process.cwd;
  const tmpDir = mkdtempSync(path.join(tmpdir(), 'prism-checkpoint-'));

  beforeAll(() => { process.cwd = () => tmpDir; });
  afterAll(() => { process.cwd = origCwd; });

  it('saves and loads checkpoint', () => {
    const f = makeFeature();
    const cp = saveCheckpoint(f, 'pause before review');
    expect(cp.slug).toBe('test-cp');
    expect(cp.context).toBe('pause before review');

    const loaded = loadCheckpoint('test-cp');
    expect(loaded).not.toBeNull();
    expect(loaded!.artifacts['raw/PRD.md']).toEqual(['done']);
  });

  it('returns null for missing checkpoint', () => {
    expect(loadCheckpoint('nonexistent')).toBeNull();
  });

  it('deletes checkpoint', () => {
    saveCheckpoint(makeFeature({ slug: 'test-del' }));
    deleteCheckpoint('test-del');
    expect(loadCheckpoint('test-del')).toBeNull();
  });

  it('preserves stage history', () => {
    const f = makeFeature({
      stageHistory: [
        { role: 'prototyper', enteredAt: '2026-01-01' },
        { role: 'builder', enteredAt: '2026-01-02' },
      ],
    });
    expect(saveCheckpoint(f).stageHistory).toHaveLength(2);
  });
});
