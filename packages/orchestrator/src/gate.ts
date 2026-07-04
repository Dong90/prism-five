import type { Feature, GateState } from './schema';

export interface GateResult {
  passed: boolean;
  reason?: string;
  requiresHuman: boolean;
}

export function checkHumanGate(feature: Feature, gateName: keyof GateState): GateResult {
  const gate = feature.gates[gateName];
  if (!gate) {
    return { passed: false, reason: `human gate "${gateName}" not approved`, requiresHuman: true };
  }
  return { passed: true, requiresHuman: false };
}

export function checkAutoGate(feature: Feature): GateResult {
  const checks: Array<{ name: string; passed: boolean }> = [
    { name: 'role valid', passed: feature.currentRole !== undefined },
  ];

  const failed = checks.filter(c => !c.passed);
  if (failed.length > 0) {
    return {
      passed: false,
      reason: `auto gate failed: ${failed.map(f => f.name).join(', ')}`,
      requiresHuman: false,
    };
  }
  return { passed: true, requiresHuman: false };
}

export function gateSummary(feature: Feature): string {
  const gates = feature.gates;
  const entries = Object.entries(gates) as Array<[keyof GateState, boolean]>;
  const total = entries.length;
  const passed = entries.filter(([, v]) => v).length;
  return `${passed}/${total} gates passed`;
}
