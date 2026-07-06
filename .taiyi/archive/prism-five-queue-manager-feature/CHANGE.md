# CHANGE: Queue Manager
## Motivation
Pipeline supports single feature only. Need queue for multiple features with priority.
## Scope
In: Queue with P0/P1/P2 priority, npx prism queue, auto-dequeue, npx prism next
Out: Concurrency (still serial single-feature)
## Success Criteria
- [ ] npx prism queue shows all queued features
- [ ] npx prism queue add <slug> --priority P1 adds to queue
- [ ] npx prism next activates next feature from queue
- [ ] Auto-dequeue on feature close
