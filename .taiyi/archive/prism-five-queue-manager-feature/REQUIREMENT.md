# REQUIREMENT: Queue Manager
## User Stories
| ID | As a | I want | So that |
|----|------|--------|---------|
| US-1 | Developer | npx prism queue | see pending features |
| US-2 | Developer | npx prism queue add | enqueue with priority |
| US-3 | Developer | npx prism next | activate next in queue |
## Acceptance Criteria
### US-1
- **Given** 3 features queued
- **When** developer runs npx prism queue
- **Then** shows all 3 with priority and order
### US-2
- **Given** no queued features
- **When** developer runs npx prism queue add payment --priority P1
- **Then** payment added to queue with P1 priority
### US-3
- **Given** current feature is closed
- **When** developer runs npx prism next
- **Then** next P0 feature activated, if none then highest P1
## Out of Scope
Parallel execution

## Traceability
| AC | CHANGE |
|----|--------|
| US-1 | npx prism queue |
| US-2 | npx prism queue add |
| US-3 | npx prism next |
