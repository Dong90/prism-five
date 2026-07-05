# Change Graph: c001-pipeline-json-prism-five-taiyi-state-json

## Phases
### change (7 nodes)
**risk** (1) Taiyi state.json schema 与 pipeline.json 不一致
**acceptance_criterion** (3) Pipeline 构造器优先读取 .taiyi/changes/<slug>/state.json / Taiyi state.json 不存在时 fallback .prism/pipeline.json / 已有 89 个测试全部通过
**unknown** (3) packages/orchestrator/src/state.ts / packages/orchestrator/src/taiyi-bridge.ts (new) / packages/orchestrator/src/pipeline.ts

### requirement (2 nodes)
**acceptance_criterion** (2) Given state.json存在 When Pipeline初始化 Then 使用Taiyi state / Given state.json不存在 When Pipeline初始化 Then fallback pipeli...

### design (1 nodes)
**design_decision** (1) A

### ui-design (1 nodes)
**design_decision** (1) 无UI

### task (2 nodes)
**slice** (2) 0 / 1

### test (2 nodes)
**test_case** (2) readTaiyiState returns null when no state.json / mapTaiyiToPipeline maps workflowStatus to productStage

### review (4 nodes)
**unknown** (4)
  - taiyi-bridge.ts mapTaiyiToPipeline returns Partial<Pipeli...
  - functional
  - architecture
  - ... +1 more

### integration (1 nodes)
**unknown** (1) 待填写

## Cross-Cutting Concerns
**1** SSOT violations: 0 high, 0 medium, 1 low
- [LOW] design_decision (design vs task): design_decision 跨阶段不一致: "A" ≠ "0"

## Stats
- Total nodes: 20
- Total edges: 4
- Phases with nodes: 8/8


## review (✓)
**评审**:
- [x] **Approve** — 可合并
---

**当前**: integration · Skill: @taiyi-integration · 工件: INTEGRATION.md
**复杂度**: low | Profile: full
**下一步**: 加载 @taiyi-integration，编辑 INTEGRATION.md

*引擎生成 · Agent 读此文件即可*

<!-- ⚠️ SSOT 声明: 以下摘要仅作快速参考。各阶段真源始终是对应的上游工件 (CHANGE.md / DESIGN.md / TASK.md 等)。
     版本发生变更或阶段有冲突时，请直接读取工件文件而非本摘要。 -->