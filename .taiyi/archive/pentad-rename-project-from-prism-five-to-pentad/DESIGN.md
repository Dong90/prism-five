# DESIGN: Rename
## Options
| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | Automated bulk rename (mv + sed) | Fast, consistent | Sed errors possible | Low |
| B | Manual per-file rename | Precise | Slow, error-prone | High |
## Decision
**Chosen:** Option A — Automated bulk rename.
**Reason:** 5 packages × n files. Scripted rename is faster and more consistent. Manual rename would miss cross-references.
