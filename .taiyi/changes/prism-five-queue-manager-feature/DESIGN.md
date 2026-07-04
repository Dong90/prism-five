# DESIGN: Queue Manager
## Options
| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | Priority queue in orchestrator | Simple, integrated | Serial only | Low |
| B | External task queue (Redis) | Scalable | Overkill for MVP | High |
## Decision
**Chosen:** Option A — Priority queue integrated in orchestrator/src/queue.ts.
**Reason:** Pipeline is serial. Queue just manages ordering + priority.
## Architecture
```
QueueManager
  → enqueue(slug, priority) → sorted by P0>P1>P2
  → dequeue() → returns next feature
  → auto-dequeue on Pipeline close
```
