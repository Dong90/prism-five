# TASK: Prism-Five Orchestrator MVP

## Slices

| # | Slice | Deps | Files |
|---|-------|------|-------|
| S01 | orchestrator package init | — | package.json, tsconfig.json, src/index.ts |
| S02 | schema + state | S01 | src/schema.ts, src/state.ts |
| S03 | gate module | S02 | src/gate.ts |
| S04 | pipeline.json + shared | S01 | .prism-five/pipeline.json, shared/CONSTITUTION.md, shared/LEARNINGS.md |
| S05 | Agent SKILL.md × 6 | S04 | agents/prism-orchestrator.md, prototyper.md, builder.md, sweeper.md, grower.md, maintainer.md |
| S06 | build & verify | S03, S05 | root tsconfig.json update, npm run build |

## Checklist per slice

### S01: orchestrator package init
- [ ] RED: tsc --noEmit should fail (no package yet)
- [ ] Write packages/orchestrator/package.json
- [ ] Write packages/orchestrator/tsconfig.json
- [ ] Write packages/orchestrator/src/index.ts (empty Pipeline export)
- [ ] GREEN: tsc -p packages/orchestrator passes
- [ ] Done: `tsc -b packages/orchestrator` exit 0

### S02: schema + state
- [ ] RED: import { PipelineState } fails (not exported)
- [ ] Write src/schema.ts with Zod types: PipelineState, FeatureState, AgentRole, GateState
- [ ] Write src/state.ts with readPipeline(), writePipeline()
- [ ] GREEN: import and type-check passes
- [ ] Done: `tsc --noEmit` on orchestrator passes

### S03: gate module
- [ ] RED: import { Gate } fails
- [ ] Write src/gate.ts with checkHumanGate(), checkAutoGate()
- [ ] GREEN: type-check passes
- [ ] Done: `tsc -b packages/orchestrator` exit 0

### S04: pipeline.json + shared
- [ ] Write .prism-five/pipeline.json with initial schema
- [ ] Write .prism-five/shared/CONSTITUTION.md
- [ ] Write .prism-five/shared/LEARNINGS.md
- [ ] Done: files exist and have required sections

### S05: Agent SKILL.md × 6
- [ ] Write agents/prism-orchestrator.md (Navigator)
- [ ] Write agents/prototyper.md (Explorer)
- [ ] Write agents/builder.md (Operator)
- [ ] Write agents/sweeper.md (Scout)
- [ ] Write agents/grower.md (Analyst)
- [ ] Write agents/maintainer.md (Guardian)
- [ ] Verify each has: constraints, Iron Law, tools, pre-flight, steps, gate, self-check, fatal_constraints
- [ ] Done: all 6 files pass structure validation

### S06: build & verify
- [ ] Update root tsconfig.json references to include orchestrator
- [ ] RED: npm run build fails before fix
- [ ] GREEN: npm run build exit 0
- [ ] Done: `npm run build` passes for entire monorepo
