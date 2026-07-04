import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const AUDIT_LOG_PATH = '.pentad/audit-log.json';

export interface AuditEntry {
  timestamp: string;
  slug: string;
  action: 'force-skip' | 'exempt-grant' | 'exempt-revoke' | 'exempt-expired';
  role?: string;
  reason: string;
  approver?: string;
}

export function readAuditLog(workspaceDir?: string): AuditEntry[] {
  const logPath = workspaceDir ? path.join(workspaceDir, AUDIT_LOG_PATH) : AUDIT_LOG_PATH;
  if (!existsSync(logPath)) return [];
  return JSON.parse(readFileSync(logPath, 'utf8'));
}

export function writeAuditLog(entry: AuditEntry, workspaceDir?: string): void {
  const logPath = workspaceDir ? path.join(workspaceDir, AUDIT_LOG_PATH) : AUDIT_LOG_PATH;
  const existing = readAuditLog(workspaceDir);
  existing.push(entry);
  writeFileSync(logPath, JSON.stringify(existing, null, 2));
}
