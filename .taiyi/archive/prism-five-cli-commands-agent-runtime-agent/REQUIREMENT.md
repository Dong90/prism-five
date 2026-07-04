# REQUIREMENT: CLI + Agent Runtime

## User Stories
| ID | As a | I want | So that |
|----|------|--------|---------|
| US-1 | Developer | npx prism status | see pipeline state |
| US-2 | Developer | npx prism new slug | create features |
| US-3 | Developer | npx prism continue | advance roles |
| US-4 | Developer | npx prism approve gate | pass human gates |
| US-5 | Developer | Agent runtime | execute Agent from SKILL.md |

## Acceptance Criteria

### US-1: npx prism status
- **Given** pipeline.json exists with active feature
- **When** developer runs npx prism status
- **Then** output shows currentRole, activeFeature, gate states

### US-2: npx prism new
- **Given** pipeline.json exists, no active feature
- **When** developer runs npx prism new user-auth
- **Then** feature created with status=draft, role=prototyper

### US-3: npx prism continue
- **Given** feature at builder role, gates passed
- **When** developer runs npx prism continue
- **Then** advances to sweeper role, status updated

### US-4: npx prism approve
- **Given** feature at prototyper role
- **When** developer runs npx prism approve prototype_approved
- **Then** gate prototype_approved is set to true

### US-5: Agent loader
- **Given** Agent SKILL.md file at .prism-five/agents/builder.md
- **When** agent loader reads and parses the file
- **Then** returns structured AgentDefinition with all sections

## Traceability
| AC | Links to CHANGE |
|----|----------------|
| US-1 | npx prism status |
| US-2 | npx prism new |
| US-3 | npx prism continue |
| US-4 | npx prism approve |
| US-5 | Agent loader |

## Out of Scope
LLM calls, auto agent loops, queue scheduling, checkpoint/resume
