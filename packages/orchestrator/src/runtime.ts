import type { PipelineState, Feature, AgentRole } from './schema';
import { AGENT_MAP } from './schema';
import { loadAgent } from './agent';
import { buildAgentPrompt } from './prompt';
import { writePipeline } from './state';

// ─── Work Item ──────────────────────────────────────────────

export interface WorkItem {
  /** Step index (1-based) */
  step: number;
  /** Step title (e.g. "Technical spec from PRD") */
  title: string;
  /** Step description / content */
  description: string;
  /** Expected output artifact */
  output: string;
  /** Status */
  status: 'pending' | 'running' | 'completed' | 'failed';
  /** Execution result */
  result?: string;
}

// ─── StepPlan ───────────────────────────────────────────────

export interface StepPlan {
  agent: string;
  role: AgentRole;
  paradigm: string;
  feature: string;
  ironLaw: string;
  steps: WorkItem[];
}

// ─── ExecutionLog ────────────────────────────────────────────

export interface ExecutionLog {
  feature: string;
  role: AgentRole;
  startedAt: string;
  completedAt?: string;
  steps: WorkItem[];
  summary: {
    total: number;
    completed: number;
    failed: number;
  };
}

// ─── AgentRuntime ────────────────────────────────────────────

export class AgentRuntime {
  private state: PipelineState;
  private statePath: string;

  constructor(state: PipelineState, statePath?: string) {
    this.state = state;
    this.statePath = statePath ?? '.prism/pipeline.json';
  }

  /**
   * Build an execution plan for the given feature's current role.
   */
  dispatch(feature: Feature): StepPlan {
    const role = feature.currentRole;
    const ctx = loadAgent(role);
    const def = AGENT_MAP[role];

    const workItems: WorkItem[] = ctx.steps.map((s, i) => ({
      step: i + 1,
      title: s.title,
      description: s.content || `Execute: ${s.title}`,
      output: `.prism/features/${feature.slug}/${role}/`,
      status: 'pending' as const,
    }));

    return {
      agent: def.name,
      role,
      paradigm: def.paradigm,
      feature: feature.slug,
      ironLaw: ctx.ironLaw,
      steps: workItems,
    };
  }

  /**
   * Build the full system + user prompt for the current Agent.
   */
  buildPrompt(feature: Feature): { system: string; user: string } {
    const prompt = buildAgentPrompt(feature.currentRole, feature, this.state);
    return { system: prompt.systemPrompt, user: prompt.userPrompt };
  }

  /**
   * After step execution, log results and persist.
   */
  logExecution(feature: Feature, plan: StepPlan): ExecutionLog {
    const now = new Date().toISOString();
    const log: ExecutionLog = {
      feature: feature.slug,
      role: feature.currentRole,
      startedAt: now,
      steps: plan.steps,
      summary: {
        total: plan.steps.length,
        completed: plan.steps.filter(s => s.status === 'completed').length,
        failed: plan.steps.filter(s => s.status === 'failed').length,
      },
    };

    if (log.summary.completed + log.summary.failed === log.summary.total) {
      log.completedAt = now;
    }

    // Persist to pipeline state
    feature.updatedAt = now;
    writePipeline(this.state, this.statePath);

    return log;
  }

  /**
   * Format the execution plan for CLI display.
   */
  formatPlan(plan: StepPlan): string {
    const lines = [
      `┌─ Agent: ${plan.agent} (${plan.paradigm}) ────────┐`,
      `│ Feature: ${plan.feature}`,
      `│ Iron Law: ${plan.ironLaw.split('\n')[0]}`,
      `├─ Steps (${plan.steps.length}) ─────────────────────────┤`,
    ];

    for (const s of plan.steps) {
      const icon =
        s.status === 'completed'
          ? '✓'
          : s.status === 'running'
            ? '▶'
            : s.status === 'failed'
              ? '✗'
              : '○';
      lines.push(`│ ${icon} Step ${s.step}: ${s.title.padEnd(40).slice(0, 40)} │`);
    }

    lines.push('└─────────────────────────────────────────────┘');
    lines.push(`\nTo execute: review each step and produce artifacts.`);
    lines.push(`When done: npx prism continue`);

    return lines.join('\n');
  }
}
