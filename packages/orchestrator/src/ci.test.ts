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
});

