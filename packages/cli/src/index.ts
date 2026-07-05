#!/usr/bin/env node
import { Command } from 'commander';
import { statusCommand } from './commands/status';
import { newCommand } from './commands/new';
import { continueCommand } from './commands/continue';
import { approveCommand } from './commands/approve';
import { checkCommand } from './commands/check';
import { promoteCommand } from './commands/promote';
import { runCommand } from './commands/run';
import { queueCommand } from './commands/queue';
import { nextCommand } from './commands/next';
import { agentCommand } from './commands/agent';
import { exemptCommand } from './commands/exempt';
import { cancelCommand } from './commands/cancel';
import { listCommand } from './commands/list';
import { doctorCommand } from './commands/doctor';
import { guideCommand } from './commands/guide';
import { initCommand } from './commands/init';

const program = new Command();
program.name('prism').description('Pentad — 五重奏单功能串行管道 CLI').version('0.3.0');

program.addCommand(statusCommand);
program.addCommand(newCommand);
program.addCommand(continueCommand);
program.addCommand(approveCommand);
program.addCommand(checkCommand);
program.addCommand(promoteCommand);
program.addCommand(runCommand);
program.addCommand(queueCommand);
program.addCommand(nextCommand);
program.addCommand(agentCommand);
program.addCommand(exemptCommand);
program.addCommand(cancelCommand);
program.addCommand(listCommand);
program.addCommand(doctorCommand);
program.addCommand(guideCommand);
program.addCommand(initCommand);

program.parse();
