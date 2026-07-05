import fs from 'fs';
import path from 'path';
import { PipelineStateSchema, type PipelineState } from './schema';

const DEFAULT_PATH = path.resolve(process.cwd(), '.prism/pipeline.json');

export function readPipeline(filePath?: string): PipelineState {
  const p = filePath ?? DEFAULT_PATH;
  if (!fs.existsSync(p)) {
    throw new Error(`pipeline.json not found at ${p}. Run init to create.`);
  }
  const raw = fs.readFileSync(p, 'utf-8');
  const parsed = JSON.parse(raw);
  return PipelineStateSchema.parse(parsed);
}

export function writePipeline(state: PipelineState, filePath?: string): void {
  const p = filePath ?? DEFAULT_PATH;
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const validated = PipelineStateSchema.parse(state);
  validated.updated = new Date().toISOString();
  fs.writeFileSync(p, JSON.stringify(validated, null, 2), 'utf-8');
}

export function createInitialState(): PipelineState {
  const now = new Date().toISOString();
  return {
    version: '0.1.0',
    productStage: 'exploring',
    activeFeature: null,
    features: {},
    queue: [],
    updated: now,
  };
}
