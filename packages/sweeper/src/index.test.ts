import { describe, it, expect } from 'vitest';
import { disperse } from './index';

describe('disperse', () => {
  it('distributes to multiple string targets', async () => {
    const result = await disperse({ msg: 'hi' }, ['a', 'b']);
    expect(result).toHaveLength(2);
    expect(result[0]?.[0]).toBe('a');
    expect(result[1]?.[0]).toBe('b');
  });

  it('returns empty for no targets', async () => {
    const result = await disperse('x', []);
    expect(result).toEqual([]);
  });

  it('handles function targets', async () => {
    const collected: string[] = [];
    const result = await disperse('data', [
      v => {
        collected.push(v);
      },
    ]);
    expect(collected).toEqual(['data']);
    expect(result).toHaveLength(1);
  });

  it('isolates failing targets', async () => {
    const result = await disperse('x', [
      'good',
      () => {
        throw new Error('fail');
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.[0]).toBe('good');
  });
});
