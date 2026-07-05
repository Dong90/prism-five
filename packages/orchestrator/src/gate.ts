import fs from 'fs';
import path from 'path';
import type { Feature, GateState } from './schema';
import { DEFAULT_ARTIFACT_MANIFEST } from './schema';

export interface GateResult {
  passed: boolean;
  reason?: string;
  requiresHuman: boolean;
}

export function checkHumanGate(feature: Feature, gateName: keyof GateState): GateResult {
  const gate = feature.gates[gateName];
  if (!gate) return { passed: false, reason: `human gate "${gateName}" not approved`, requiresHuman: true };
  return { passed: true, requiresHuman: false };
}

export function checkAutoGate(feature: Feature): GateResult {
  const checks: Array<{ name: string; passed: boolean }> = [];

  if (!feature.currentRole) checks.push({ name: 'role valid', passed: false });

  const expectedArtifacts = DEFAULT_ARTIFACT_MANIFEST[feature.currentRole];
  if (expectedArtifacts) {
    const baseDir = path.join(process.cwd(), '.prism/features', feature.slug);
    for (const artifact of expectedArtifacts) {
      checks.push({ name: `artifact: ${artifact}`, passed: feature.artifacts[artifact] !== undefined || fs.existsSync(path.join(baseDir, artifact)) });
    }
  }

  const failed = checks.filter(c => !c.passed);
  if (failed.length > 0) return { passed: false, reason: `auto gate failed: ${failed.map(f => f.name).join(', ')}`, requiresHuman: false };
  return { passed: true, requiresHuman: false };
}

export function gateSummary(feature: Feature): string {
  const entries = Object.entries(feature.gates) as Array<[keyof GateState, boolean]>;
  return `${entries.filter(([, v]) => v).length}/${entries.length} gates passed`;
}
