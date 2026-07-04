#!/usr/bin/env node
/**
 * Prism-Five OpenCode Plugin Manifest
 *
 * Registers 9 prism CLI commands as OpenCode tools and 5 SKILL.md as OpenCode skills.
 * Loaded via .opencode-plugin/.opencode-plugin.json or `opencode plugin add <path>`.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const SKILLS_DIR = path.join(REPO_ROOT, '.pentad/agents');

const TOOLS = [
  { name: 'prism-new',       description: 'Create a new Pentad feature in the pipeline' },
  { name: 'prism-status',    description: 'Show current pipeline state (json machine-readable)' },
  { name: 'prism-continue',  description: 'Advance the active feature to the next role' },
  { name: 'prism-approve',   description: 'Approve a human gate (prototype_approved | release_approved)' },
  { name: 'prism-check',     description: 'Preflight check: are upstream artifacts ready?' },
  { name: 'prism-promote',   description: 'Promote product stage (exploring/building/growing/mature)' },
  { name: 'prism-run',       description: 'Dispatch the current Agent (Pentad runtime)' },
  { name: 'prism-queue',     description: 'Manage feature queue (P0/P1/P2)' },
  { name: 'prism-next',      description: 'Activate the next feature from the queue' },
  { name: 'prism-agent',     description: 'Pentad agent dispatch: list agents or invoke one by name' },
];

interface SkillEntry { name: string; mode: string; paradigm: string; description: string; role: string; }

function loadSkills(): SkillEntry[] {
  if (!existsSync(SKILLS_DIR)) return [];
  const files = readdirSync(SKILLS_DIR).filter(f => f.endsWith('.md'));
  const skills: SkillEntry[] = [];
  for (const f of files) {
    const content = readFileSync(path.join(SKILLS_DIR, f), 'utf8');
    const fm = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const fields: Record<string, string> = {};
    for (const line of fm[1]!.split('\n')) {
      const m = line.match(/^(\w+):\s*(.+)/);
      if (m) fields[m[1]!] = m[2]!.trim();
    }
    if (!fields.name || fields.mode !== 'agent') continue;
    skills.push({
      name: `pentad-${fields.name.replace(/^pentad-/, '')}`,
      mode: fields.mode ?? 'agent',
      paradigm: fields.paradigm ?? 'Unknown',
      description: fields.description ?? '',
      role: fields.role ?? '',
    });
  }
  return skills;
}

interface OpenCodePluginManifest {
  name: string;
  version: string;
  description: string;
  tools: typeof TOOLS;
  skills: SkillEntry[];
  onSessionStart?: () => Promise<void>;
}

export const manifest: OpenCodePluginManifest = {
  name: 'prism-five',
  version: '0.4.0',
  description: 'Pentad 5-role pipeline CLI → OpenCode tool/skill integration',
  tools: TOOLS,
  skills: loadSkills(),
  onSessionStart: async () => {
    const status = spawnSync('node', [path.join(REPO_ROOT, 'packages/cli/dist/index.js'), 'status', '--json'], {
      encoding: 'utf8',
      cwd: REPO_ROOT,
    });
    if (status.status === 0 && status.stdout) {
      // Provide pipeline state as context
      const state = JSON.parse(status.stdout);
      console.log(`[pentad] session start: activeFeature=${state.state?.activeFeature ?? 'none'}, productStage=${state.state?.productStage}`);
    }
  },
};

// CLI entry: dump manifest as JSON for OpenCode to consume
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(manifest, null, 2));
}
