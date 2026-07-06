import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { Pipeline } from './pipeline';
import { TokenBudget } from './token-budget';

function makePipelineJson(dir: string) {
  const d = path.join(dir, '.prism');
  mkdirSync(d, { recursive: true });
  writeFileSync(path.join(d, 'pipeline.json'), JSON.stringify({
    version: '0.2.0', productStage: 'exploring', activeProfile: 'develop', activeFeature: null,
    features: {}, tokenBudget: {
      prototyper: 100, builder: 200, sweeper: 50, grower: 100, maintainer: 50,
      used: {},
    },
    artifactManifest: {}, queue: [], updated: new Date().toISOString(),
  }));
}

describe('TokenBudget', () => {
  const origCwd = process.cwd;
  let tmpDir = '';

  beforeAll(() => { tmpDir = mkdtempSync(path.join(tmpdir(), 'prism-tb-')); process.cwd = () => tmpDir; });
  afterAll(() => { process.cwd = origCwd; });

  function setup() {
    makePipelineJson(tmpDir);
    const p = new Pipeline(path.join(tmpDir, '.prism/pipeline.json'));
    const s = 'test-feat';
    p.createFeature(s, 'develop', 'full');
    return { tb: new TokenBudget(p), slug: s };
  }

  it('track records consumption', () => {
    const { tb, slug: s } = setup();
    tb.track(s, 'builder', 50);
    expect(tb.usage(s).total).toBe(50);
  });

  it('check returns passed when under quota', () => {
    const { tb, slug: s } = setup();
    tb.track(s, 'builder', 50);
    expect(tb.check(s, 'builder').passed).toBe(true);
  });

  it('check returns blocked when over quota', () => {
    const { tb, slug: s } = setup();
    tb.track(s, 'builder', 300);
    const r = tb.check(s, 'builder');
    expect(r.passed).toBe(false);
    expect(r.reason).toContain('token exceeded');
  });

  it('check returns passed when no quota set for role', () => {
    const { tb, slug: s } = setup();
    expect(tb.check(s, 'unknown_role').passed).toBe(true);
  });

  it('usage returns per-role breakdown', () => {
    const { tb, slug: s } = setup();
    tb.track(s, 'prototyper', 10);
    tb.track(s, 'builder', 20);
    const u = tb.usage(s);
    expect(u.total).toBe(30);
    expect(u.byRole.prototyper).toBe(10);
  });

  it('bump reduces used count', () => {
    const { tb, slug: s } = setup();
    tb.track(s, 'builder', 250);
    expect(tb.check(s, 'builder').passed).toBe(false);
    tb.bump(s, 'builder', 200);
    expect(tb.check(s, 'builder').passed).toBe(true);
  });

  it('estimate approximates by char count', () => {
    const { tb } = setup();
    expect(tb.estimate('hello world')).toBe(3);
    expect(tb.estimate('')).toBe(0);
  });
});
