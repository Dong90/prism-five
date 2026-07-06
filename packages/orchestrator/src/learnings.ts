import fs from 'fs';
import path from 'path';
import { writeActivity } from './logger';

export interface LearningEntry {
  category: string;
  title: string;
  description: string;
  date: string;
}

const LEARNINGS_PATH = '.prism/LEARNINGS.md';

function learningsFilePath(): string {
  return path.join(process.cwd(), LEARNINGS_PATH);
}

function ensureDir(): void {
  const p = learningsFilePath();
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function addLearning(entry: LearningEntry): void {
  ensureDir();
  const line = `### [${entry.category}] ${entry.title}\n> ${entry.date}\n\n${entry.description}\n`;
  fs.appendFileSync(learningsFilePath(), line + '\n', 'utf-8');

  try {
    writeActivity({
      event: 'learning_added',
      slug: `learnings:${entry.title}`,
      timestamp: new Date().toISOString(),
      result: 'success',
      metadata: { category: entry.category },
    });
  } catch {
    // activity logging is best-effort
  }
}

export function listLearnings(filter?: { category?: string }): LearningEntry[] {
  const filePath = learningsFilePath();
  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, 'utf-8');
  return parseLearningsMarkdown(raw, filter?.category);
}

function parseLearningsMarkdown(raw: string, categoryFilter?: string): LearningEntry[] {
  const entries: LearningEntry[] = [];
  const blocks = raw.split('\n### ').slice(1);

  for (const block of blocks) {
    try {
      const lines = block.split('\n');
      const headerLine = lines[0];
      const headerMatch = headerLine.match(/^\[([^\]]+)\]\s*(.+)$/);
      if (!headerMatch) continue;

      const category = headerMatch[1];
      const title = headerMatch[2];

      if (categoryFilter && category !== categoryFilter) continue;

      const dateMatch = lines[1]?.match(/^>\s*(.+)$/);
      const date = dateMatch ? dateMatch[1] : '';

      const description = lines.slice(2).join('\n').trim();

      entries.push({ category, title, description, date });
    } catch {
      // skip malformed
    }
  }

  return entries;
}
