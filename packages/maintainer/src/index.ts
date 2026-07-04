export class EmitError extends Error {
  constructor(
    message: string,
    public readonly cause: unknown,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'EmitError';
  }
}

export type Sink<T> = (data: T) => void | Promise<void>;

export async function emit<T>(
  data: T,
  sink: Sink<T>,
): Promise<void> {
  try {
    const result = sink(data);
    if (result instanceof Promise) {
      await result;
    }
  } catch (err) {
    throw new EmitError(
      `emit failed: ${(err as Error).message}`,
      err,
      data,
    );
  }
}
