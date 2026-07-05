import fs from 'fs';
import path from 'path';

export type Platform = 'opencode' | 'claude' | 'codex' | 'cursor';

export function syncSkills(platform: Platform, profileDir = '.prism/profiles/develop'): string[] {
  const absDir = path.resolve(process.cwd(), profileDir);
  if (!fs.existsSync(absDir)) return [];
  const files = fs.readdirSync(absDir).filter(f => f.endsWith('.md'));
  const synced: string[] = [];
  for (const file of files) {
    const name = file.replace('.md', '');
    const destMap: Record<Platform, string> = {
      opencode: path.join(process.cwd(), '.opencode/skills', `prism-${name}.md`),
      claude: path.join(process.cwd(), '.claude/skills', `prism-${name}.md`),
      codex: path.join(process.cwd(), '.codex/skills', `prism-${name}.md`),
      cursor: path.join(process.cwd(), '.cursor/skills', `prism-${name}.md`),
    };
    const dest = destMap[platform];
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(dest, `# Synced by Prism CI\n${fs.readFileSync(path.join(absDir, file), 'utf-8')}`, 'utf-8');
    synced.push(name);
  }
  return synced;
}
