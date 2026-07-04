# ADR: Orchestrator Package Architecture

## Decision: Standalone package
1. Depends on all 5 prism packages
2. Coordination layer, not data transform
3. Isolated for future concurrency

## Agents as SKILL.md
1. AI reads at runtime (Taiyi/ECC pattern)
2. Pipeline logic in TypeScript
3. What(SKILL.md) vs How(TS) separation

## State: pipeline.json
1. Single JSON, no DB for MVP
2. Read at dispatch, write after completion
3. Zod validation
