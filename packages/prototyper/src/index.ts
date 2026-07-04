export class PrototyperError extends TypeError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PrototyperError';
  }
}

export interface IncidentEvent<T extends string = string, P = unknown> {
  type: T;
  payload?: P;
  metadata?: Record<string, unknown>;
}

function isValidString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function incident<T extends string, P>(
  event: IncidentEvent<T, P>,
): IncidentEvent<T, P> {
  if (!isValidString(event.type)) {
    throw new PrototyperError(
      `event.type must be a non-empty string, got ${typeof event.type}`,
    );
  }
  if (event.payload !== undefined && !isPlainObject(event.payload)) {
    throw new PrototyperError(
      `event.payload must be a plain object when present, got ${typeof event.payload}`,
    );
  }
  if (event.metadata !== undefined && !isPlainObject(event.metadata)) {
    throw new PrototyperError(
      `event.metadata must be a plain object when present, got ${typeof event.metadata}`,
    );
  }
  return event;
}
