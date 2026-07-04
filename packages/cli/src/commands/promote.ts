import { Command } from 'commander';
import { Pipeline } from '@pentad/orchestrator';

export const promoteCommand = new Command('promote')
  .alias('pm')
  .description('Promote product stage: exploring → building → growing → mature')
  .argument('<stage>', 'Target stage')
  .action(stage => {
    const pipeline = new Pipeline();
    const before = pipeline.getState().productStage;
    pipeline.promoteStage(stage);
    console.log(`✓ Stage promoted: ${before} → ${stage}`);
    console.log('  Product has entered a new lifecycle phase.');
  });
