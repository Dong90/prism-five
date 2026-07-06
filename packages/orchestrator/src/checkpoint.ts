import fs from 'fs';
import path from 'path';
import type { Feature, AgentRole, GateState } from './schema';

export interface Checkpoint {
  slug: string;
  currentRole: AgentRole;
  status: string;
  gates: GateState;
  stageHistory: Feature['stageHistory'];
  artifacts: Record<string, string[]>;
  savedAt: string;
  context?: string;
}

const CHECKPOINT_DIR = '.prism/features';

function checkpointPath(slug: string): string {
  return path.join(process.cwd(), CHECKPOINT_DIR, slug, 'checkpoint.json');
}

export function saveCheckpoint(feature: Feature, context?: string): Checkpoint {
  const cp: Checkpoint = {
    slug: feature.slug,
    currentRole: feature.currentRole,
    status: feature.status,
    gates: { ...feature.gates },
    stageHistory: [...feature.stageHistory],
    artifacts: { ...feature.artifacts },
    savedAt: new Date().toISOString(),
    context,
  };

  const filePath = checkpointPath(feature.slug);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(cp, null, 2), 'utf-8');

  return cp;
}

export function loadCheckpoint(slug: string): Checkpoint | null {
  const filePath = checkpointPath(slug);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(raw) as Checkpoint;
  } catch {
    return null;
  }
}

export function deleteCheckpoint(slug: string): void {
  const filePath = checkpointPath(slug);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
