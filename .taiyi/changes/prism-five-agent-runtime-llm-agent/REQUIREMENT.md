# REQUIREMENT: Agent Runtime
## User Stories
| ID | As a | I want | So that |
|----|------|--------|---------|
| US-1 | Developer | npx prism run dispatches Agent | I can execute pipeline roles |
| US-2 | Developer | AgentRuntime produces step plans | LLM host can execute them |
| US-3 | Developer | execution results save to pipeline | state stays consistent |

## Acceptance Criteria
### US-1: npx prism run
- **Given** active feature at builder role with approved gate
- **When** developer runs npx prism run
- **Then** produces execution plan for all builder steps

### US-2: Step plan generation
- **Given** AgentContext for builder Agent with 6 steps
- **When** AgentRuntime.dispatch() is called
- **Then** returns 6 work items with step descriptions

### US-3: State persistence
- **Given** AgentRuntime completes step execution
- **When** results are collected
- **Then** pipeline.json updated with execution log

## Traceability
| AC | CHANGE |
|----|--------|
| US-1 | npx prism run |
| US-2 | AgentRuntime.dispatch() |
| US-3 | State persistence |
## Out of Scope
LLM API integration, auto-loops
