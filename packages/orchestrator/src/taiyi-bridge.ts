import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { PipelineState } from './schema';

interface TaiyiState {
  slug: string;
  currentPhase: string;
  completedPhases: string[];
  workflowStatus: string;
}

export function readTaiyiState(slug: string, workspaceDir?: string): TaiyiState | null {
  const root = workspaceDir ?? process.cwd();
  const p = path.join(root, '.taiyi/changes', slug, 'state.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8')) as TaiyiState;
}

export function mapTaiyiToPipeline(t: TaiyiState): Partial<PipelineState> {
  return {
    activeFeature: t.slug,
    features: {},
    queue: [],
    updated: new Date().toISOString(),
    version: '0.1.0',
    productStage: t.workflowStatus === 'active' ? 'building' : 'exploring',
  };
}

export function getCurrentPhase(slug: string, workspaceDir?: string): string | null {
  const state = readTaiyiState(slug, workspaceDir);
  return state?.currentPhase ?? null;
}
