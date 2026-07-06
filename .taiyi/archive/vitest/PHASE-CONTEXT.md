# Change Graph: vitest

## Phases
### change (3 nodes)
**acceptance_criterion** (3) npm test pass / 每包至少三条测试 / 15 条 AC 全覆盖

### requirement (3 nodes)
**acceptance_criterion** (3) npm test runs vitest and passes / 5 core packages each have unit tests / 15 AC from core-pipeline all covered

### design (1 nodes)
**design_decision** (1) A

### task (2 nodes)
**slice** (2) S1 / S2

### test (1 nodes)
**test_case** (1) 0

## Cross-Cutting Concerns
**1** SSOT violations: 0 high, 0 medium, 1 low
- [LOW] design_decision (design vs task): 设计决策跨阶段不一致: "A" ≠ "S1"

## Stats
- Total nodes: 10
- Total edges: 5
- Phases with nodes: 5/8


## review (✓)
**评审**: 测试基础设施


---

**当前**: integration · Skill: @taiyi-integration · 工件: INTEGRATION.md
**复杂度**: low | Profile: api
**下一步**: 加载 @taiyi-integration，编辑 INTEGRATION.md

*引擎生成 · Agent 读此文件即可*

<!-- ⚠️ SSOT 声明: 以下摘要仅作快速参考。各阶段真源始终是对应的上游工件 (CHANGE.md / DESIGN.md / TASK.md 等)。
     版本发生变更或阶段有冲突时，请直接读取工件文件而非本摘要。 -->