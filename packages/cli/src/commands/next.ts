import { Command } from 'commander';
import { QueueManager, Pipeline } from '@pentad/orchestrator';

export const nextCommand = new Command('next')
  .description('Activate the next feature from the queue')
  .action(() => {
    const qm = new QueueManager();
    const pipeline = new Pipeline();

    const active = pipeline.getActiveFeature();
    if (active && active.status !== 'live') {
      console.log(`✗ Active feature "${active.slug}" is not closed yet (status: ${active.status})`);
      console.log('  Complete the current feature first, or close it.');
      process.exit(1);
    }

    const next = qm.dequeue();
    if (!next) {
      console.log('Queue is empty. Add features with: npx prism queue --add <slug>');
      process.exit(0);
    }

    console.log(`✓ Dequeued: ${next.slug} [${next.priority}]`);
    const feature = pipeline.createFeature(next.slug);
    console.log(`✓ Activated: ${feature.slug} (${feature.currentRole})`);
    console.log(`  Queue remaining: ${qm.size()}`);
  });
