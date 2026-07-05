import { Command } from 'commander';
import { Pipeline } from '@prism-five/orchestrator';

export const initCommand = new Command('init')
  .description('Initialize Prism workspace')
  .option('--profile <name>', 'Default profile', 'develop')
  .action(opts => {
    new Pipeline('.prism/pipeline.json').persist();
    console.log(`✓ Prism workspace initialized (profile: ${opts.profile})`);
  });
