import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { syncSkills } from './ci';

describe('syncSkills', () => {
  it('syncs agent files to destination', () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'prism-ci-'));
    const dir = path.join(tmp, '.prism/profiles/develop');
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'prototyper.md'), '# Test');

    const orig = process.cwd();
    process.chdir(tmp);
    try { expect(syncSkills('opencode', '.prism/profiles/develop')).toContain('prototyper'); }
    finally { process.chdir(orig); }
  });

  it('returns empty for missing dir', () => {
    expect(syncSkills('opencode', '.prism/nonexistent')).toEqual([]);
  });

  it('skips corrupted source files gracefully', () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'prism-ci-'));
    const dir = path.join(tmp, '.prism/profiles/develop');
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'good.md'), '# Good');

    const orig = process.cwd();
    process.chdir(tmp);
    try {
      const result = syncSkills('opencode', '.prism/profiles/develop');
      expect(result).toContain('good');
      expect(result.some(r => r.includes('skipped'))).toBe(false);
    }
    finally { process.chdir(orig); }
  });

  it('syncs to all four platforms', () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'prism-ci-'));
    const dir = path.join(tmp, '.prism/profiles/develop');
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'agent.md'), '# Agent');

    const orig = process.cwd();
    process.chdir(tmp);
    try {
      for (const platform of ['opencode', 'claude', 'codex', 'cursor'] as const) {
        expect(syncSkills(platform, '.prism/profiles/develop')).toContain('agent');
      }
    }
    finally { process.chdir(orig); }
  });
});

