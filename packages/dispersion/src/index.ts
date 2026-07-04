/**
 * @prism-five/dispersion — 土
 * 分发：Fan-out — 一份数据 → 多个目标。
 */

/** 分发结果：每组 [目标, 数据] */
export type DispersionResult<T> = Array<[target: string, data: T]>;

/**
 * 将数据副本分发到指定目标列表。
 */
export function disperse<T>(
  data: T,
  targets: string[],
): DispersionResult<T> {
  return targets.map((target): [string, T] => [target, structuredClone(data)]);
}
