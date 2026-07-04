/**
 * @prism-five/emission — 水
 * 最终输出：将数据发送到外部系统。
 */

/** Sink 可以是同步或异步输出函数 */
export type Sink<T> = (data: T) => void | Promise<void>;

/**
 * 将数据发送到指定 sink。
 */
export function emit<T>(data: T, sink: Sink<T>): void | Promise<void> {
  return sink(data);
}
