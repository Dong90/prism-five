# Change Graph: exempt-prism-exempt-force-skip

## Phases
### change (13 nodes)
**risk** (2) 豁免过期后用户忘了重新申请 / exemptions 数据膨胀 pipeline.json
**acceptance_criterion** (6)
  - prism build 在 prototyper 未完成时拒绝执行
  - prism ship --force-skip 临时绕过并写审计日志
  - prism exempt grant 永久豁免某阶段
  - ... +3 more
**unknown** (4)
  - packages/orchestrator/src/schema.ts
  - packages/orchestrator/src/upstream.ts (new)
  - packages/cli/src/commands/exempt.ts (new)
  - ... +1 more
**rollback** (1) upstream check 误拦正常流程

### requirement (6 nodes)
**acceptance_criterion** (4)
  - Given 用户未跑 prototyper When 执行 prism build Then 拒绝并提示上游缺失
  - Given 上游缺失 When prism ship --force-skip Then 执行并写 audit-log
  - Given exempt grant prototyper When prism build Then 不检查直接执行
  - ... +1 more
**unknown** (2) 上游缺失 / 豁免过期

### design (1 nodes)
**design_decision** (1) A

### ui-design (1 nodes)
**design_decision** (1) CLI only

### task (3 nodes)
**slice** (3) 0 / 1 / 2

### test (3 nodes)
**test_case** (3) SC-01: reject build when prototyper missing / SC-03: accept when exempted / SC-05: reject when expired

### review (5 nodes)
**unknown** (5)
  - functional
  - architecture
  - testing
  - ... +2 more

### integration (1 nodes)
**unknown** (1) 待填写

## Cross-Cutting Concerns
**1** SSOT violations: 0 high, 0 medium, 1 low
- [LOW] design_decision (design vs task): design_decision 跨阶段不一致: "A" ≠ "0"

## Stats
- Total nodes: 33
- Total edges: 7
- Phases with nodes: 8/8


## review (✓)
**评审**:
- [ ] **Approve**
- [ ] **Request changes**
---

**当前**: integration · Skill: @taiyi-integration · 工件: INTEGRATION.md
**复杂度**: low | Profile: full
**下一步**: 加载 @taiyi-integration，编辑 INTEGRATION.md

*引擎生成 · Agent 读此文件即可*

<!-- ⚠️ SSOT 声明: 以下摘要仅作快速参考。各阶段真源始终是对应的上游工件 (CHANGE.md / DESIGN.md / TASK.md 等)。
     版本发生变更或阶段有冲突时，请直接读取工件文件而非本摘要。 -->