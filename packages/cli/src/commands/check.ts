import { Command } from 'commander';
import { Pipeline } from '@pentad/orchestrator';
import { loadAgent } from '@pentad/orchestrator';
import type { AgentRole } from '@pentad/orchestrator';

export const checkCommand = new Command('check')
  .alias('ck')
  .description('Preflight check: are upstream artifacts ready for the current Agent?')
  .action(() => {
    const pipeline = new Pipeline();
    const feature = pipeline.getActiveFeature();
    if (!feature) {
      console.log('✗ No active feature');
      process.exit(1);
    }

    console.log(`Feature: ${feature.slug}`);
    console.log(`Role:    ${feature.currentRole}`);
    console.log(`Status:  ${feature.status}`);
    console.log('');

    const ctx = loadAgent(feature.currentRole as AgentRole);

    console.log(`Agent:   ${ctx.definition.name} (${ctx.definition.paradigm})`);
    console.log(`\nPreflight checklist:`);
    for (const item of ctx.preflight) {
      console.log(`  [ ] ${item}`);
    }
    console.log(`\nGates:`);
    for (const [k, v] of Object.entries(feature.gates)) {
      console.log(`  ${k}: ${v ? '✓' : '✗'}`);
    }
  });
