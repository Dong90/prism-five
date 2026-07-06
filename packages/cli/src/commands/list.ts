import { Command } from 'commander';
import { Pipeline } from '@prism-five/orchestrator';

export const listCommand = new Command('list')
  .alias('ls')
  .description('List all features and their status')
  .option('-a, --all', 'Show all including deprecated and sunset')
  .action(opts => {
    const pipeline = new Pipeline();
    const features = Object.values(pipeline.getState().features)
      .filter(f => opts.all || !['deprecated', 'sunset'].includes(f.status));
    if (features.length === 0) { console.log('No features found'); return; }
    for (const f of features) console.log(`[${f.slug}] ${f.currentRole} (${f.status})`);
  });
