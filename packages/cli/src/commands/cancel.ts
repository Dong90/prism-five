import { Command } from 'commander';
import { Pipeline } from '@prism-five/orchestrator';

export const cancelCommand = new Command('cancel')
  .alias('cx')
  .description('Cancel and abort an active feature')
  .argument('<slug>', 'Feature slug to cancel')
  .action(slug => {
    const pipeline = new Pipeline();
    const feature = pipeline.getFeature(slug);
    if (!feature) { console.log(`Feature "${slug}" not found`); process.exit(1); }
    if (feature.status === 'live') { console.log('Cannot cancel live feature — use prism land first'); process.exit(1); }
    feature.status = 'deprecated';
    feature.updatedAt = new Date().toISOString();
    pipeline.persist();
    console.log(`✓ Feature "${slug}" cancelled`);
  });
