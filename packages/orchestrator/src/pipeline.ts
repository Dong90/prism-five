import {
  type PipelineState,
  type Feature,
  type AgentRole,
  type FeatureState,
  nextRole,
  AGENT_MAP,
  DEFAULT_ARTIFACT_MANIFEST,
} from './schema';
import { readPipeline, writePipeline, createInitialState } from './state';
import { checkAutoGate, type GateResult } from './gate';
import { saveCheckpoint } from './checkpoint';
import { writeActivity } from './logger';

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
    this.statePath = statePath ?? '.prism/pipeline.json';
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

  persist(): void {
    writePipeline(this.state, this.statePath);
  }

  createFeature(slug: string, profile: string = 'develop', variant: string = 'full'): Feature {
    if (this.state.features[slug]) {
      throw new Error(`feature "${slug}" already exists`);
    }
    const now = new Date().toISOString();
    const feature: Feature = {
      slug,
      status: 'draft',
      currentRole: 'prototyper',
      profile: profile as Feature['profile'],
      variant: variant as Feature['variant'],
      createdAt: now,
      updatedAt: now,
      stageHistory: [{ role: 'prototyper', enteredAt: now }],
      gates: { prototype_approved: false, design_reviewed: false, sweep_passed: false, review_approved: false, release_approved: false },
      artifacts: {},
    };
    this.state.features[slug] = feature;
    this.state.activeFeature = slug;
    this.state.queue.push(slug);
    writePipeline(this.state, this.statePath);
    writeActivity({ event: 'feature_created', slug, role: 'prototyper', timestamp: now, result: 'success' });
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

    // Human gate: prototype_approved (prototyper → builder)
    if (feature.currentRole === 'prototyper' && !feature.gates.prototype_approved) {
      return { feature, nextRole: null, gate: { passed: false, reason: 'human gate: prototype_approved required', requiresHuman: true } };
    }

    // Human gate: design_reviewed (builder → sweeper)
    if (feature.currentRole === 'builder' && !feature.gates.design_reviewed) {
      return { feature, nextRole: null, gate: { passed: false, reason: 'human gate: design_reviewed required', requiresHuman: true } };
    }

    // Human gate: review_approved (grower → maintainer)
    if (feature.currentRole === 'grower' && !feature.gates.review_approved) {
      return { feature, nextRole: null, gate: { passed: false, reason: 'human gate: review_approved required', requiresHuman: true } };
    }

    // Human gate: release_approved (maintainer → live)
    if (feature.currentRole === 'maintainer' && !feature.gates.release_approved) {
      return { feature, nextRole: null, gate: { passed: false, reason: 'human gate: release_approved required', requiresHuman: true } };
    }

    // Auto gate
    const autoGate = checkAutoGate(feature);
    if (!autoGate.passed) {
      writeActivity({ event: 'gate_blocked', slug, role: feature.currentRole, timestamp: new Date().toISOString(), result: 'blocked', reason: autoGate.reason });
      return { feature, nextRole: null, gate: autoGate };
    }

    // Track artifacts on gate pass
    const expectedArtifacts = DEFAULT_ARTIFACT_MANIFEST[feature.currentRole];
    if (expectedArtifacts) {
      for (const artifact of expectedArtifacts) {
        if (!feature.artifacts[artifact]) feature.artifacts[artifact] = ['auto'];
      }
    }

    const currentRole = feature.currentRole;
    const next = nextRole(currentRole);

    if (next) {
      writeActivity({ event: 'role_advanced', slug, role: next, timestamp: new Date().toISOString(), result: 'success' });
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
    saveCheckpoint(feature);
    return { feature, nextRole: next, gate: { passed: true, requiresHuman: false } };
  }

  status(): string {
    const f = this.getActiveFeature();
    if (!f) return 'No active feature';
    const agentDef = AGENT_MAP[f.currentRole];
    return `[${f.slug}] role=${f.currentRole}(${agentDef.paradigm}) status=${f.status} stage=${this.state.productStage}`;
  }

  approveGate(slug: string, gateName: keyof Feature['gates']): Feature {
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
