# REQUIREMENT: Prism-Five 5 Agent Orchestrator MVP

## User Stories

| ID | As a… | I want… | So that… |
|----|--------|---------|----------|
| US-1 | Developer | state file tracking feature pipeline | I know which Agent works next |
| US-2 | Developer | 5 Agent SKILL.md with clear I/O contracts | each role has unambiguous scope |
| US-3 | Developer | Orchestrator reading state and dispatching | I don't manually switch roles |
| US-4 | Developer | Gate checks between Agents | quality enforced not optional |
| US-5 | Developer | shared constitution and learnings | Agents share conventions |

## Acceptance Criteria

### US-1: pipeline.json

- **Given** a feature is initialized
- **When** orchestrator reads `.prism-five/pipeline.json`
- **Then** it returns currentRole, status, gate states
- **Given** a feature advances role
- **When** orchestrator writes status
- **Then** next role becomes current

### US-2: Agent SKILL.md

- **Given** 5 Agent files in `.prism-five/agents/`
- **When** dispatched, each provides: constraints, Iron Law, tools, steps, Gate, self-check, fatal_constraints
- **When** comparing Agent tool allow lists
- **Then** deploy only in maintainer, write(code) only in builder

### US-3: Orchestrator

- **Given** currentRole=prototyper
- **When** invoked, loads correct Agent with feature context
- **Given** Gate blocked
- **Then** halts and reports missing artifacts

### US-4: Gates

- **Given** proto role done, human gate required
- **Then** halts until prototype_approved
- **Given** builder done, auto gate runs test/lint/typecheck
- **Then** passes only all green

### US-5: Shared

- **Given** CONSTITUTION.md loaded by any Agent
- **Then** principles, conventions, forbidden patterns applied
- **Given** bug fixed
- **Then** LEARNINGS.md gets timestamped root cause

## Traceability

| AC | CHANGE.md |
|----|-----------|
| US-1 | pipeline.json schema |
| US-2 | 5 Agent SKILL.md |
| US-3 | Orchestrator skill |
| US-4 | Gate matrix |
| US-5 | CONSTITUTION + LEARNINGS |

## Out of Scope

- CLI commands, actual execution by Agents, checkpoint, queue, parallelism, GStack/Superpowers/ECC integration

