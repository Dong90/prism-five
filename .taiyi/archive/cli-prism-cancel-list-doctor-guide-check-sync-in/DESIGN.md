# DESIGN: CLI 7 命令补齐

## Options
| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | One Commander.js file per command | Consistent with existing | 7 files | Low |
| B | Single file with all commands | One file | Breaks pattern | Low |

## Decision
**Chosen:** Option A — one file per command following existing approve.ts/new.ts pattern.
**Reason:** Maintains codebase consistency. Every existing command follows this pattern.

## Architecture
```
packages/cli/src/commands/ ← cancel.ts, list.ts, doctor.ts, guide.ts, init.ts
packages/cli/src/index.ts   ← program.addCommand() registration
```

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Command name conflicts | Each command uses unique name per Commander.js convention |
