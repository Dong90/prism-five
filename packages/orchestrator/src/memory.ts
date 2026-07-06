import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { writeActivity } from './logger';

const ProjectMemorySchema = z.object({
  updated: z.string(),
}).passthrough();

type ProjectMemory = z.infer<typeof ProjectMemorySchema> & Record<string, unknown>;

const MEMORY_PATH = '.prism/project-memory.json';
const BACKUP_PATH = '.prism/memory.backup.json';

function memoryFilePath(): string { return path.join(process.cwd(), MEMORY_PATH); }
function backupFilePath(): string { return path.join(process.cwd(), BACKUP_PATH); }

function ensureDir(): void {
  const dir = path.dirname(memoryFilePath());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readAll(): ProjectMemory {
  const fp = memoryFilePath();
  if (!fs.existsSync(fp)) {
    const bp = backupFilePath();
    if (fs.existsSync(bp)) return JSON.parse(fs.readFileSync(bp, 'utf-8'));
    return { updated: new Date().toISOString() };
  }
  try {
    const raw = fs.readFileSync(fp, 'utf-8');
    return ProjectMemorySchema.parse(JSON.parse(raw)) as ProjectMemory;
  } catch {
    const bp = backupFilePath();
    if (fs.existsSync(bp)) return JSON.parse(fs.readFileSync(bp, 'utf-8'));
    return { updated: new Date().toISOString() };
  }
}

function writeAll(memory: ProjectMemory): void {
  ensureDir();
  const data = JSON.stringify(memory, null, 2);
  fs.writeFileSync(backupFilePath(), data, 'utf-8');
  fs.writeFileSync(memoryFilePath(), data, 'utf-8');
  if (fs.existsSync(backupFilePath())) fs.unlinkSync(backupFilePath());
}

export function writeMemory(key: string, value: unknown): void {
  const memory = readAll();
  memory[key] = value;
  memory.updated = new Date().toISOString();
  const validated = ProjectMemorySchema.parse(memory);
  writeAll(validated as ProjectMemory);
  try {
    writeActivity({ event: 'memory_written', slug: `memory:${key}`, timestamp: new Date().toISOString(), result: 'success', metadata: { key } });
  } catch { /* best-effort */ }
}

export function readMemory(key?: string): unknown {
  const memory = readAll();
  return key ? memory[key] : memory;
}

export function deleteMemory(key: string): void {
  const memory = readAll();
  delete memory[key];
  memory.updated = new Date().toISOString();
  const validated = ProjectMemorySchema.parse(memory);
  writeAll(validated as ProjectMemory);
}
