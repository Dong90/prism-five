# REQUIREMENT: 交付链 3 命令

## User Stories
| ID | As a… | I want… | So that… |
|----|--------|---------|----------|
| US-1 | Dev | prism commit `<slug>` -m 'msg' | git commit with Prism-Change trailer |
| US-2 | Dev | prism ship `<slug>` | git push changes |
| US-3 | Dev | prism land `<slug>` | mark feature complete |

## Acceptance Criteria
- **Given** feature exists in pipeline
- **When** prism commit `<slug>` -m 'feat: x' runs
- **Then** git commit has `Prism-Change: <slug>` trailer
- **Given** commits are staged
- **When** prism ship `<slug>` runs
- **Then** git push executes

## Out of Scope
No orchestrator changes. No PR creation.
