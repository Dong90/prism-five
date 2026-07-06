import type { PipelineState } from './schema';
import { Pipeline } from './pipeline';

export interface TokenCheckResult {
  passed: boolean;
  reason?: string;
  required?: number;
  used?: number;
  quota?: number;
}

export interface TokenUsage {
  total: number;
  byRole: Record<string, number>;
  quota: Record<string, number>;
}

export class TokenBudget {
  private pipeline: Pipeline;

  constructor(pipeline: Pipeline) {
    this.pipeline = pipeline;
  }

  /** Record token consumption for a specific role */
  track(slug: string, role: string, amount: number): void {
    const state = this.pipeline.getState();
    const feature = state.features[slug];
    if (!feature) return;

    const tb = state.tokenBudget;
    const key = `${slug}:${role}`;
    tb.used[key] = (tb.used[key] || 0) + amount;
    this.pipeline.persist();
  }

  /** Check if a role within a feature has exceeded its token budget */
  check(slug: string, role: string): TokenCheckResult {
    const state = this.pipeline.getState();
    const feature = state.features[slug];
    if (!feature) return { passed: true, reason: 'feature not found — skip check' };

    const tb = state.tokenBudget;
    const key = `${slug}:${role}`;
    const used = tb.used[key] || 0;
    const quota = (tb as Record<string, number>)[role] ?? 0;

    if (quota <= 0) return { passed: true }; // No quota set — skip

    if (used >= quota) {
      return {
        passed: false,
        reason: `token exceeded for role '${role}': used ${used} / ${quota} tokens`,
        used,
        quota,
      };
    }

    return { passed: true, used, quota };
  }

  /** Get per-feature token usage breakdown */
  usage(slug: string): TokenUsage {
    const state = this.pipeline.getState();
    const tb = state.tokenBudget;

    const byRole: Record<string, number> = {};
    let total = 0;
    const prefix = `${slug}:`;

    for (const [key, amount] of Object.entries(tb.used)) {
      if (key.startsWith(prefix)) {
        const role = key.slice(prefix.length);
        byRole[role] = amount;
        total += amount;
      }
    }

    const quota: Record<string, number> = {};
    for (const role of ['prototyper', 'builder', 'sweeper', 'grower', 'maintainer']) {
      quota[role] = (tb as Record<string, number>)[role] ?? 0;
    }

    return { total, byRole, quota };
  }

  /** Administratively increase quota for a role */
  bump(slug: string, role: string, amount: number): void {
    const state = this.pipeline.getState();
    const key = `${slug}:${role}`;
    state.tokenBudget.used[key] = Math.max(0, (state.tokenBudget.used[key] || 0) - amount);
    this.pipeline.persist();
  }

  /** Heuristic token estimation: ~1 token per 4 characters */
  estimate(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
