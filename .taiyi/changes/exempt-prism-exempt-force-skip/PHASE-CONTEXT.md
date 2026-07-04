# Change Graph: exempt-prism-exempt-force-skip

## Phases
### change (12 nodes)
**risk** (2) 豁免过期后用户忘了重新申请导致 continue 被拒 / exemptions 数据量增长导致 pipeline.json 膨胀
**acceptance_criterion** (6)
  - prism build <slug> 在 prototyper 未完成时拒绝执行，提示上游缺失
  - prism ship <slug> --force-skip 临时绕过上游检查，写审计日志
  - prism exempt auth prototyper --reason 'migrated' 永久豁免某阶段，...
  - ... +3 more
**unknown** (4)
  - packages/orchestrator/src/schema.ts
  - packages/orchestrator/src/upstream.ts (new)
  - packages/cli/src/commands/exempt.ts (new)
  - ... +1 more

### requirement (6 nodes)
**acceptance_criterion** (4)
  - Given 用户新建 feature 且未跑 prototyper
When 执行 prism build aut...
  - Given feature 含未完成上游
When 执行 prism ship auth --force-skip...
  - Given 已执行 prism exempt auth prototyper
When 执行 prism buil...
  - ... +1 more
**unknown** (2) 上游阶段缺失 / 豁免过期

### design (1 nodes)
**design_decision** (1) A

### ui-design (1 nodes)
**design_decision** (1) CLI only

### task (3 nodes)
**slice** (3) 0 / 1 / 2

### test (4 nodes)
**test_case** (4)
  - SC-01: builder rejected when prototyper missing
  - SC-03: builder accepted when exempted
  - SC-05: expired exemption rejected
  - ... +1 more

### review (6 nodes)
**unknown** (6)
  - exempt grant does not call writePipeline
  - functional
  - architecture
  - ... +3 more

### integration (1 nodes)
**unknown** (1) 待填写

## Cross-Cutting Concerns
**1** SSOT violations: 0 high, 0 medium, 1 low
- [LOW] design_decision (design vs task): design_decision 跨阶段不一致: "A" ≠ "0"

## Stats
- Total nodes: 34
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