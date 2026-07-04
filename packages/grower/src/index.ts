import type { DispersionResult } from '@pentad/sweeper';

/** Result of an absorb operation: aggregated sources and their data. */
export interface AbsorptionResult<T> {
  sources: string[];
  data: T[];
}

/** Concatenate a dispersion result into sources and data arrays. */
export function absorb<T>(results: DispersionResult<T>): AbsorptionResult<T> {
  return {
    sources: results.map(([target]) => target),
    data: results.map(([, data]) => data),
  };
}

/** Merge with deduplication. Optionally provide a key function. */
absorb.unique = function unique<T>(
  results: DispersionResult<T>,
  key?: (item: T) => unknown,
): AbsorptionResult<T> {
  const seen = new Set<unknown>();
  const sources: string[] = [];
  const data: T[] = [];

  for (const [target, item] of results) {
    const k = key ? key(item) : item;
    if (!seen.has(k)) {
      seen.add(k);
      sources.push(target);
      data.push(item);
    }
  }

  return { sources, data };
};

/** Reduce dispersion data to a single value. */
absorb.reduce = function reduce<T, R>(
  results: DispersionResult<T>,
  fn: (acc: R, item: T) => R,
  initial: R,
): R {
  return results.reduce((acc, [, item]) => fn(acc, item), initial);
};
