import { describe, it, expect, vi } from 'vitest';
import { emit, EmitError } from './index';

describe('emit', () => {
  it('calls sync sink', async () => {
    const sink = vi.fn();
    await emit('hello', sink);
    expect(sink).toHaveBeenCalledWith('hello');
  });

  it('awaits async sink', async () => {
    const sink = vi.fn().mockResolvedValue(undefined);
    await emit('hello', sink);
    expect(sink).toHaveBeenCalledWith('hello');
  });

  it('wraps sync sink error', async () => {
    const sink = () => { throw new Error('boom'); };
    await expect(emit('x', sink)).rejects.toThrow(EmitError);
  });

  it('wraps async sink error', async () => {
    const sink = async () => { throw new Error('async boom'); };
    await expect(emit('x', sink)).rejects.toThrow(EmitError);
  });
});
