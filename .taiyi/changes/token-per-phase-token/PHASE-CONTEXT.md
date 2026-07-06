# Change Graph: token-per-phase-token

## Phases
### change (12 nodes)
**risk** (2) Token 计数依赖外部 LLM provider 返回——当前无集成点 / 超限告警后 agent 被阻塞无法完成工作
**acceptance_criterion** (6)
  - TokenBudget.track(slug, role, amount) 记录消耗到 pipeline.json...
  - TokenBudget.check(slug, role) 超配额时返回 {passed:false, reaso...
  - TokenBudget.usage(slug) 返回 {total, byRole, quota} per-fea...
  - ... +3 more
**unknown** (4)
  - packages/orchestrator/src/token-budget.ts (new)
  - packages/orchestrator/src/pipeline.ts
  - packages/orchestrator/src/schema.ts
  - ... +1 more

### requirement (14 nodes)
**acceptance_criterion** (7)
  - track() 写入 pipeline.json used 字段且可通过 readPipeline 读取
  - check() 配额耗尽返回 {passed:false, reason:"token exceeded"}
  - check() 配额充足返回 {passed:true}
  - ... +4 more
**nfr** (1) track() 操作 < 5ms（纯内存操作）
**unknown** (6)
  - track(slug,role,amount) 更新 pipeline.json tokenBudget.used
  - check(slug,role) 比较 used vs quota, 超限返回 blocked+reason
  - usage(slug) 返回 {total,byRole,quota}
  - ... +3 more

### design (1 nodes)
**design_decision** (1) A

### task (6 nodes)
**slice** (2) token-budget.ts — TokenBudget 类实现 / pipeline.ts 集成 + 导出
**risk** (1) pipeline.continue() 增加 check 可能改变已有行为
**rollback** (1) 删除 continue() 中的 check() 调用行
**unknown** (2) Wave 1 — TokenBudget 模块 / Wave 2 — 集成

### test (2 nodes)
**test_case** (2) token-budget.test.ts: track/check/usage/bump/estimate (7 ... / Full regression: 136 tests across 21 files, all green

### review (9 nodes)
**unknown** (9)
  - TR-1: No explicit test for pipeline.continue() → token ch...
  - FR-1: TokenBudget constructor takes Pipeline as dependenc...
  - FR-2: check() casts tokenBudget to Record<string,number> ...
  - ... +6 more

### integration (1 nodes)
**unknown** (1) (empty)

## Cross-Cutting Concerns
**2** SSOT violations: 0 high, 1 medium, 1 low
- [MEDIUM] risk (change vs requirement): risk 跨阶段不一致: "Token 计数依赖外部 LLM provider 返回——当前无集成点" ≠ "track() 操作 < 5ms（纯内存操作）"
- [LOW] design_decision (design vs task): design_decision 跨阶段不一致: "A" ≠ "token-budget.ts — TokenBudget 类实现"

## Stats
- Total nodes: 45
- Total edges: 11
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