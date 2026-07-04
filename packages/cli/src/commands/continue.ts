import { Command } from 'commander';
import { Pipeline } from '@pentad/orchestrator';

export const continueCommand = new Command('continue')
  .alias('cont')
  .description('Advance the active feature to the next role')
  .action(() => {
    const pipeline = new Pipeline();
    const feature = pipeline.getActiveFeature();
    if (!feature) {
      console.log('✗ No active feature. Create one with: npx prism new <slug>');
      process.exit(1);
    }

    const result = pipeline.continue(feature.slug);
    if (!result.gate.passed) {
      console.log(`✗ Gate blocked: ${result.gate.reason}`);
      console.log(`  ${result.gate.requiresHuman ? '→ Human approval required' : '→ Fix issues and retry'}`);
      process.exit(1);
    }

    console.log(`✓ Advanced: ${feature.currentRole}`);
    if (result.nextRole) {
      console.log(`  From: ${feature.stageHistory[feature.stageHistory.length - 2]?.role}`);
      console.log(`  To:   ${result.nextRole}`);
    } else {
      console.log(`  Feature is LIVE!`);
    }
    console.log(`  Status: ${feature.status}`);
  });
