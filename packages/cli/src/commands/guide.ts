import { Command } from 'commander';
import { Pipeline, loadAgent, agentSummary } from '@prism-five/orchestrator';

export const guideCommand = new Command('guide')
  .alias('gd')
  .description('Show next step guidance for feature')
  .argument('<slug>', 'Feature slug')
  .action(slug => {
    const pipeline = new Pipeline();
    const feature = pipeline.getFeature(slug);
    if (!feature) { console.log(`✗ Feature "${slug}" not found`); process.exit(1); }
    const ctx = loadAgent(feature.currentRole);
    console.log(agentSummary(ctx));
    console.log(`\nNext: prism continue ${slug}`);
  });
