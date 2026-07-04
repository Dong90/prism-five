import type { Feature, AgentRole } from './schema';
import { ROLE_ORDER } from './schema';

export interface UpstreamResult {
  ok: boolean;
  missing: AgentRole[];
  exempted: AgentRole[];
}

const UPSTREAM_REQUIREMENTS: Record<AgentRole, AgentRole[]> = {
  prototyper: [],
  builder: ['prototyper'],
  sweeper: ['builder'],
  grower: ['sweeper'],
  maintainer: ['grower'],
};

export function checkUpstreamForRole(feature: Feature, role: AgentRole): UpstreamResult {
  const required = UPSTREAM_REQUIREMENTS[role] ?? [];
  const missing: AgentRole[] = [];
  const exempted: AgentRole[] = [];

  for (const upstream of required) {
    const exemptions = feature.exemptions ?? [];
    const activeExempt = exemptions.find(
      (e) => e.stage === upstream && (!e.expiresAt || new Date(e.expiresAt) > new Date()),
    );

    if (activeExempt) {
      exempted.push(upstream);
      continue;
    }

    const stage = feature.stageHistory.find((s) => s.role === upstream);
    if (!stage?.completedAt) {
      missing.push(upstream);
    }
  }

  return { ok: missing.length === 0, missing, exempted };
}

export function getRoleIndex(role: AgentRole): number {
  return ROLE_ORDER.indexOf(role);
}
