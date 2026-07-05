import fs from 'fs';
import path from 'path';

export type Platform = 'opencode' | 'claude' | 'codex' | 'cursor';

const DEST_MAP: Record<Platform, string> = {
  opencode: '.opencode/skills',
  claude: '.claude/skills',
  codex: '.codex/skills',
  cursor: '.cursor/skills',
};

export function syncSkills(platform: Platform, profileDir = '.prism/profiles/develop'): string[] {
  const absDir = path.resolve(process.cwd(), profileDir);
  if (!fs.existsSync(absDir)) return [];
  const files = fs.readdirSync(absDir).filter(f => f.endsWith('.md'));
  const synced: string[] = [];
  const destBase = DEST_MAP[platform];

  for (const file of files) {
    const name = file.replace('.md', '');
    const destDir = path.join(process.cwd(), destBase);
    const dest = path.join(destDir, `prism-${name}.md`);

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    try {
      const content = fs.readFileSync(path.join(absDir, file), 'utf-8');
      fs.writeFileSync(dest, `# Synced by Prism CI\n${content}`, 'utf-8');
      synced.push(name);
    } catch {
      /* skip corrupted/unreadable source files */
    }
  }
  return synced;
}
