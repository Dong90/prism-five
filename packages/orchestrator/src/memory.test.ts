import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, existsSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { writeMemory, readMemory, deleteMemory } from './memory';

describe('memory', () => {
  const origCwd = process.cwd;
  let tmpDir = '';

  beforeAll(() => { tmpDir = mkdtempSync(path.join(tmpdir(), 'prism-mem-')); process.cwd = () => tmpDir; });
  afterAll(() => { process.cwd = origCwd; });

  it('writeMemory / readMemory roundtrip', () => {
    writeMemory('techStack', { language: 'TypeScript', runtime: 'Node.js' });
    expect(readMemory('techStack')).toEqual({ language: 'TypeScript', runtime: 'Node.js' });
  });

  it('readMemory without key returns full object', () => {
    writeMemory('convention', { naming: 'camelCase' });
    const all = readMemory() as Record<string, unknown>;
    expect(all.techStack).toBeDefined();
    expect(all.updated).toBeDefined();
  });

  it('deleteMemory removes key', () => {
    writeMemory('temp', 'delete-me');
    deleteMemory('temp');
    expect(readMemory('temp')).toBeUndefined();
  });

  it('readMemory returns undefined for missing key', () => {
    expect(readMemory('nonexistent_xyz')).toBeUndefined();
  });

  it('backup cleaned up after successful write', () => {
    writeMemory('bt', { v: 42 });
    expect(existsSync(path.join(tmpDir, '.prism/memory.backup.json'))).toBe(false);
    expect(existsSync(path.join(tmpDir, '.prism/project-memory.json'))).toBe(true);
  });
});
