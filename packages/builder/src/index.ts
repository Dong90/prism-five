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

export function refract<T, U>(data: T, fn: (input: T) => U): U {
  try {
    return fn(data);
  } catch (err) {
    throw new RefractError(`refract transformation failed: ${(err as Error).message}`, err, data);
  }
}

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
