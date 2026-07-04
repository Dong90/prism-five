import { describe, it, expect, vi } from 'vitest';
import { incident, PrototyperError } from '@prism-five/incidence';
import { refract, RefractError } from '@prism-five/refraction';
import { disperse } from '@prism-five/dispersion';
import { absorb } from '@prism-five/absorption';
import { emit, EmitError } from '@prism-five/emission';

describe('pentad e2e: incident → refract → disperse → absorb → emit', () => {
  it('flows a simple event through the full pipeline', async () => {
    const evt = incident({ type: 'user.login', payload: { id: 1, name: 'Alice' } });

    const transformed = refract(evt.payload!, p => ({ ...p, role: 'admin' }));

    const targets: Array<(d: typeof transformed) => void> = [
      d => {
        expect(d.role).toBe('admin');
      },
    ];
    const dispResult = await disperse(transformed, targets);
    expect(dispResult).toHaveLength(1);

    const abResult = absorb(dispResult);
    expect(abResult.sources).toHaveLength(1);
    expect(abResult.data).toHaveLength(1);
    expect(abResult.data[0]).toEqual({ id: 1, name: 'Alice', role: 'admin' });

    const sink = vi.fn();
    await emit(abResult.data[0], sink);
    expect(sink).toHaveBeenCalledWith({ id: 1, name: 'Alice', role: 'admin' });
  });

  it('handles validation errors from prototyper', () => {
    expect(() => incident({ type: '', payload: {} })).toThrow(PrototyperError);
  });

  it('handles transformation errors from builder', () => {
    expect(() =>
      refract({ x: 1 }, () => {
        throw new Error('boom');
      }),
    ).toThrow(RefractError);
  });

  it('handles emit errors from maintainer', async () => {
    const sink = () => {
      throw new Error('sink error');
    };
    await expect(emit({}, sink)).rejects.toThrow(EmitError);
  });

  it('handles disperse with no targets', async () => {
    const result = await disperse({}, []);
    expect(result).toEqual([]);
  });

  it('handles disperse with failing targets', async () => {
    const failing = () => {
      throw new Error('fail');
    };
    const result = await disperse({ x: 1 }, [failing]);
    expect(result).toEqual([]);
  });

  it('supports refract.map in pipeline context', () => {
    const items = [{ n: 1 }, { n: 2 }];
    const mapped = refract.map(items, item => ({ ...item, doubled: item.n * 2 }));
    expect(mapped).toEqual([
      { n: 1, doubled: 2 },
      { n: 2, doubled: 4 },
    ]);
  });

  it('supports absorb.unique', () => {
    const result: Array<[string, number]> = [
      ['a', 1],
      ['b', 2],
      ['a', 1],
      ['c', 3],
    ];
    const uniq = absorb.unique(result);
    expect(uniq.data).toEqual([1, 2, 3]);
  });

  it('supports absorb.reduce', () => {
    const items: Array<[string, number]> = [
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ];
    const sum = absorb.reduce(items, (acc, n) => acc + n, 0);
    expect(sum).toBe(6);
  });
});
