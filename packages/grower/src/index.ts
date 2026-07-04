/**
 * @pentad/grower — 金
 * 收集与聚合：Fan-in — 多个数据源 → 统一收集。
 */

import type { DispersionResult } from '@pentad/sweeper';

/** 聚合后的结果 */
export interface AbsorptionResult<T> {
  sources: string[];
  data: T[];
}

/**
 * 从多个上游汇聚数据，合并去重。
 */
export function absorb<T>(
  results: DispersionResult<T>,
): AbsorptionResult<T> {
  return {
    sources: results.map(([target]) => target),
    data: results.map(([, data]) => data),
  };
}
