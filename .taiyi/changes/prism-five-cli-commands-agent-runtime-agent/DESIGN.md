# DESIGN: CLI + Agent Runtime

## Context
MVP has Pipeline class + 6 Agent SKILL.md. Need CLI surface + Agent execution engine.

## Options
| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | Commander.js CLI + orchestrator Agent loader | Lightweight, Node native | CLI only, no LLM integration | Low |
| B | Full LLM agent loop with tool calls | True AI agent execution | Heavy, needs model integration | High |

## Decision
**Chosen:** Option A — Commander.js CLI + Agent loader in orchestrator.
**Reason:** MVP scope. CLI provides human interface. Agent loader enables future LLM integration. Clean separation: CLI handles commands, Agent loader handles prompt construction.

## Architecture
```
packages/cli/
  src/
    index.ts     → Commander program entry
    commands/    → /prism:status /new /continue /check /approve /promote

packages/orchestrator/
  src/
    agent.ts     → read SKILL.md → extract sections → build AgentDefinition
    prompt.ts    → merge pipeline state + Agent SKILL.md → LLM-ready prompt
```

## Risks
None for MVP scope.
