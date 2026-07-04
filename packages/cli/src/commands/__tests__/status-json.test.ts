import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CLI = path.resolve(__dirname, '../../../dist/index.js');

describe('prism status --json', () => {
  let cwd: string;

  beforeEach(() => {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'prism-status-'));
    const pentadDir = path.join(tmp, '.pentad');
    mkdirSync(pentadDir, { recursive: true });
    const pipelinePath = path.join(pentadDir, 'pipeline.json');
    const initial = {
      version: '0.1.0',
      productStage: 'exploring',
      activeFeature: 'json-test',
      features: {
        'json-test': {
          slug: 'json-test',
          status: 'draft',
          currentRole: 'prototyper',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stageHistory: [{ role: 'prototyper', enteredAt: new Date().toISOString() }],
          gates: {
            prototype_approved: false,
            build_reviewed: false,
            sweep_passed: false,
            release_approved: false,
          },
        },
      },
      queue: [],
      updated: new Date().toISOString(),
    };
    writeFileSync(pipelinePath, JSON.stringify(initial, null, 2));
    cwd = tmp;
  });

  afterEach(() => {
    try { rmSync(cwd, { recursive: true, force: true }); } catch {}
  });

  it('outputs valid JSON when --json flag is passed', () => {
    const result = spawnSync('node', [CLI, 'status', '--json'], {
      encoding: 'utf8',
      cwd,
    });
    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.type).toBe('success');
    expect(parsed.state.productStage).toBe('exploring');
    expect(parsed.state.activeFeature).toBe('json-test');
  });

  it('JSON output contains all pipeline state keys', () => {
    const result = spawnSync('node', [CLI, 'status', '--json'], {
      encoding: 'utf8',
      cwd,
    });
    const parsed = JSON.parse(result.stdout);
    expect(parsed.state).toHaveProperty('productStage');
    expect(parsed.state).toHaveProperty('activeFeature');
    expect(parsed.state).toHaveProperty('features');
    expect(parsed.state).toHaveProperty('queue');
    expect(parsed.state).toHaveProperty('updated');
  });

  it('does not output JSON without --json flag (legacy text mode)', () => {
    const result = spawnSync('node', [CLI, 'status'], {
      encoding: 'utf8',
      cwd,
    });
    expect(result.stdout.startsWith('{')).toBe(false);
    expect(result.stdout).toContain('Pentad Pipeline');
  });
});
