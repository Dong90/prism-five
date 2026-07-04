/** Error thrown when emitting to a sink fails. */
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

/** A sink is a function that consumes data, either synchronously or asynchronously. */
export type Sink<T> = (data: T) => void | Promise<void>;

/**
 * Send data to a sink. Supports both sync and async sinks.
 * Wraps errors in {@link EmitError} with the original error as the cause.
 */
export async function emit<T>(data: T, sink: Sink<T>): Promise<void> {
  try {
    const result = sink(data);
    if (result instanceof Promise) {
      await result;
    }
  } catch (err) {
    throw new EmitError(`emit failed: ${(err as Error).message}`, err, data);
  }
}
