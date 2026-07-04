import { Command } from 'commander';
import { Pipeline } from '@prism-five/orchestrator';
import type { AgentRole } from '@prism-five/orchestrator';

export const exemptCommand = new Command('exempt')
  .description('Manage upstream stage exemptions')
  .argument('[action]', 'list | grant <role> | revoke <role>')
  .argument('[role]', 'Role to exempt')
  .option('-r, --reason <text>', 'Reason')
  .option('-d, --days <n>', 'Expiration days', '30')
  .action((action, role, opts) => {
    const p = new Pipeline();
    const f = p.getActiveFeature();
    if (!f) { console.error('No active feature'); process.exit(1); }

    if (!action || action === 'list') {
      const ex = f.exemptions ?? [];
      if (ex.length === 0) { console.log('No active exemptions.'); return; }
      ex.forEach(e => console.log(`  ${e.stage}  ${e.reason}  ${e.expiresAt ?? 'never'}`));
      return;
    }
    if (action === 'grant' && role) {
      if (!['prototyper','builder','sweeper','grower','maintainer'].includes(role)) { process.exit(1); }
      f.exemptions = [...(f.exemptions ?? []), {
        stage: role as AgentRole, reason: opts.reason ?? '(none)',
        createdAt: new Date().toISOString(),
        expiresAt: opts.days ? new Date(Date.now() + parseInt(opts.days) * 86400000).toISOString() : undefined,
        approver: opts.approver,
      }];
      p.getState().features[f.slug] = f;
      console.log(`Granted exemption for ${role} (${opts.days}d)`);
      return;
    }
    if (action === 'revoke' && role) {
      f.exemptions = (f.exemptions ?? []).filter(e => e.stage !== role);
      p.getState().features[f.slug] = f;
      console.log(`Revoked exemption for ${role}`);
      return;
    }
    process.exit(1);
  });
