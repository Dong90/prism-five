import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const AGENTS_DIR = path.resolve(__dirname, '../../../../../.pentad/agents');
const REQUIRED_FILES = [
  'prototyper.md',
  'builder.md',
  'sweeper.md',
  'grower.md',
  'maintainer.md',
] as const;

describe('SKILL.md frontmatter (OpenCode compatibility)', () => {
  for (const file of REQUIRED_FILES) {
    describe(`${file}`, () => {
      const filePath = path.join(AGENTS_DIR, file);
      const exists = existsSync(filePath);
      const content = exists ? readFileSync(filePath, 'utf8') : '';
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const fm = fmMatch ? fmMatch[1]! : '';

      it('exists', () => {
        expect(exists, `${file} should exist at ${filePath}`).toBe(true);
      });
      it('has frontmatter block', () => {
        expect(fmMatch, `${file} missing frontmatter`).not.toBeNull();
      });
      it('has name field', () => {
        expect(/^name:/m.test(fm), `${file} missing name`).toBe(true);
      });
      it('has paradigm field', () => {
        expect(/^paradigm:/m.test(fm), `${file} missing paradigm`).toBe(true);
      });
      it('has role field', () => {
        expect(/^role:/m.test(fm), `${file} missing role`).toBe(true);
      });
      it('has description field', () => {
        expect(/^description:/m.test(fm), `${file} missing description`).toBe(true);
      });
      it('has mode field (OpenCode compat)', () => {
        expect(/^mode:/m.test(fm), `${file} missing mode`).toBe(true);
      });
    });
  }
});
