import { Command } from 'commander';
import { spawnSync } from 'child_process';
import { Pipeline } from '@prism-five/orchestrator';

export const shipCommand = new Command('ship')
  .alias('sh')
  .description('Push feature changes')
  .argument('<slug>', 'Feature slug')
  .action(slug => {
    const pipeline = new Pipeline();
    if (!pipeline.getFeature(slug)) { console.log(`Feature "${slug}" not found`); process.exit(1); }
    const result = spawnSync('git', ['push'], { stdio: 'inherit' });
    if (result.status !== 0) { console.log('git push failed'); process.exit(1); }
    console.log(`Shipped "${slug}"`);
  });
