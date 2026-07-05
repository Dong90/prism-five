# REQUIREMENT: CLI 补齐 7 命令

## User Stories
| ID | As a… | I want… | So that… |
|----|--------|---------|----------|
| US-1 | Dev | prism cancel `<slug>` | abort active feature |
| US-2 | Dev | prism list [--all] | see all features and their status |
| US-3 | Dev | prism doctor [--strict] | check workspace health |
| US-4 | Dev | prism guide `<slug>` | see agent guidance for next step |
| US-5 | Dev | prism check `<slug>` | run quick quality gate |
| US-6 | Dev | prism init [--profile] | bootstrap Prism workspace |

## Acceptance Criteria
- **Given** packages/cli with Commander.js
- **When** 7 commands registered in index.ts
- **Then** npm run build passes, prism --help lists all commands

## Out of Scope
No orchestrator changes. sync command deferred.
