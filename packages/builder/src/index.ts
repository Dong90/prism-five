/**
 * @pentad/builder — 火
 * 数据变换：纯函数映射，Fire-and-transform。
 */

/**
 * 对输入数据应用变换函数，返回新形状。
 */
export function refract<T, U>(data: T, fn: (input: T) => U): U {
  return fn(data);
}
