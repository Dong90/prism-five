import fs from 'fs';
import type { AgentRole } from './schema';
import { AGENT_MAP, type AgentDefinition } from './schema';

export interface AgentSection {
  title: string;
  content: string;
}

export interface AgentContext {
  definition: AgentDefinition;
  constraints: string[];
  ironLaw: string;
  tools: { allow: string[]; deny: string[] };
  preflight: string[];
  steps: AgentSection[];
  gates: string[];
  qualityCheck: string[];
  fatalConstraints: string[];
  escalation: string[];
  rawContent: string;
}

function parseFrontmatter(content: string): { name: string; paradigm: string; role: string } {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const fm: Record<string, string> = {};
  if (fmMatch && fmMatch[1]) {
    for (const line of fmMatch[1].split('\n')) {
      const m = line.match(/^(\w+):\s*(.+)/);
      if (m) fm[m[1]!] = m[2]!.trim();
    }
  }
  return { name: fm.name ?? '', paradigm: fm.paradigm ?? '', role: fm.role ?? '' };
}

function extractSection(content: string, heading: string): string {
  const re = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  const m = content.match(re);
  return m ? m[1]!.trim() : '';
}

function extractList(section: string): string[] {
  return section
    .split('\n')
    .filter(l => l.match(/^[-*]\s+/))
    .map(l => l.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}

function extractTable(section: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const lines = section.split('\n');
  let headers: string[] = [];
  for (const line of lines) {
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length === 0) continue;
    if (cells[0]!.match(/^-+$/)) continue;
    if (headers.length === 0) {
      headers = cells;
    } else {
      const row: Record<string, string> = {};
      cells.forEach((c, i) => { if (headers[i]) row[headers[i]!] = c; });
      rows.push(row);
    }
  }
  return rows;
}

export function loadAgent(role: AgentRole): AgentContext {
  const def = AGENT_MAP[role];
  if (!def) throw new Error(`no agent definition for role: ${role}`);

  const skillPath = def.skillPath;
  if (!fs.existsSync(skillPath)) {
    throw new Error(`agent SKILL.md not found: ${skillPath}`);
  }

  const content = fs.readFileSync(skillPath, 'utf-8');
  const fm = parseFrontmatter(content);

  // Extract constraints section (supports <constraints> tag and ## Constraints heading)
  let constraintsSec = content.match(/<constraints>\n([\s\S]*?)\n<\/constraints>/);
  if (!constraintsSec) constraintsSec = content.match(/## Constraints\n([\s\S]*?)(?=\n## |\n<|$)/);
  const constraints = (constraintsSec && constraintsSec[1])
    ? constraintsSec[1].split("\n").filter((l: string) => l.trim().length > 0).map((l: string) => l.trim())
    : [];

  // Extract Iron Law
  // Extract Iron Law (handles code block)
  let ironLaw = "";
  const ironLawMatch = content.match(/## Iron Law\n+```\n?([\s\S]*?)\n?```/);
  if (ironLawMatch && ironLawMatch[1]) {
    ironLaw = ironLawMatch[1].trim();
  } else {
    const alt = extractSection(content, "Iron Law");
    if (alt) ironLaw = alt.replace(/```[\s\S]*?```/g, "").trim();
  }

  // Extract Tools
  const toolsSec = extractSection(content, 'Tools');
  const allowLine = toolsSec.match(/allow:\s*(.+)/i);
  const denyLine = toolsSec.match(/deny:\s*(.+)/i);
  const tools = {
    allow: allowLine ? allowLine[1]!.split(',').map(s => s.trim()) : [],
    deny: denyLine ? denyLine[1]!.split(',').map(s => s.trim()) : [],
  };

  // Extract Pre-flight
  const preflightSec = extractSection(content, 'Pre-flight');
  const preflight = extractList(preflightSec);

  // Extract Steps
  const stepsSec = extractSection(content, 'Steps');
  const stepLines = stepsSec.split('\n');
  const steps: AgentSection[] = [];
  let currentTitle = '';
  let currentContent: string[] = [];
  for (const line of stepLines) {
    const numMatch = line.match(/^\d+\.\s+\/.+?:\s*(.+)/);
    if (numMatch) {
      if (currentTitle) steps.push({ title: currentTitle, content: currentContent.join('\n') });
      currentTitle = numMatch[1]!;
      currentContent = [];
    } else if (currentTitle && line.trim()) {
      currentContent.push(line.trim());
    }
  }
  if (currentTitle) steps.push({ title: currentTitle, content: currentContent.join('\n') });

  // Extract Gate
  const gateSec = extractSection(content, 'Gate');
  const gates = gateSec ? gateSec.trim().split('\n').filter(Boolean) : [];

  // Extract Quality self-check
  const qualitySec = extractSection(content, 'Quality self-check');
  const qualityCheck = extractList(qualitySec);

  // Extract Fatal constraints
  // Extract fatal constraints (supports <fatal_constraints> tag and heading)
  let fatalSec = content.match(/<fatal_constraints>\n([\s\S]*?)\n<\/fatal_constraints>/);
  if (!fatalSec) fatalSec = content.match(/## Fatal Constraints\n([\s\S]*?)(?=\n## |\n<|$)/);
  const fatalConstraints = (fatalSec && fatalSec[1]) ? fatalSec[1].split("\n").filter((l: string) => l.match(/^NEVER/)) : [];

  // Extract Escalation
  const escalationSec = extractSection(content, 'Escalation');
  const escalation = escalationSec
    ? escalationSec.split('\n').filter(l => l.match(/^\|/)).slice(2)
    : [];

  return {
    definition: def,
    constraints,
    ironLaw,
    tools,
    preflight,
    steps,
    gates,
    qualityCheck,
    fatalConstraints,
    escalation,
    rawContent: content,
  };
}

export function agentSummary(ctx: AgentContext): string {
  const lines = [
    `Agent: ${ctx.definition.name} (${ctx.definition.paradigm})`,
    `Role: ${ctx.definition.role}`,
    `\n## Iron Law`,
    ctx.ironLaw,
    `\n## Constraints (${ctx.constraints.length})`,
    ...ctx.constraints.map(c => `- ${c}`),
    `\n## Tools`,
    `Allow: ${ctx.tools.allow.join(', ')}`,
    `Deny: ${ctx.tools.deny.join(', ')}`,
    `\n## Steps (${ctx.steps.length})`,
    ...ctx.steps.map(s => `- ${s.title}`),
    `\n## Gates`,
    ...ctx.gates,
    `\n## Fatal Constraints (${ctx.fatalConstraints.length})`,
    ...ctx.fatalConstraints,
  ];
  return lines.join('\n');
}
