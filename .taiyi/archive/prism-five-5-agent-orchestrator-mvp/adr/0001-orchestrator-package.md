# ADR-0001: Orchestrator as standalone npm package

## Status
Accepted

## Context
prism-five has 5 existing packages forming a data pipeline. Adding orchestration logic needs a home. Options: embed in existing package, or create new package.

## Decision
Create `packages/orchestrator/` as a new npm package.

## Rationale
1. Orchestrator depends on all 5 packages (bi-directional dependency if embedded)
2. Coordination layer is conceptually different from data transform
3. Isolated for future multi-feature concurrency
4. Follows monorepo pattern: one concern per package

## Consequences
- New package.json, tsconfig.json, src/ structure needed
- Must be added to root workspace config
- Zero runtime dependency principle maintained
