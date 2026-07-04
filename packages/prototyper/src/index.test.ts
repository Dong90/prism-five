import { describe, it, expect } from 'vitest';
import { incident, PrototyperError } from './index';

describe('incident', () => {
  it('accepts valid event', () => {
    const ev = incident({ type: 'user_signup', payload: { email: 'a@b.com' } });
    expect(ev.type).toBe('user_signup');
  });

  it('accepts event without payload', () => {
    const ev = incident({ type: 'ping' });
    expect(ev.payload).toBeUndefined();
  });

  it('rejects numeric type', () => {
    expect(() => incident({ type: 123 as unknown as string })).toThrow(PrototyperError);
  });

  it('rejects empty string type', () => {
    expect(() => incident({ type: '' })).toThrow(PrototyperError);
  });

  it('rejects array payload', () => {
    expect(() =>
      incident({ type: 'x', payload: [] as unknown as Record<string, unknown> }),
    ).toThrow(PrototyperError);
  });
});
