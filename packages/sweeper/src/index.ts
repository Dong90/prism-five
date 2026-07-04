export type DispersionResult<T> = Array<[target: string, data: T]>;

type Target<T> = string | ((data: T) => void | Promise<void>);

function isFunctionTarget<T>(t: Target<T>): t is (data: T) => void | Promise<void> {
  return typeof t === 'function';
}

function clone<T>(data: T): T {
  return structuredClone(data);
}

async function executeTarget<T>(target: Target<T>, data: T): Promise<[string, T] | null> {
  if (isFunctionTarget(target)) {
    try {
      await target(clone(data));
    } catch {
      return null;
    }
    return [target.name || '<anonymous>', clone(data)];
  }
  return [target, clone(data)];
}

export async function disperse<T>(data: T, targets: Target<T>[]): Promise<DispersionResult<T>> {
  if (targets.length === 0) return [];

  const results = await Promise.allSettled(targets.map(t => executeTarget(t, data)));

  const out: DispersionResult<T> = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value !== null) {
      out.push(r.value);
    }
  }
  return out;
}
