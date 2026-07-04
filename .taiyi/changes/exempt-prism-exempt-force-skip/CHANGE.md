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

> **一句话**: Pentad 5 角色按顺序依赖上游产出（Builder 需 PRD，Sweeper 需 build 产物）。当前 pipeline.continue() 只看 gate 不验证上游阶段是否跑过，允许用户错误地从 maintainer 开始。需加强制校验 + 豁免机制。 | **Status**: active | **Slug**: exempt-prism-exempt-force-skip

---

## Step 1: Problem Statement
> **[ALL]** Goal: 证明值得做 | Inputs: 用户反馈/监控/业务指标
<!-- Action: 用数据回答: 当前多痛、不改多惨、改了多好 -->

**当前状态**: Pentad 5 角色按顺序依赖上游产出（Builder 需 PRD，Sweeper 需 build 产物）。当前 pipeline.continue() 只看 gate 不验证上游阶段是否跑过，允许用户错误地从 maintainer 开始。需加强制校验 + 豁免机制。

**不改的代价**: [量化]

**目标状态**: [理想结果]

<!-- Validate: 有可度量数字？ -->

## Step 2: Boundary Definition
> **[ALL]** Goal: 画清边界防蔓延 | Inputs: Step1
<!-- Action: 列出要做的(动词开头)和明确不做的 -->

### In Scope
- pipeline.json schema 加 exemptions 字段（stage/reason/expiresAt/approver/autoTrigger）
- packages/orchestrator/src/upstream.ts：checkUpstreamForRole 校验逻辑
- packages/cli/src/commands/exempt.ts：prism exempt new/list/revoke 命令
- L1/L2 全部命令加 --force-skip flag（命令级临时绕过）
- packages/orchestrator/src/audit.ts：审计日志 .pentad/audit-log.json

### Out of Scope
- 不引入 Taiyi 的 9 阶段 workflow（保持 Pentad 5 角色）
- 不重写 pipeline.continue() 核心逻辑（只加前置校验）
- 不改变现有 gate 机制

<!-- Validate: In/Out互斥且穷尽？ -->

## Step 3: Visual Direction
> **[UI]** Goal: 前端项目预选视觉方向 | Inputs: 产品定位/品牌/竞品
<!-- Action: 前端项目必填，纯后端 skip。此选择被 Phase 4 ui-design 继承并深化 -->

- **调性**: _待选定_
- **理由**: _结合业务说明_
- **参考产品**: _3 个参考产品_
- **明确排除**: _无 — CLI/workflow only; no visual surface_

<!-- Validate: 调性选择有理由支撑？参考产品有可比性？ -->

## Step 4: Premise Challenge
> **[ALL]** Goal: 确认这是正确的问题 | Inputs: Step1+2
<!-- Action: 换角度重新审视 — 能不能不做/复用/更简单定义？有没有完全不同的路径？ -->

- **换个角度**: [重新定义问题会怎样？]
- **不做代价**: [量化]
- **已有复用**: [有无现成方案？]
- **Scrap it?**: [有没有完全不同的方案更值得做？PD#9: 有更好的方法就说]

<!-- Validate: 挑战≥2个假设 + 至少考虑了一个替代路径 -->

## Step 5: Impact Map
> **[ALL]** Goal: 知道改了谁受影响 | Inputs: Step2
<!-- Action: 列出所有受影响的模块/服务/团队 -->

| 模块/服务/团队 | 影响 | 负责人 |
|--------------|------|--------|
| packages/orchestrator/src/schema.ts | 加 exemptions 字段 | shixiaocai |
| packages/orchestrator/src/upstream.ts (new) | 上游校验逻辑 | shixiaocai |
| packages/cli/src/commands/exempt.ts (new) | exempt 命令 | shixiaocai |
| packages/orchestrator/src/audit.ts (new) | 审计日志 | shixiaocai |

<!-- Validate: 遗漏=上线事故 -->

## Step 6: Success Criteria
> **[ALL]** Goal: 定义"做完"的客观标准 | Inputs: Step1目标
<!-- Action: SC-XX编号，可度量可验证。完成后勾选 -->

- [x] **SC-01**: prism build <slug> 在 prototyper 未完成时拒绝执行，提示上游缺失
- [x] **SC-02**: prism ship <slug> --force-skip 临时绕过上游检查，写审计日志
- [x] **SC-03**: prism exempt auth prototyper --reason 'migrated' 永久豁免某阶段，后续所有命令不检查该阶段
- [x] **SC-04**: prism exempt list 列出当前 feature 所有豁免项
- [x] **SC-05**: 豁免有过期时间（--days 30），过期后恢复强制检查
- [x] **SC-06**: --force-skip 审计日志记录到 .pentad/audit-log.json，含 reason + timestamp

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
| 豁免过期后用户忘了重新申请导致 continue 被拒 | medium | 用户体验降级需手动处理 | 过期前 7 天 status 提醒 |
| exemptions 数据量增长导致 pipeline.json 膨胀 | low | 加载慢 | expiresAt 过期后自动清理 |

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

**迁移**: [步骤]
**回滚触发**: [量化条件]
**回滚操作**: [精确到命令]
**回滚时间**: ≤_N_min

<!-- Validate: 回滚≤30min？步骤精确？ -->

## Step 11: Stakeholder Sign-off
> **[MEDIUM+]** Goal: 该知道的人都知道了 | Inputs: Step4
<!-- Action: PM/TechLead/QA/安全/运维无遗漏 -->

| 角色 | 姓名 | 诉求 |
|------|------|------|
| _本次为测试变更，无额外干系人_ | _CI/CD_ | _自动化回归通过_ |

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
