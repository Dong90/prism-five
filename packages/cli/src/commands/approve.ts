import { Command } from 'commander';
import { Pipeline } from '@pentad/orchestrator';

export const approveCommand = new Command('approve')
  .alias('ap')
  .description('Approve a human gate')
  .argument('<gate>', 'Gate to approve: prototype_approved or release_approved')
  .action((gate) => {
    const valid = ['prototype_approved', 'release_approved'];
    if (!valid.includes(gate)) {
      console.log(`✗ Invalid gate: ${gate}. Valid gates: ${valid.join(', ')}`);
      process.exit(1);
    }

    const pipeline = new Pipeline();
    const feature = pipeline.getActiveFeature();
    if (!feature) {
      console.log('✗ No active feature');
      process.exit(1);
    }

    pipeline.approveGate(feature.slug, gate as 'prototype_approved' | 'release_approved');
    console.log(`✓ Gate "${gate}" APPROVED for ${feature.slug}`);
    console.log('  Next: npx prism continue');
  });
