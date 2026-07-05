# DESIGN: 交付链 3 命令

## Options
| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | Commander.js + spawnSync for git ops | Simple, no new deps, existing pattern | Direct git calls | Low |
| B | Git library (simple-git) | More robust API | New dependency | Low |

## Decision
**Chosen:** Option A — Commander.js + child_process.spawnSync.
**Reason:** Follows existing CLI pattern, zero new dependencies.

## Architecture
```
commit.ts → spawnSync git add/commit with trailer
ship.ts   → spawnSync git push
land.ts   → pipeline mark complete
```

## Risks
| Risk | Mitigation |
|------|------------|
| git add -A too broad | Document, add --files flag in future |
