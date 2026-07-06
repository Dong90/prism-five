import fs from 'fs';
import path from 'path';
import type { Feature } from './schema';

export interface Context {
  slug: string;
  currentRole: string;
  status: string;
  artifacts: Record<string, string[]>;
  blockers: string[];
  nextAction: string;
  updatedAt: string;
}

const FEATURES_DIR = '.prism/features';

function contextPath(slug: string): string {
  return path.join(process.cwd(), FEATURES_DIR, slug, 'CONTEXT.md');
}

export function saveContext(feature: Feature): Context {
  const ctx: Context = {
    slug: feature.slug,
    currentRole: feature.currentRole,
    status: feature.status,
    artifacts: { ...feature.artifacts },
    blockers: [],
    nextAction: nextActionHint(feature.currentRole),
    updatedAt: new Date().toISOString(),
  };

  const filePath = contextPath(feature.slug);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const artifactLines = Object.keys(ctx.artifacts).length > 0
    ? Object.entries(ctx.artifacts).map(([k, v]) => `- ${k}: ${v.join(', ')}`)
    : ['(none)'];

  const md = [
    `# CONTEXT: ${ctx.slug}`,
    '',
    `> Last updated: ${ctx.updatedAt}`,
    '',
    '## Current Role',
    '',
    `${ctx.currentRole} (${ctx.status})`,
    '',
    '## Artifacts',
    '',
    ...artifactLines,
    '',
    '## Blockers',
    '',
    ...(ctx.blockers.length > 0 ? ctx.blockers.map(b => `- ${b}`) : ['(none)']),
    '',
    '## Next Action',
    '',
    ctx.nextAction,
    '',
  ].join('\n');

  fs.writeFileSync(filePath, md, 'utf-8');
  return ctx;
}

export function loadContext(slug: string): Context | null {
  const filePath = contextPath(slug);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const sections = parseMarkdownSections(raw);

    const artifacts: Record<string, string[]> = {};
    const artSection = sections['artifacts'] ?? '(none)';
    if (artSection.trim() !== '(none)') {
      for (const line of artSection.split('\n')) {
        const match = line.match(/^-\s+(.+?):\s*(.+)$/);
        if (match) artifacts[match[1]] = match[2].split(',').map(s => s.trim());
      }
    }

    const blockersSection = sections['blockers'] ?? '(none)';
    const blockers = blockersSection.trim() !== '(none)'
      ? blockersSection.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2))
      : [];

    return {
      slug,
      currentRole: (sections['current role'] ?? 'unknown').split('\n')[0].trim(),
      status: (sections['current role'] ?? '').split('\n')[1]?.replace(/[()]/g, '').trim() ?? 'unknown',
      artifacts,
      blockers,
      nextAction: (sections['next action'] ?? '').trim(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      slug,
      currentRole: '(parse error)',
      status: '(parse error)',
      artifacts: {},
      blockers: [],
      nextAction: '(parse error)',
      updatedAt: new Date().toISOString(),
    };
  }
}

function parseMarkdownSections(md: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = md.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
      }
      currentSection = line.slice(3).trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  if (currentSection) {
    sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
  }

  return sections;
}

function nextActionHint(role: string): string {
  switch (role) {
    case 'prototyper':
      return 'Write raw/PRD.md and prototype the feature concept. Request prototype_approved gate when ready.';
    case 'builder':
      return 'Implement the solution. Request design_reviewed gate when ready.';
    case 'sweeper':
      return 'Review code quality and sweep for issues. Auto-gate sweep_passed on completion.';
    case 'grower':
      return 'Grow and refine the solution. Request review_approved gate when ready.';
    case 'maintainer':
      return 'Prepare release. Request release_approved gate when ready.';
    default:
      return 'Continue with the next step.';
  }
}
