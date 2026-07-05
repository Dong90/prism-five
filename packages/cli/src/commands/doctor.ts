import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

export const doctorCommand = new Command('doctor')
  .description('Check Prism workspace health')
  .option('--strict', 'Exit non-zero on any warning')
  .action(opts => {
    const issues: string[] = [];
    const root = process.cwd();
    if (!fs.existsSync(path.join(root, '.prism/pipeline.json'))) issues.push('pipeline.json missing — run prism init');
    if (!fs.existsSync(path.join(root, '.prism/profiles/develop'))) issues.push('profiles/develop missing');
    if (issues.length === 0) { console.log('✓ Prism workspace healthy'); return; }
    for (const i of issues) console.log(`✗ ${i}`);
    if (opts.strict) process.exit(1);
  });
