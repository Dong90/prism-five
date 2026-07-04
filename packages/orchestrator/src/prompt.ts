import type { PipelineState, Feature, AgentRole } from './schema';
import { AGENT_MAP } from './schema';
import { loadAgent, type AgentContext } from './agent';

export interface AgentPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: AgentContext;
}

export function buildAgentPrompt(role: AgentRole, feature: Feature, state: PipelineState): AgentPrompt {
  const ctx = loadAgent(role);
  const def = AGENT_MAP[role];

  const systemPrompt = [
    `<agent-identity>`,
    `You are ${def.name} — the ${def.role} Agent in the Prism-Five pipeline.`,
    `Your paradigm is ${def.paradigm}.`,
    `</agent-identity>`,
    '',
    '<role-instructions>',
    ctx.ironLaw,
    '</role-instructions>',
    '',
    '<constraints>',
    ...ctx.constraints.map(c => `- ${c}`),
    '</constraints>',
    '',
    '<tools>',
    `You may use: ${ctx.tools.allow.join(', ')}`,
    `You must NOT use: ${ctx.tools.deny.join(', ')}`,
    '</tools>',
    '',
    '<fatal-constraints>',
    ...ctx.fatalConstraints,
    '</fatal-constraints>',
  ].join('\n');

  const userPrompt = [
    `## Current Task`,
    `Feature: ${feature.slug}`,
    `Status: ${feature.status}`,
    `Your Role: ${role}`,
    '',
    `## Pipeline State`,
    `Stage: ${state.productStage}`,
    `Active Feature: ${state.activeFeature ?? 'none'}`,
    '',
    `## Execution Steps`,
    ...ctx.steps.map(s => `### ${s.title}\n${s.content}\n`),
    '',
    `## Quality Checklist (must pass before gate)`,
    ...ctx.qualityCheck.map(q => `- [ ] ${q}`),
    '',
    `Complete the steps for the ${role} role. Produce artifacts in .prism-five/features/${feature.slug}/ directory.`,
  ].join('\n');

  return { systemPrompt, userPrompt, context: ctx };
}

export function getAgentSkillMarkdown(role: AgentRole): string {
  const ctx = loadAgent(role);
  return ctx.rawContent;
}

export function listAgents(): Array<{ role: AgentRole; name: string; paradigm: string }> {
  return Object.entries(AGENT_MAP).map(([role, def]) => ({
    role: role as AgentRole,
    name: def.name,
    paradigm: def.paradigm,
  }));
}
