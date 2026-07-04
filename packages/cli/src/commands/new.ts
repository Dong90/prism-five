import { Command } from 'commander';
import { Pipeline } from '@pentad/orchestrator';

export const newCommand = new Command('new')
  .description('Create a new feature in the pipeline')
  .argument('<slug>', 'Feature slug (e.g. user-auth)')
  .action((slug) => {
    const pipeline = new Pipeline();
    const feature = pipeline.createFeature(slug);
    console.log(`✓ Feature "${feature.slug}" created`);
    console.log(`  Role:   ${feature.currentRole} (Prototyper)`);
    console.log(`  Status: ${feature.status}`);
    console.log(`\nNext: prototype this feature, then run: npx prism approve prototype_approved`);
    console.log(`      then: npx prism continue`);
  });
