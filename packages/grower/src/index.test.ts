import { describe, it, expect } from 'vitest';
import { absorb } from './index';

describe('absorb', () => {
  it('concats dispersion results', () => {
    const r = absorb([['a', 1], ['b', 2]]);
    expect(r.sources).toEqual(['a', 'b']);
    expect(r.data).toEqual([1, 2]);
  });

  it('handles empty input', () => {
    const r = absorb([]);
    expect(r.sources).toEqual([]);
    expect(r.data).toEqual([]);
  });
});

describe('absorb.unique', () => {
  it('deduplicates by reference', () => {
    const r = absorb.unique([['a', 1], ['b', 1], ['c', 2]]);
    expect(r.data).toEqual([1, 2]);
  });

  it('deduplicates by key function', () => {
    const items = [{ id: 1 }, { id: 1 }, { id: 2 }];
    const r = absorb.unique([['a', items[0]!], ['b', items[1]!], ['c', items[2]!]], x => x.id);
    expect(r.data).toHaveLength(2);
  });
});

describe('absorb.reduce', () => {
  it('reduces data', () => {
    const sum = absorb.reduce([['a', 1], ['b', 2], ['c', 3]], (acc, x) => acc + x, 0);
    expect(sum).toBe(6);
  });
});
