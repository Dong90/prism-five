# REQUIREMENT: prism ci sync — agent skill 同步到多平台

## User Stories

| ID | As a… | I want… | So that… |
|----|--------|---------|----------|
| US-1 | Developer | syncSkills(opencode) copy agent skills | Prism agents are usable in OpenCode |

## Acceptance Criteria

### US-1

- **Given** `.prism/profiles/develop/` has 5 agent markdown files
- **When** `syncSkills('opencode')` is called
- **Then** 5 files are created in `.opencode/skills/prism-*.md` with `# Synced by Prism CI` header

## Traceability

| AC | Links to CHANGE.md |
|----|-------------------|
| US-1 | Success Criteria: ci.ts compiles and syncs |

## Out of Scope
CLI command registration (handled in separate CLI change). No network sync, local filesystem only.
