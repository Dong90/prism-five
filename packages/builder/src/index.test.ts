import { describe, it, expect } from 'vitest';
import { refract, RefractError } from './index';

describe('refract', () => {
  it('transforms data correctly', () => {
    expect(refract(2, x => x * 3)).toBe(6);
  });

  it('wraps transform error', () => {
    expect(() => refract(null as unknown as Record<string, unknown>, x => x.foo)).toThrow(RefractError);
  });
});

describe('refract.map', () => {
  it('maps array elements', () => {
    expect(refract.map([1, 2, 3], x => x * 2)).toEqual([2, 4, 6]);
  });

  it('wraps map error with index', () => {
    expect(() => refract.map([1, null as unknown as number], x => x.toFixed())).toThrow(RefractError);
  });
});
