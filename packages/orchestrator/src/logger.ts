/** Supported log severity levels. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

let currentLevel: LogLevel = 'info';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function createEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  return { level, message, timestamp: new Date().toISOString(), data };
}

function shouldLog(level: LogLevel): boolean {
  return levels[level] >= levels[currentLevel];
}

function write(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  if (entry.data && Object.keys(entry.data).length > 0) {
    console[entry.level === 'error' ? 'error' : 'log'](prefix, entry.message, entry.data);
  } else {
    console[entry.level === 'error' ? 'error' : 'log'](prefix, entry.message);
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => write(createEntry('debug', message, data)),
  info: (message: string, data?: Record<string, unknown>) => write(createEntry('info', message, data)),
  warn: (message: string, data?: Record<string, unknown>) => write(createEntry('warn', message, data)),
  error: (message: string, data?: Record<string, unknown>) => write(createEntry('error', message, data)),
};
