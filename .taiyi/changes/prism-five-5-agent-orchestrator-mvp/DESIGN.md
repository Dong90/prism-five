# DESIGN: Prism-Five 5 Agent Orchestrator MVP

## Context

prism-five has 5 existing packages (incidence→refraction→dispersion→absorption→emission) forming a data pipeline. Now we add orchestration: 5 Agent definitions + state management + routing. Zero UI. Constraints: monorepo with workspaces, TypeScript strict, zero runtime deps.

## Options

| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | Agents as SKILL.md + orchestrator as TS package | Follows Taiyi/ECC pattern; AI-readable; clean separation | Two layers to maintain | Low |
| B | Agents as TypeScript classes | Type safety; code reuse | AI can't read runtime behavior; coupling | High |

## Decision

**Chosen:** Option A — Agents as SKILL.md markdown definitions + orchestrator as TS package.

**Reason:** AI Agents read SKILL.md at dispatch time (same pattern as TaiyiForge phase skills and ECC agent definitions). TypeScript orchestrator handles state machine, gates, and routing. Clean separation: "what to do" in .md, "how to coordinate" in .ts.

## Architecture

```
packages/orchestrator/
  src/
    index.ts      → Pipeline class (create, continue, status)
    state.ts      → pipeline.json read/write with Zod
    schema.ts     → Zod types: PipelineState, FeatureState, AgentRole
    gate.ts       → Gate checks: human gate, auto gate

.prism-five/
  pipeline.json   → engineTruth (currentRole, feature status, gates)
  shared/
    CONSTITUTION.md  → project principles, forbidden patterns
    LEARNINGS.md     → timestamped learnings
  agents/
    prototyper.md → 木 Agent (Explorer)
    builder.md    → 火 Agent (Operator)
    sweeper.md    → 土 Agent (Scout)
    grower.md     → 金 Agent (Analyst)
    maintainer.md → 水 Agent (Guardian)
  features/<slug>/ → runtime artifacts per feature
```

Each Agent SKILL.md contains: constraints, Iron Law, tool allow/deny, pre-flight gates, execution steps, output gate, quality self-check, fatal_constraints, escalation policy.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Agent SKILL.md too long for context | Each focuses only on its role; no shared context |
| State drift between pipeline.json and reality | engineTruth as single source; no inference from conversation |
| Zod schema incomplete for MVP | Start with essential fields; extend iteratively |

## Open Questions

- [ ] Checkpoint/resume mechanism — deferred to v0.2
- [ ] Queue priority scheduling — deferred to v0.2
