import { describe, it, expect, vi } from 'vitest';
import { logger, setLogLevel } from './logger';

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
