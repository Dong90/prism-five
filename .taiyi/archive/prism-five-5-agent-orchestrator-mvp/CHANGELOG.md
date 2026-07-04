# CHANGELOG: Prism-Five Orchestrator MVP

## [0.2.0] — 2026-07-04

### Added
- `packages/orchestrator/` — TypeScript pipeline engine with Pipeline class
- `PipelineState` Zod schema with 5 agent roles and 14 feature states
- `pipeline.json` state management with read/write/validation
- Human gate (`prototype_approved`, `release_approved`) and auto gate system
- 5-role advancement: prototyper → builder → sweeper → grower → maintainer
- 6 Agent SKILL.md definitions (orchestrator + 5 role agents)
- `.prism-five/shared/CONSTITUTION.md` — project principles
- `.prism-five/shared/LEARNINGS.md` — cross-agent knowledge base
- Agent tool allow/deny lists per role
- Gate escalation policy per agent

### Dependencies
- Added `zod` for schema validation
- Added `@types/node` for Node.js type support

### Build
- Root tsconfig.json updated with orchestrator reference
- Full monorepo build passes: `npm run build` exit 0

### Verification
- Pipeline create → approve → continue × 4 flows correctly
- Human gate blocks without prototype_approved
- Smoke test confirmed all 5 roles advance in sequence
