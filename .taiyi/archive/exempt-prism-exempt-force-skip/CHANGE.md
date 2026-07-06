---
phase: change
skill: taiyi-change
gate: human
produces: CHANGE.md
upstream: []
downstream: [requirement]
---
<!-- phase:change skill:taiyi-change gate:human est:15min produces:CHANGE.md upstream:[] downstream:[requirement] cplx:[ALL]5steps +[UI]1 +[M+]4 +[H]1 -->
# CHANGE: 上游强制 + exempt 豁免机制

> **一句话**: Pentad 5 角色按顺序依赖上游产出。Builder 需 PRD，Sweeper 需 build 产物。当前 pipeline.continue() 只看 gate 不验证上游阶段是否跑过。每次手动检查耗时 5-10min。 | **Status**: active | **Slug**: exempt-prism-exempt-force-skip

---

## Step 1: Problem Statement
> **[ALL]** Goal: 证明值得做 | Inputs: 用户反馈/监控/业务指标
<!-- Action: 用数据回答: 当前多痛、不改多惨、改了多好 -->

**当前状态**: Pentad 5 角色按顺序依赖上游产出。Builder 需 PRD，Sweeper 需 build 产物。当前 pipeline.continue() 只看 gate 不验证上游阶段是否跑过。每次手动检查耗时 5-10min。

**不改的代价**: 用户可从 maintainer 误启动，跳过前置阶段造成空 artifact 执行失败

**目标状态**: 5 角色按顺序受上游校验保护；例外可通过 exempt 永久豁免或 --force-skip 临时绕过

<!-- Validate: 有可度量数字？ -->

## Step 2: Boundary Definition
> **[ALL]** Goal: 画清边界防蔓延 | Inputs: Step1
<!-- Action: 列出要做的(动词开头)和明确不做的 -->

### In Scope
- pipeline.json schema 加 exemptions 字段
- packages/orchestrator/src/upstream.ts: checkUpstreamForRole 校验
- packages/cli/src/commands/exempt.ts: prism exempt grant/list/revoke
- L1/L2 命令加 --force-skip flag
- packages/orchestrator/src/audit.ts: .pentad/audit-log.json

### Out of Scope
- 不引入 Taiyi 9 阶段
- 不重写 pipeline.continue()
- 不改变现有 gate 机制

<!-- Validate: In/Out互斥且穷尽？ -->

## Step 3: Visual Direction
> **[UI]** Goal: 前端项目预选视觉方向 | Inputs: 产品定位/品牌/竞品
<!-- Action: 前端项目必填，纯后端 skip。此选择被 Phase 4 ui-design 继承并深化 -->

- **调性**: N/A - CLI only
- **理由**: CLI change; no visual surface
- **参考产品**: N/A
- **明确排除**: 任何浏览器/web UI 改动

<!-- Validate: 调性选择有理由支撑？参考产品有可比性？ -->

## Step 4: Premise Challenge
> **[ALL]** Goal: 确认这是正确的问题 | Inputs: Step1+2
<!-- Action: 换角度重新审视 — 能不能不做/复用/更简单定义？有没有完全不同的路径？ -->

- **换个角度**: 不施加上游强制而是信任用户——但这违背 Pentad 的阶段接力原则
- **不做代价**: 加 3 个文件约 200 LOC，增加 CLI 复杂度
- **已有复用**: 现有 pipeline.json schema + commander.js CLI 可直接扩展
- **Scrap it?**: 改用 Taiyi 9 阶段 gate 方案（已排除）

<!-- Validate: 挑战≥2个假设 + 至少考虑了一个替代路径 -->

## Step 5: Impact Map
> **[ALL]** Goal: 知道改了谁受影响 | Inputs: Step2
<!-- Action: 列出所有受影响的模块/服务/团队 -->

| 模块/服务/团队 | 影响 | 负责人 |
|--------------|------|--------|
| packages/orchestrator/src/schema.ts | 加 exemptions 字段 | shixiaocai |
| packages/orchestrator/src/upstream.ts (new) | 校验逻辑 | shixiaocai |
| packages/cli/src/commands/exempt.ts (new) | CLI 命令 | shixiaocai |
| packages/orchestrator/src/audit.ts (new) | 审计日志 | shixiaocai |

<!-- Validate: 遗漏=上线事故 -->

## Step 6: Success Criteria
> **[ALL]** Goal: 定义"做完"的客观标准 | Inputs: Step1目标
<!-- Action: SC-XX编号，可度量可验证。完成后勾选 -->

- [x] **SC-01**: prism build 在 prototyper 未完成时拒绝执行
- [x] **SC-02**: prism ship --force-skip 临时绕过并写审计日志
- [x] **SC-03**: prism exempt grant 永久豁免某阶段
- [x] **SC-04**: prism exempt list 列出所有豁免
- [x] **SC-05**: 豁免过期后恢复检查
- [x] **SC-06**: audit-log.json 记录所有操作

<!-- Validate: 每条可客观度量(数字/百分比/布尔)？ -->

## Step 7: Dream State
> **[MEDIUM+]** Goal: 确认在正确方向 | Inputs: Step1+5
<!-- Action: 画现在→本次→12月后轨迹 -->

```
  CURRENT              THIS CHANGE              12-MONTH IDEAL
  _现状_     --->      _本次增量_    --->        _理想终态_
```

<!-- Validate: 向理想靠近而非引入未来技术债？ -->

## Step 8: Risk Assessment
> **[MEDIUM+]** Goal: 识别可能出错的地方 | Inputs: Step4
<!-- Action: 技术/业务/时间风险+概率+影响+缓解 -->

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 豁免过期后用户忘了重新申请 | medium | 用户体验降级 | 过期前 7 天 status 提醒 |
| exemptions 数据膨胀 pipeline.json | low | 加载变慢 | 过期后自动清理 |

<!-- Validate: 三类全覆盖？缓解可执行？ -->

## Step 9: Innovation Token Check
> **[MEDIUM+]** Goal: 不为新而新 | Inputs: Step7
<!-- Action: 新技术/新基础设施必须说明理由。每公司约3个token -->

| 技术决策 | Token? | 不选成熟方案的理由 |
|---------|:--:|-------------------|
| _本次无新技术引入_ | 否 | _沿用现有技术栈_ |

_已花费: 0/3_

<!-- Validate: ≤3？每个"是"有充分理由？ -->

## Step 10: Migration & Rollback
> **[HIGH]** Goal: 上线回退有预案 | Inputs: Step4+7
<!-- Action: 数据迁移/API变更/行为变更时描述切换和回退 -->

**迁移**: 无数据迁移；加 schema 字段向后兼容
**回滚触发**: upstream check 误拦正常流程
**回滚操作**: git revert HEAD
**回滚时间**: ≤10min

<!-- Validate: 回滚≤30min？步骤精确？ -->

## Step 11: Stakeholder Sign-off
> **[MEDIUM+]** Goal: 该知道的人都知道了 | Inputs: Step4
<!-- Action: PM/TechLead/QA/安全/运维无遗漏 -->

| 角色 | 姓名 | 诉求 |
|------|------|------|
| PM | shixiaocai | 5 角色接力不被跳过 |
| TechLead | claude | 审计日志完整可追溯 |

---
## Quality Gate
<!-- Evidence-first: 每项通过需要可验证证据，不是"感觉对了"。ECC verification-loop 取代 Superpowers verification-before-completion -->

⬜ S1 有量化数据
⬜ S2 边界清晰
⬜ [UI] S3 视觉调性已选定
⬜ S4 挑战≥2假设 + 有Scrap-it备选
⬜ S5 影响模块无遗漏
⬜ S6 每条SC可度量
⬜ [M+] S7 向理想靠近
⬜ [M+] S8 三类风险全覆盖
⬜ [M+] S9 Token≤3
⬜ [H]  S10 回滚方案可执行
⬜ [M+] S11 干系人无遗漏
⬜ **TODOS.md**: 延期项已记录 | PD#7: 没写=不存在
