import { Command } from 'commander';
import { Pipeline } from '@pentad/orchestrator';
import { agentSummary } from '@pentad/orchestrator';
import type { AgentRole } from '@pentad/orchestrator';

export const statusCommand = new Command('status')
  .alias('st')
  .description('Show current pipeline state')
  .option('-v, --verbose', 'Show full details')
  .action((opts) => {
    const pipeline = new Pipeline();
    const state = pipeline.getState();
    const feature = pipeline.getActiveFeature();

    console.log('┌─ Pentad Pipeline ───────────────────────┐');
    console.log(`│ Stage:   ${state.productStage.padEnd(38)}│`);
    console.log(`│ Feature: ${(state.activeFeature ?? 'none').padEnd(38)}│`);
    console.log(`│ Queue:   ${state.queue.length} pending`.padEnd(45) + '│');
    console.log('└─────────────────────────────────────────────┘');

    if (feature) {
      console.log(`\nActive Feature: ${feature.slug}`);
      console.log(`  Status:      ${feature.status}`);
      console.log(`  Role:        ${feature.currentRole}`);
      console.log(`  Created:     ${feature.createdAt.slice(0, 10)}`);
      console.log(`  Stage History:`);
      for (const s of feature.stageHistory) {
        const done = s.completedAt ? ' ✓' : ' ← current';
        console.log(`    ${s.role}  ${s.enteredAt.slice(0, 10)}${done}`);
      }
      console.log(`\n  Gates:`);
      for (const [k, v] of Object.entries(feature.gates)) {
        console.log(`    ${k}: ${v ? '✓ APPROVED' : '✗ pending'}`);
      }

      if (opts.verbose) {
        const role = feature.currentRole as AgentRole;
        console.log(`\nCurrent Agent: ${role}`);
        const ctx = loadAgent(role);
        console.log('--- Agent Context ---');
        console.log(agentSummary(ctx));
      }
    } else {
      console.log('\nNo active feature. Create one with: npx prism new <slug>');
    }
  });

function loadAgent(role: string) {
  const { loadAgent: la } = require('@pentad/orchestrator');
  return la(role as AgentRole);
}
