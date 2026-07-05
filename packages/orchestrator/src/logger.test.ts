import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { mkdtempSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { logger, setLogLevel, writeActivity, readActivity } from './logger';

const origCwd = process.cwd;
const tmpDir = mkdtempSync(path.join(tmpdir(), 'prism-activity-'));
beforeAll(() => { process.cwd = () => tmpDir; });
afterAll(() => { process.cwd = origCwd; });

describe('logger', () => {
  it('logs info messages', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('test message');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('respects log level', () => {
    setLogLevel('error');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.debug('should not appear');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    setLogLevel('info');
  });
});

describe('activity log', () => {
  it('writes and reads activity entries', () => {
    writeActivity({ event: 'feature_created', slug: 'test', role: 'prototyper', timestamp: new Date().toISOString(), result: 'success' });
    const entries = readActivity();
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[entries.length - 1]!.event).toBe('feature_created');
  });

  it('filters by slug', () => {
    writeActivity({ event: 'gate_blocked', slug: 'foo', timestamp: new Date().toISOString(), result: 'blocked' });
    writeActivity({ event: 'gate_blocked', slug: 'bar', timestamp: new Date().toISOString(), result: 'success' });
    expect(readActivity('foo').length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty log gracefully', () => {
    expect(readActivity('nope')).toEqual([]);
  });
});
