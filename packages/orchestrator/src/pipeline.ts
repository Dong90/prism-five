import {
  type PipelineState,
  type Feature,
  type AgentRole,
  type FeatureState,
  nextRole,
  AGENT_MAP,
} from './schema';
import { readPipeline, writePipeline, createInitialState } from './state';
import { checkAutoGate, type GateResult } from './gate';

// Status transition map — role completed → status for next role
const STATUS_MAP: Record<AgentRole, FeatureState> = {
  prototyper: 'prototype_done',
  builder: 'building',
  sweeper: 'sweeping',
  grower: 'growing',
  maintainer: 'releasing',
};

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
      status: 'draft',
      currentRole: 'prototyper',
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

    // Human gate: prototype_approved
    if (feature.currentRole === 'prototyper' && !feature.gates.prototype_approved) {
      return { feature, nextRole: null, gate: { passed: false, reason: 'human gate: prototype_approved required', requiresHuman: true } };
    }

    // Human gate: release_approved (maintainer → live)
    if (feature.currentRole === 'maintainer' && !feature.gates.release_approved) {
      return { feature, nextRole: null, gate: { passed: false, reason: 'human gate: release_approved required', requiresHuman: true } };
    }

    // Auto gate
    const autoGate = checkAutoGate(feature);
    if (!autoGate.passed) {
      return { feature, nextRole: null, gate: autoGate };
    }

    const currentRole = feature.currentRole;
    const next = nextRole(currentRole);

    if (next) {
      const now = new Date().toISOString();
      const currentStage = feature.stageHistory.find(s => s.role === currentRole && !s.completedAt);
      if (currentStage) currentStage.completedAt = now;

      feature.currentRole = next;
      feature.stageHistory.push({ role: next, enteredAt: now });
      feature.updatedAt = now;
      feature.status = STATUS_MAP[next];
    } else {
      feature.status = 'live';
      const finishedAt = new Date().toISOString();
      feature.updatedAt = finishedAt;
      const lastStage = feature.stageHistory.find(s => s.role === currentRole && !s.completedAt);
      if (lastStage) lastStage.completedAt = finishedAt;
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
