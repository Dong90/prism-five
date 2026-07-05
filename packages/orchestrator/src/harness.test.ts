import { describe, it, expect } from 'vitest';
import { checkHarness } from './harness';

describe('harness', () => {
  it('passes when all checks done', () => {
    expect(checkHarness('prototyper', new Set(['brainstorming'])).passed).toBe(true);
  });

  it('fails when checks missing', () => {
    expect(checkHarness('prototyper', new Set()).passed).toBe(false);
  });

  it('returns missing check names', () => {
    expect(checkHarness('builder', new Set()).missing).toContain('plan_review');
  });

  it('different roles require different checks', () => {
    expect(checkHarness('prototyper', new Set()).missing).toContain('brainstorming');
    expect(checkHarness('sweeper', new Set()).missing).toEqual(['verification']);
  });
});
