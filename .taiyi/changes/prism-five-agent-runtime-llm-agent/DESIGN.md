# DESIGN: Agent Runtime
## Context
Prompt builder exists. Need runtime to bridge Agent context → LLM execution.

## Options
| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | AgentRuntime produces structured work items | LLM-agnostic, simple, no API key needed | No auto-execution | Low |
| B | Direct LLM API integration | Full automation | Needs API keys, vendor lock | High |

## Decision
**Chosen:** Option A — AgentRuntime produces structured work items.
**Reason:** MVP scope. CLI context doesn't have API keys. AgentRuntime builds step plans that any LLM host (like this conversation) can consume. Separates "what to do" from "how to call LLM".

## Architecture
```
AgentRuntime
  → load Agent (agent.ts)
  → build prompt (prompt.ts)
  → dispatch: for each Agent step → StepPlan work-item
  → collect results → persist to pipeline state
```
## Risk
None for MVP scope.
