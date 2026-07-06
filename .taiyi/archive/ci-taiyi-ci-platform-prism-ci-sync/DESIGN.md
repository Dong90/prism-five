# DESIGN: prism ci sync — agent skill 多平台同步

## Context
Prism agent skills stored in `.prism/profiles/develop/` need to be copied to platform-specific skill directories.

## Options

| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | syncSkills(platform) with hardcoded dest paths | Simple, zero deps | Manual path maintenance | Low |
| B | Plugin-based registry with adapters | Extensible | Overengineered for current scope | High |

## Decision

**Chosen:** Option A — single `syncSkills(platform, profileDir?)` function.

**Reason:** Current scope only needs 4 platforms, no extensibility required.

## Architecture

```text
syncSkills(platform) → reads .prism/profiles/develop/*.md → writes <platform>/skills/prism-*.md
```

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Dest dir missing | Auto-create with fs.mkdirSync recursive |

## Open Questions

- [x] None
