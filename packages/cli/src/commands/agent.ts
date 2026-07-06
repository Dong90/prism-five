import { Command } from 'commander';
import { AGENT_MAP } from '@prism-five/orchestrator';
import type { AgentRole } from '@prism-five/orchestrator';

const PRISM_AGENT_PREFIX = 'prism-';

type AgentDef = { name: string; role: AgentRole; paradigm: string };

export const agentCommand = new Command('agent')
  .description('Pentad Agent dispatch: list all agents or invoke by name')
  .argument('[name]', 'Agent name (e.g., prism-rapid-prototyper)')
  .argument('[task...]', 'Task description for the agent (optional positional)')
  .action((name, task: string[] | undefined) => {
    if (!name || name === 'list') {
      listAllAgents();
      return;
    }

    // Reject path injection early
    if (name.includes('/') || name.includes('..') || name.startsWith('-')) {
      console.error(`✗ Invalid agent name: "${name}". Must match pattern: ${PRISM_AGENT_PREFIX}<role>`);
      process.exit(1);
    }

    const matched = findAgentByName(name);
    if (!matched) {
      console.error(`✗ Unknown agent: "${name}". Run \`prism agent list\` to see available agents.`);
      process.exit(1);
      return;
    }

    const taskText = (task ?? []).join(' ');
    dispatchAgent(matched, name, taskText);
  });

function listAllAgents() {
  const entries = Object.values(AGENT_MAP) as AgentDef[];
  // group by role using a Map (avoids noUncheckedIndexedAccess issues)
  const byRoleMap = new Map<AgentRole, AgentDef[]>();
  for (const e of entries) {
    const list = byRoleMap.get(e.role);
    if (list) list.push(e);
    else byRoleMap.set(e.role, [e]);
  }

  console.log('┌─ Pentad Agent Catalog ──────────────────────┐');
  const total = entries.length;
  console.log(`│ Total agents: ${total}`);
  console.log('├──────────────────────────────────────────────┤');
  for (const [role, list] of [...byRoleMap.entries()].sort()) {
    console.log(`│ ${role.padEnd(20)} (${list.length})`);
    for (const a of list) {
      console.log(`│   ${a.name.padEnd(40)} [${a.paradigm}]`);
    }
  }
  console.log('└──────────────────────────────────────────────┘');
  console.log(`\nUsage: prism agent <name> "<task>"`);
}

function findAgentByName(name: string): AgentDef | null {
  for (const def of Object.values(AGENT_MAP) as AgentDef[]) {
    if (def.name === name) return def;
  }
  return null;
}

function dispatchAgent(agent: AgentDef, name: string, task: string) {
  const taskText = task || '(no task specified)';
  console.log('┌─ Agent Dispatch ─────────────────────┐');
  console.log(`│ Name:     ${agent.name}`);
  console.log(`│ Role:     ${agent.role}`);
  console.log(`│ Paradigm: ${agent.paradigm}`);
  console.log(`│ Task:     ${taskText.slice(0, 60)}${taskText.length > 60 ? '...' : ''}`);
  console.log('├────────────────────────────────────────┤');
  console.log('│ Plan: ready to execute                  │');
  console.log('│ (load agent SKILL.md and produce        │');
  console.log('│  system+user prompts)                    │');
  console.log('└────────────────────────────────────────┘');
  console.log(`\nFull agent prompt not yet implemented in v0.4; dispatch structure shown above.`);
}
