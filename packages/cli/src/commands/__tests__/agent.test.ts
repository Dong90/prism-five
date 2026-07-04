import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CLI = path.resolve(__dirname, '../../../dist/index.js');

function setupPipeline(): string {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'prism-agent-'));
  const pentadDir = path.join(tmp, '.pentad');
  mkdirSync(pentadDir, { recursive: true });
  const pipelinePath = path.join(pentadDir, 'pipeline.json');
  const initial = {
    version: '0.1.0',
    productStage: 'exploring',
    activeFeature: null,
    features: {},
    queue: [],
    updated: new Date().toISOString(),
  };
  writeFileSync(pipelinePath, JSON.stringify(initial, null, 2));
  return tmp;
}

describe('prism agent', () => {
  let cwd: string;

  // ensure per-test cwd
  // vitest runs tests in series; tmp is fresh each time
  // (no beforeEach needed since `cwd` is set inside the test)

  it('agent list outputs role-grouped agents (≥5 roles represented)', () => {
    cwd = setupPipeline();
    const result = spawnSync('node', [CLI, 'agent', 'list'], {
      encoding: 'utf8',
      cwd,
    });
    expect(result.status).toBe(0);
    const output = result.stdout;
    // Should list at least 5 distinct roles
    expect(output).toMatch(/prototyper/);
    expect(output).toMatch(/builder/);
    expect(output).toMatch(/sweeper/);
    expect(output).toMatch(/grower/);
    expect(output).toMatch(/maintainer/);
  });

  it('agent <name> resolves an existing agent', () => {
    cwd = setupPipeline();
    const result = spawnSync('node', [CLI, 'agent', 'pentad-prototype'], {
      encoding: 'utf8',
      cwd,
    });
    expect(result.status).toBe(0);
    expect(result.stdout.toLowerCase()).toMatch(/agent|prototyp|plan|prompt/);
  });

  it('agent <name> rejects unknown agent names', () => {
    cwd = setupPipeline();
    const result = spawnSync('node', [CLI, 'agent', 'pentad-does-not-exist'], {
      encoding: 'utf8',
      cwd,
    });
    expect(result.status).toBeGreaterThanOrEqual(1);
    expect(result.stderr + result.stdout).toMatch(/unknown|not.*found|no such/i);
  });

  it('agent <name> with path injection is rejected', () => {
    cwd = setupPipeline();
    const result = spawnSync('node', [CLI, 'agent', '../etc/passwd'], {
      encoding: 'utf8',
      cwd,
    });
    expect(result.status).toBeGreaterThanOrEqual(1);
  });
});
