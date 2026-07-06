import fs from 'fs';
import path from 'path';

/** Supported log severity levels. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

/** Structured activity audit log entry for .prism/activity.jsonl. */
export interface ActivityEntry {
  event: string;
  slug: string;
  role?: string;
  phase?: string;
  timestamp: string;
  result: 'success' | 'failure' | 'blocked';
  reason?: string;
  metadata?: Record<string, unknown>;
}

const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLevel: LogLevel = 'info';
const ACTIVITY_PATH = path.join(process.cwd(), '.prism/activity.jsonl');

function ensureActivityDir(): void {
  const dir = path.dirname(ACTIVITY_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function writeActivity(entry: ActivityEntry): void {
  ensureActivityDir();
  fs.appendFileSync(ACTIVITY_PATH, JSON.stringify(entry) + '\n', 'utf-8');
}

export function readActivity(slug?: string): ActivityEntry[] {
  if (!fs.existsSync(ACTIVITY_PATH)) return [];
  const lines = fs.readFileSync(ACTIVITY_PATH, 'utf-8').split('\n').filter(Boolean);
  const entries = lines.map(l => JSON.parse(l) as ActivityEntry);
  return slug ? entries.filter(e => e.slug === slug) : entries;
}

export function setLogLevel(level: LogLevel): void { currentLevel = level; }

function createEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  return { level, message, timestamp: new Date().toISOString(), data };
}

function shouldLog(level: LogLevel): boolean { return levels[level] >= levels[currentLevel]; }

function write(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const payload = entry.data && Object.keys(entry.data).length > 0 ? [entry.message, entry.data] : [entry.message];
  console[entry.level === 'error' ? 'error' : 'log'](prefix, ...payload);
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => write(createEntry('debug', message, data)),
  info: (message: string, data?: Record<string, unknown>) => write(createEntry('info', message, data)),
  warn: (message: string, data?: Record<string, unknown>) => write(createEntry('warn', message, data)),
  error: (message: string, data?: Record<string, unknown>) => write(createEntry('error', message, data)),
};
