import { Command } from 'commander';
import { QueueManager } from '@prism-five/orchestrator';

export const queueCommand = new Command('queue')
  .alias('q')
  .description('Manage feature queue')
  .option('-a, --add <slug>', 'Add feature to queue')
  .option('-p, --priority <level>', 'Priority: P0, P1, P2', 'P2')
  .option('-r, --remove <slug>', 'Remove feature from queue')
  .action(opts => {
    const qm = new QueueManager();

    if (opts.add) {
      const valid = ['P0', 'P1', 'P2'];
      const p = valid.includes(opts.priority) ? opts.priority : 'P2';
      const item = qm.enqueue(opts.add, p);
      console.log(`✓ Enqueued: ${item.slug} [${item.priority}]`);
      console.log(`  Queue size: ${qm.size()}`);
    } else if (opts.remove) {
      const removed = qm.remove(opts.remove);
      console.log(removed ? `✓ Removed: ${opts.remove}` : `✗ Not found: ${opts.remove}`);
    } else {
      const items = qm.list();
      if (items.length === 0) {
        console.log(
          'Queue is empty. Add features with: npx prism queue --add <slug> --priority P1',
        );
      } else {
        console.log(`Queue (${items.length} items):`);
        for (const item of items) {
          console.log(
            `  [${item.priority}] ${item.slug}  ${item.addedAt ? item.addedAt.slice(0, 10) : ''}`,
          );
        }
      }
    }
  });
