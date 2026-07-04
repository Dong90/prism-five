/** Error thrown when a refract transformation fails. */
export class RefractError extends Error {
  constructor(
    message: string,
    public readonly cause: unknown,
    public readonly input?: unknown,
  ) {
    super(message);
    this.name = 'RefractError';
  }
}

/**
 * Transform data using a pure function.
 * Wraps errors in {@link RefractError} so the pipeline can handle failures gracefully.
 */
export function refract<T, U>(data: T, fn: (input: T) => U): U {
  try {
    return fn(data);
  } catch (err) {
    throw new RefractError(`refract transformation failed: ${(err as Error).message}`, err, data);
  }
}

/** Map a function over an array, wrapping errors with index context. */
refract.map = function map<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  return arr.map((item, index) => {
    try {
      return fn(item, index);
    } catch (err) {
      throw new RefractError(
        `refract.map failed at index ${index}: ${(err as Error).message}`,
        err,
        item,
      );
    }
  });
};
