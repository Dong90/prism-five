import { describe, it, expect } from 'vitest';
import { Pipeline } from './pipeline';
import { createInitialState } from './state';
import { PipelineStateSchema } from './schema';

describe('Pipeline', () => {
  it('creates initial state when no file', () => {
    const p = new Pipeline('/tmp/test-pipeline.json');
    const state = p.getState();
    expect(state.productStage).toBe('exploring');
    expect(state.features).toEqual({});
  });

  it('creates feature', () => {
    const p = new Pipeline('/tmp/test-pipeline.json');
    const f = p.createFeature('test-feature');
    expect(f.slug).toBe('test-feature');
    expect(f.currentRole).toBe('prototyper');
    expect(f.status).toBe('draft');
  });

  it('rejects duplicate feature', () => {
    const p = new Pipeline('/tmp/test-pipeline.json');
    p.createFeature('dup');
    expect(() => p.createFeature('dup')).toThrow('already exists');
  });

  it('getFeature returns undefined for missing', () => {
    const p = new Pipeline('/tmp/test-pipeline.json');
    expect(p.getFeature('nope')).toBeUndefined();
  });
});

describe('PipelineStateSchema', () => {
  it('validates a valid state', () => {
    const valid = createInitialState();
    const result = PipelineStateSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid state', () => {
    const result = PipelineStateSchema.safeParse({ version: 123 });
    expect(result.success).toBe(false);
  });
});
