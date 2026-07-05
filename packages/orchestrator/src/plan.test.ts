import { describe, it, expect } from 'vitest';
import { planFromDoc } from './plan';

describe('plan', () => {
  it('parses features from markdown', () => {
    const r = planFromDoc('### [ ] Add login page\n### [ ] Add dashboard (depends on: add-login-page)');
    expect(r.features).toHaveLength(2);
  });

  it('detects dependencies', () => {
    const r = planFromDoc('### [ ] Login (depends on: auth-module, db-schema)');
    expect(r.features[0]?.dependencies).toEqual(['auth-module', 'db-schema']);
  });

  it('produces topological sort', () => {
    const r = planFromDoc('### [ ] A\n### [ ] B (depends on: A)\n### [ ] C (depends on: A, B)');
    expect(r.order[0]).toContain('a');
  });

  it('handles empty doc', () => {
    expect(planFromDoc('').features).toEqual([]);
  });
});
