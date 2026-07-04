import {
  type PipelineState,
  type Feature,
  type AgentRole,
  type FeatureState,
  AgentRoleSchema,
  FeatureStateSchema,
  nextRole,
  AGENT_MAP,
  ROLE_ORDER,
} from './schema';
import { readPipeline, writePipeline, createInitialState } from './state';
import { checkHumanGate, checkAutoGate, type GateResult } from './gate';

export class Pipeline {
  private state: PipelineState;
  private statePath: string;

  constructor(statePath?: string) {
    this.statePath = statePath ?? '.prism-five/pipeline.json';
    try {
      this.state = readPipeline(this.statePath);
    } catch {
      this.state = createInitialState();
      writePipeline(this.state, this.statePath);
    }
  }

  getState(): PipelineState {
    return this.state;
  }

  createFeature(slug: string): Feature {
    if (this.state.features[slug]) {
      throw new Error(`feature "${slug}" already exists`);
    }
    const now = new Date().toISOString();
    const feature: Feature = {
      slug,
      status: 'draft' as FeatureState,
      currentRole: 'prototyper' as AgentRole,
      createdAt: now,
      updatedAt: now,
      stageHistory: [{ role: 'prototyper', enteredAt: now }],
      gates: {
        prototype_approved: false,
        build_reviewed: false,
        sweep_passed: false,
        release_approved: false,
      },
    };
    this.state.features[slug] = feature;
    this.state.activeFeature = slug;
    this.state.queue.push(slug);
    writePipeline(this.state, this.statePath);
    return feature;
  }

  getFeature(slug: string): Feature | undefined {
    return this.state.features[slug];
  }

  getActiveFeature(): Feature | undefined {
    if (!this.state.activeFeature) return undefined;
    return this.state.features[this.state.activeFeature];
  }

  continue(slug: string): { feature: Feature; nextRole: AgentRole | null; gate: GateResult } {
    const feature = this.state.features[slug];
    if (!feature) throw new Error(`feature "${slug}" not found`);

    const now = new Date().toISOString();

    // Check gates
    if (feature.currentRole === 'prototyper' && !feature.gates.prototype_approved) {
      return { feature, nextRole: null, gate: { passed: false, reason: 'human gate: prototype_approved required', requiresHuman: true } };
    }

    const autoGate = checkAutoGate(feature);
    if (!autoGate.passed) {
      return { feature, nextRole: null, gate: autoGate };
    }

    // Advance to next role
    const currentRole = feature.currentRole;
    const next = nextRole(currentRole);

    if (next) {
      // Complete current stage
      const currentStage = feature.stageHistory.find(s => s.role === currentRole && !s.completedAt);
      if (currentStage) currentStage.completedAt = now;

      // Start next stage
      feature.currentRole = next;
      feature.stageHistory.push({ role: next, enteredAt: now });
      feature.updatedAt = now;

      // Auto-transition status
      const statusMap: Record<AgentRole, FeatureState> = {
        prototyper: 'prototype_done',
        builder: 'building',
        sweeper: 'sweeping',
        grower: 'growing',
        maintainer: 'releasing',
      };
      feature.status = statusMap[next];
    } else {
      // Last role completed — feature is live
      feature.status = 'live' as FeatureState;
      feature.updatedAt = now;
    }

    writePipeline(this.state, this.statePath);
    return { feature, nextRole: next, gate: { passed: true, requiresHuman: false } };
  }

  status(): string {
    const f = this.getActiveFeature();
    if (!f) return 'No active feature';
    const agentDef = AGENT_MAP[f.currentRole];
    return `[${f.slug}] role=${f.currentRole}(${agentDef.paradigm}) status=${f.status} stage=${this.state.productStage}`;
  }

  approveGate(slug: string, gateName: 'prototype_approved' | 'release_approved'): Feature {
    const feature = this.state.features[slug];
    if (!feature) throw new Error(`feature "${slug}" not found`);
    feature.gates[gateName] = true;
    feature.updatedAt = new Date().toISOString();
    writePipeline(this.state, this.statePath);
    return feature;
  }

  promoteStage(newStage: string): PipelineState {
    const valid = ['exploring', 'building', 'growing', 'mature'];
    if (!valid.includes(newStage)) throw new Error(`invalid stage: ${newStage}`);
    this.state.productStage = newStage as PipelineState['productStage'];
    writePipeline(this.state, this.statePath);
    return this.state;
  }
}
