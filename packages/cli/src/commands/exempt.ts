import { Command } from 'commander';
import { Pipeline } from '@prism-five/orchestrator';
import type { AgentRole } from '@prism-five/orchestrator';

export const exemptCommand = new Command('exempt')
  .description('Manage upstream stage exemptions for a feature')
  .argument('[action]', 'list | grant <role> | revoke <role>')
  .argument('[role]', 'Role to exempt (prototyper|builder|sweeper|grower|maintainer)')
  .option('-r, --reason <text>', 'Reason for exemption')
  .option('-d, --days <n>', 'Expiration in days', '30')
  .option('-a, --approver <name>', 'Who approved this exemption')
  .action((action, role, opts) => {
    const pipeline = new Pipeline();
    const feature = pipeline.getActiveFeature();
    if (!feature) {
      console.error('No active feature');
      process.exit(1);
    }

    if (!action || action === 'list') {
      listExemptions(feature);
      return;
    }

    if (action === 'grant' && role) {
      grantExemption(feature, role, opts);
      return;
    }

    if (action === 'revoke' && role) {
      revokeExemption(feature, role);
      return;
    }

    console.error(`Usage: prism exempt list | grant <role> --reason "..." | revoke <role>`);
    process.exit(1);
  });

function listExemptions(feature: any) {
  const exemptions = feature.exemptions ?? [];
  if (exemptions.length === 0) {
    console.log('No active exemptions.');
    return;
  }
  console.log(`Exemptions for ${feature.slug}:`);
  for (const e of exemptions) {
    const now = new Date();
    const expired = e.expiresAt && new Date(e.expiresAt) < now;
    console.log(
      `  ${e.stage}  reason: ${e.reason}  ${expired ? '(EXPIRED)' : ''}  expires: ${e.expiresAt ?? 'never'}`,
    );
  }
}

function grantExemption(feature: any, role: string, opts: any) {
  const valid = ['prototyper', 'builder', 'sweeper', 'grower', 'maintainer'];
  if (!valid.includes(role)) {
    console.error(`Invalid role: ${role}. Valid: ${valid.join(', ')}`);
    process.exit(1);
  }

  const exemptions = feature.exemptions ?? [];
  const expiresAt = opts.days
    ? new Date(Date.now() + parseInt(opts.days) * 86400_000).toISOString()
    : undefined;

  exemptions.push({
    stage: role as AgentRole,
    reason: opts.reason ?? '(no reason given)',
    createdAt: new Date().toISOString(),
    expiresAt,
    approver: opts.approver,
  });

  feature.exemptions = exemptions;
  const pipeline = new Pipeline();
  pipeline.getState().features[feature.slug] = feature;
  console.log(`Granted exemption for ${role} on ${feature.slug} (${opts.days}d)`);
}

function revokeExemption(feature: any, role: string) {
  feature.exemptions = (feature.exemptions ?? []).filter((e: any) => e.stage !== role);
  const pipeline = new Pipeline();
  pipeline.getState().features[feature.slug] = feature;
  console.log(`Revoked exemption for ${role} on ${feature.slug}`);
}
