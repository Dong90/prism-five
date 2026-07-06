import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { addLearning, listLearnings, type LearningEntry } from './learnings';

describe('learnings', () => {
  const origCwd = process.cwd;
  let tmpDir = '';

  beforeAll(() => { tmpDir = mkdtempSync(path.join(tmpdir(), 'prism-lrn-')); process.cwd = () => tmpDir; });
  afterAll(() => { process.cwd = origCwd; });

  it('addLearning appends to LEARNINGS.md', () => {
    addLearning({ category: 'fix', title: 'Fix null pointer', description: 'Check existence.', date: '2026-07-06' });
    const fp = path.join(tmpDir, '.prism/LEARNINGS.md');
    expect(existsSync(fp)).toBe(true);
    const c = readFileSync(fp, 'utf-8');
    expect(c).toContain('[fix] Fix null pointer');
    expect(c).toContain('> 2026-07-06');
  });

  it('addLearning does not overwrite existing', () => {
    addLearning({ category: 'fix', title: 'First', description: 'd1', date: '2026-01-01' });
    addLearning({ category: 'pattern', title: 'Second', description: 'd2', date: '2026-01-02' });
    const entries = listLearnings();
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it('listLearnings filters by category', () => {
    const entries = listLearnings({ category: 'fix' });
    for (const e of entries) expect(e.category).toBe('fix');
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it('listLearnings returns [] for empty file', () => {
    expect(Array.isArray(listLearnings({ category: 'nonexistent' }))).toBe(true);
  });
});
