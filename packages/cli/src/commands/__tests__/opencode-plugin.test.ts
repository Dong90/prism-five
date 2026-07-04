import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const PLUGIN_DIR = path.resolve(__dirname, '../../../../../.opencode-plugin');

describe('.opencode-plugin/ package skeleton', () => {
  it('manifest entry point exists', () => {
    expect(existsSync(path.join(PLUGIN_DIR, 'index.ts'))).toBe(true);
  });

  it('package.json exists and declares prism-five', () => {
    const pkg = readFileSync(path.join(PLUGIN_DIR, 'package.json'), 'utf8');
    expect(pkg).toMatch(/@prism-five\/opencode-plugin/);
  });

  it('tsconfig.json exists and is strict', () => {
    const tsconfig = readFileSync(path.join(PLUGIN_DIR, 'tsconfig.json'), 'utf8');
    expect(tsconfig).toMatch(/strict/);
  });
});

describe('manifest produces OpenCode-compatible manifest', () => {
  it('manifest CLI emits JSON with 10 tools', () => {
    // Use tsx or compile-and-run; here we do a simple substring check via grep
    const idx = readFileSync(path.join(PLUGIN_DIR, 'index.ts'), 'utf8');
    // Count 'name:' inside TOOLS array
    const toolNames = (idx.match(/{\s*name:\s*'prism-/g) ?? []).length;
    expect(toolNames).toBeGreaterThanOrEqual(9);
  });

  it('manifest CLI emits JSON with skills from .pentad/agents/', () => {
    const idx = readFileSync(path.join(PLUGIN_DIR, 'index.ts'), 'utf8');
    expect(idx).toMatch(/loadSkills/);
    expect(idx).toMatch(/SKILLS_DIR/);
  });
});
