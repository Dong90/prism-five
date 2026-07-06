# REQUIREMENT: Rename to Pentad
## User Stories
| ID | As a | I want | So that |
|----|------|--------|---------|
| US-1 | Developer | @pentad/prototyper | package name reflects role |
| US-2 | Developer | .pentad/ config dir | consistent naming |
## Acceptance Criteria
### US-1
- **Given** renamed packages
- **When** npm run build executes
- **Then** all packages compile with new names
### US-2
- **Given** .pentad/ exists
- **When** CLI runs
- **Then** reads config from .pentad/pipeline.json
## Traceability: CHANGE.md
