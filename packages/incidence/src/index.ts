/**
 * @prism-five/incidence — 木
 * 数据入口：事件的初始接收与类型化。
 */

export interface IncidentEvent<T extends string = string, P = unknown> {
  type: T;
  payload: P;
  metadata?: Record<string, unknown>;
}

/**
 * 接收一个原始事件并返回类型化的事件对象。
 * 在 v0.2 中将加入 schema 校验。
 */
export function incident<T extends string, P>(
  event: IncidentEvent<T, P>,
): IncidentEvent<T, P> {
  return event;
}
