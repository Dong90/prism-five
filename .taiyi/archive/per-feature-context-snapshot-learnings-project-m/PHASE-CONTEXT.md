# Change Graph: per-feature-context-snapshot-learnings-project-m

## Phases
### change (19 nodes)
**risk** (3) CONTEXT.md 与 checkpoint.json 数据可能不同步 / LEARNINGS.md 文件在并发写入时可能丢失数据 / project-memory.json 写入失败导致数据丢失
**acceptance_criterion** (8)
  - context.saveContext(feature) 在 .prism/features/<slug>/CON...
  - context.loadContext(slug) 返回结构化 Context 对象
  - learnings.add(entry) 追加到 .prism/LEARNINGS.md，learnings.li...
  - ... +5 more
**unknown** (8)
  - packages/orchestrator/src/context.ts (new)
  - packages/orchestrator/src/learnings.ts (new)
  - packages/orchestrator/src/memory.ts (new)
  - ... +5 more

### requirement (33 nodes)
**acceptance_criterion** (12)
  - context.saveContext(feature) 在 .prism/features/<slug>/CON...
  - context.saveContext() 在 artifact 为空时输出 '(none)' 而不是空白
  - context.loadContext(slug) 返回结构化 Context 对象
  - ... +9 more
**nfr** (5)
  - 无硬编码路径——所有路径基于 process.cwd() 或配置参数
  - 写入失败时保留已有数据不丢失（atomic write pattern）
  - context.saveContext() 耗时 < 50ms
  - ... +2 more
**unknown** (16)
  - saveContext(feature): 读取 feature 对象，生成 markdown 格式的 CONTE...
  - CONTEXT.md 包含 4 个章节: Current Role, Artifacts, Blockers, N...
  - loadContext(slug): 读取 CONTEXT.md 并解析为结构化的 Context 对象
  - ... +13 more

### design (1 nodes)
**design_decision** (1) A

### task (11 nodes)
**slice** (5)
  - context.ts — per-feature CONTEXT.md 生成与读取
  - learnings.ts — LEARNINGS.md 读写
  - memory.ts — project-memory.json 读写（含备份）
  - ... +2 more
**risk** (1) pipeline 集成可能破坏已有 continue() 行为
**rollback** (2) 删除 import 和 context 调用行 / 删除新增 export 语句
**unknown** (3) Wave 1 — 新模块 / Wave 2 — 集成 / Wave 3 — 导出 + 测试

### test (4 nodes)
**test_case** (4)
  - context.test.ts: saveContext/loadContext roundtrip + edge...
  - learnings.test.ts: add/list with category filter (4 tests)
  - memory.test.ts: CRUD + backup mechanism (5 tests)
  - ... +1 more

### review (7 nodes)
**unknown** (7)
  - CONTEXT.md parse error recovery returns unknown instead o...
  - functionality
  - architecture
  - ... +4 more

### integration (1 nodes)
**unknown** (1) (empty)

## Cross-Cutting Concerns
**4** SSOT violations: 0 high, 3 medium, 1 low
- [MEDIUM] risk (change vs requirement): risk 跨阶段不一致: "CONTEXT.md 与 checkpoint.json 数据可能不同步" ≠ "无硬编码路径——所有路径基于 process.cwd() 或配置参数"
- [MEDIUM] risk (change vs requirement): risk 跨阶段不一致: "LEARNINGS.md 文件在并发写入时可能丢失数据" ≠ "写入失败时保留已有数据不丢失（atomic write pattern）"
- [MEDIUM] risk (change vs requirement): risk 跨阶段不一致: "project-memory.json 写入失败导致数据丢失" ≠ "context.saveContext() 耗时 < 50ms"
- [LOW] design_decision (design vs task): design_decision 跨阶段不一致: "A" ≠ "context.ts — per-feature CONTEXT.md 生成与读取"

## Stats
- Total nodes: 76
- Total edges: 22
- Phases with nodes: 7/8


## review (✓)
**评审**:
- [x] **Approve** — 可合并
---

**当前**: integration · Skill: @taiyi-integration · 工件: INTEGRATION.md
**复杂度**: low | Profile: api
**下一步**: 加载 @taiyi-integration，编辑 INTEGRATION.md

*引擎生成 · Agent 读此文件即可*

<!-- ⚠️ SSOT 声明: 以下摘要仅作快速参考。各阶段真源始终是对应的上游工件 (CHANGE.md / DESIGN.md / TASK.md 等)。
     版本发生变更或阶段有冲突时，请直接读取工件文件而非本摘要。 -->