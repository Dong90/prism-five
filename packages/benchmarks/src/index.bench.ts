import { bench, describe } from 'vitest';
import { incident } from '@pentad/prototyper';
import { refract } from '@pentad/builder';
import { disperse } from '@pentad/sweeper';
import { absorb } from '@pentad/grower';
import { emit } from '@pentad/maintainer';

describe('prototyper', () => {
  bench('incident basic', () => {
    incident({ type: 'test', payload: { x: 1 } });
  });
});

describe('builder', () => {
  const data = { a: 1, b: 2, c: 3 };
  bench('refract identity', () => {
    refract(data, d => ({ ...d }));
  });

  bench('refract.map small array', () => {
    refract.map([1, 2, 3, 4, 5], n => n * 2);
  });
});

describe('sweeper', () => {
  const data = { id: 1 };
  bench('disperse 10 targets', async () => {
    const targets: Array<() => void> = Array.from({ length: 10 }, () => () => {});
    await disperse(data, targets);
  });
});

describe('grower', () => {
  bench('absorb 100 items', () => {
    const items: Array<[string, number]> = Array.from({ length: 100 }, (_, i) => [`s${i}`, i]);
    absorb(items);
  });

  bench('absorb.unique 100 items with dupes', () => {
    const items: Array<[string, number]> = Array.from({ length: 100 }, (_, i) => [
      `s${i % 10}`,
      i % 10,
    ]);
    absorb.unique(items);
  });

  bench('absorb.reduce 100 items', () => {
    const items: Array<[string, number]> = Array.from({ length: 100 }, (_, i) => [`s${i}`, i]);
    absorb.reduce(items, (acc, n) => acc + n, 0);
  });
});

describe('maintainer', () => {
  bench('emit sync sink', async () => {
    const sink = (_: unknown) => {};
    await emit({}, sink);
  });
});
