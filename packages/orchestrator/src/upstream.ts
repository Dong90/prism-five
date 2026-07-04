import type { Feature, AgentRole } from './schema';
import { ROLE_ORDER } from './schema';

export interface UpstreamResult { ok: boolean; missing: AgentRole[]; exempted: AgentRole[]; }

const REQUIREMENTS: Record<AgentRole, AgentRole[]> = {
  prototyper: [], builder: ['prototyper'], sweeper: ['builder'], grower: ['sweeper'], maintainer: ['grower'],
};

export function checkUpstream(feature: Feature, role: AgentRole): UpstreamResult {
  const required = REQUIREMENTS[role] ?? [];
  const missing: AgentRole[] = [];
  const exempted: AgentRole[] = [];
  for (const upstream of required) {
    const active = (feature.exemptions ?? []).find(e => e.stage === upstream && (!e.expiresAt || new Date(e.expiresAt) > new Date()));
    if (active) { exempted.push(upstream); continue; }
    if (!feature.stageHistory.find(s => s.role === upstream)?.completedAt) missing.push(upstream);
  }
  return { ok: missing.length === 0, missing, exempted };
}

export function getRoleIndex(role: AgentRole): number { return ROLE_ORDER.indexOf(role); }
