import { Command } from 'commander';
import { spawnSync } from 'child_process';
import { Pipeline } from '@prism-five/orchestrator';

export const commitCommand = new Command('commit')
  .alias('ci')
  .description('Commit feature changes with Prism-Change trailer')
  .argument('<slug>', 'Feature slug (alphanumeric + dashes only)')
  .option('-m, --message <text>', 'Commit message')
  .action((slug, opts) => {
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) { console.log('Slug must be alphanumeric+dashes only'); process.exit(1); }
    const pipeline = new Pipeline();
    if (!pipeline.getFeature(slug)) { console.log(`Feature "${slug}" not found`); process.exit(1); }
    const msg = opts.message ?? `feat(${slug}): implement changes`;
    const add = spawnSync('git', ['add', '.'], { stdio: 'inherit' });
    if (add.status !== 0) { console.log('git add failed'); process.exit(1); }
    const commit = spawnSync('git', ['commit', '-m', `${msg}\n\nPrism-Change: ${slug}`], { stdio: 'inherit' });
    if (commit.status !== 0) { console.log('git commit failed'); process.exit(1); }
    console.log(`Committed "${slug}"`);
  });
