import { describe, it, expect } from 'vitest';
import { Pipeline } from './pipeline';
import { createInitialState } from './state';
import { PipelineStateSchema } from './schema';
import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

function tmpFile(): string {
  return join(mkdtempSync(join(tmpdir(), 'prism-test-')), 'pipeline.json');
}

describe('Pipeline', () => {
  it('creates initial state when no file', () => {
    const p = new Pipeline(tmpFile());
    const state = p.getState();
    expect(state.productStage).toBe('exploring');
    expect(state.features).toEqual({});
  });

  it('creates feature', () => {
    const p = new Pipeline(tmpFile());
    const f = p.createFeature('test-feature');
    expect(f.slug).toBe('test-feature');
    expect(f.currentRole).toBe('prototyper');
    expect(f.status).toBe('draft');
  });

  it('rejects duplicate feature', () => {
    const p = new Pipeline(tmpFile());
    p.createFeature('dup');
    expect(() => p.createFeature('dup')).toThrow('already exists');
  });

  it('getFeature returns undefined for missing', () => {
    const p = new Pipeline(tmpFile());
    expect(p.getFeature('nope')).toBeUndefined();
  });
});

describe('PipelineStateSchema', () => {
  it('validates a valid state', () => {
    const valid = createInitialState();
    const result = PipelineStateSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(valid.version).toBe('0.2.0');
  });

  it('sets activeProfile default', () => {
    const state = createInitialState();
    expect(state.activeProfile).toBe('develop');
  });

  it('includes tokenBudget defaults', () => {
    const state = createInitialState();
    expect(state.tokenBudget.prototyper).toBe(30000);
    expect(state.tokenBudget.builder).toBe(80000);
  });

  it('includes artifactManifest defaults', () => {
    const state = createInitialState();
    expect(state.artifactManifest.prototyper).toContain('raw/PRD.md');
    expect(state.artifactManifest.maintainer).toContain('live/CHANGELOG.md');
  });

  it('rejects invalid state', () => {
    const result = PipelineStateSchema.safeParse({ version: 123 });
    expect(result.success).toBe(false);
  });
});
