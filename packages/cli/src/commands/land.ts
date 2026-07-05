import { Command } from 'commander';
import { Pipeline } from '@prism-five/orchestrator';

export const landCommand = new Command('land')
  .alias('ld')
  .description('Mark feature as landed/complete after PR merge')
  .argument('<slug>', 'Feature slug')
  .action(slug => {
    const pipeline = new Pipeline();
    const feature = pipeline.getFeature(slug);
    if (!feature) { console.log(`Feature "${slug}" not found`); process.exit(1); }
    if (feature.status !== 'live' && feature.currentRole !== 'maintainer') {
      console.log(`Feature must be live or in maintainer role, current: ${feature.status}/${feature.currentRole}`);
      process.exit(1);
    }
    feature.status = 'live';
    feature.updatedAt = new Date().toISOString();
    pipeline.persist();
    console.log(`Landed "${slug}"`);
  });
