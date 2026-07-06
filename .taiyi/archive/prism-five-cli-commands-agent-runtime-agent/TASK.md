# TASK: CLI + Agent Runtime

## Slices
| # | Slice | Deps | Files |
|---|-------|------|-------|
| S01 | CLI package init | — | packages/cli/package.json, tsconfig.json, src/index.ts |
| S02 | Agent loader | — | packages/orchestrator/src/agent.ts |
| S03 | Prompt builder | S02 | packages/orchestrator/src/prompt.ts |
| S04 | status + new commands | S01 | packages/cli/src/commands/status.ts, new.ts |
| S05 | continue + approve + check + promote | S01 | packages/cli/src/commands/ |
| S06 | Build verify | S03, S05 | npm run build |

## Checklist per slice

### S01: CLI package init
- [ ] RED: npx prism fails (no CLI)
- [ ] Write packages/cli/package.json with commander dependency + bin entry
- [ ] Write packages/cli/tsconfig.json
- [ ] Write packages/cli/src/index.ts with Commander program
- [ ] GREEN: npx prism --help shows commands
- [ ] Done: `tsc -b packages/cli` exit 0

### S02: Agent loader
- [ ] RED: import { loadAgent } fails
- [ ] Write orchestrator/src/agent.ts: parse SKILL.md → AgentContext
- [ ] GREEN: typecheck passes
- [ ] Done: load builder Agent, verify sections extracted

### S03: Prompt builder
- [ ] RED: import { buildPrompt } fails
- [ ] Write orchestrator/src/prompt.ts: merge state + Agent → LLM prompt string
- [ ] GREEN: typecheck passes
- [ ] Done: build prompt for builder agent, verify content

### S04: status + new commands
- [ ] Write cli/src/commands/status.ts
- [ ] Write cli/src/commands/new.ts
- [ ] GREEN: npx prism status shows state
- [ ] GREEN: npx prism new test creates feature

### S05: continue + approve + check + promote
- [ ] Write cli/src/commands/continue.ts
- [ ] Write cli/src/commands/approve.ts
- [ ] Write cli/src/commands/check.ts
- [ ] Write cli/src/commands/promote.ts
- [ ] GREEN: all commands run without error

### S06: Build verify
- [ ] RED: npm run build fails before references
- [ ] Update root tsconfig.json
- [ ] GREEN: npm run build exit 0
- [ ] Done: full monorepo compiles
