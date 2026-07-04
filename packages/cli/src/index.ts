#!/usr/bin/env node
import { Command } from 'commander';
import { statusCommand } from './commands/status';
import { newCommand } from './commands/new';
import { continueCommand } from './commands/continue';
import { approveCommand } from './commands/approve';
import { checkCommand } from './commands/check';
import { promoteCommand } from './commands/promote';

const program = new Command();

program
  .name('prism')
  .description('Prism-Five — 五棱镜单功能串行管道 CLI')
  .version('0.1.0');

program.addCommand(statusCommand);
program.addCommand(newCommand);
program.addCommand(continueCommand);
program.addCommand(approveCommand);
program.addCommand(checkCommand);
program.addCommand(promoteCommand);

program.parse();
