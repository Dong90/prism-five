---
phase: change
skill: taiyi-change
gate: human
produces: CHANGE.md
upstream: []
downstream: [requirement]
---
<!-- phase:change skill:taiyi-change gate:human est:15min produces:CHANGE.md upstream:[] downstream:[requirement] cplx:[ALL]5steps +[UI]1 +[M+]4 +[H]1 -->
# CHANGE: M15 Token 管理：预算定义 + 实时追踪 + 超限告警

> **一句话**: 当前 Prism 的 TokenBudget schema 已定义 per-role 配额（prototyper 30k, builder 80k 等），但缺乏三个关键能力：(1) 无实时追踪——executor 每次调用后不记录消耗，配额形同虚设；(2) 无超限告警——超过配额时 gate 不拦截，agent 可无限制继续消耗；(3) 无使用分析——开发者看不到各 feature 的 token 消耗分布和趋势。TaiyiForge 已有 /taiyi:token status/record/scan/compress 四项能力，需吸收为 Prism 原生 TokenBudget 模块。 | **Status**: active | **Slug**: token-per-phase-token

---

## Step 1: Problem Statement
> **[ALL]** Goal: 证明值得做 | Inputs: 用户反馈/监控/业务指标
<!-- Action: 用数据回答: 当前多痛、不改多惨、改了多好 -->

**当前状态**: 当前 Prism 的 TokenBudget schema 已定义 per-role 配额（prototyper 30k, builder 80k 等），但缺乏三个关键能力：(1) 无实时追踪——executor 每次调用后不记录消耗，配额形同虚设；(2) 无超限告警——超过配额时 gate 不拦截，agent 可无限制继续消耗；(3) 无使用分析——开发者看不到各 feature 的 token 消耗分布和趋势。TaiyiForge 已有 /taiyi:token status/record/scan/compress 四项能力，需吸收为 Prism 原生 TokenBudget 模块。

**不改的代价**: TokenBudget schema 定义了 18 万 token 总配额但完全无追踪和拦截，agent 可无限制消耗，无法评估各 feature 成本

**目标状态**: TokenBudget 模块提供 track/check/usage API，pipeline.continue() 集成超限门禁。后续 M5 CLI 可基于 usage() 提供 prism token status 命令

<!-- Validate: 有可度量数字？ -->

## Step 2: Boundary Definition
> **[ALL]** Goal: 画清边界防蔓延 | Inputs: Step1
<!-- Action: 列出要做的(动词开头)和明确不做的 -->

### In Scope
- M15a: 新增 token-budget.ts，TokenBudget 类封装 track/check/alert 逻辑
- M15b: executor 每次调用后自动调用 token-budget.track(role, amount) 记录消耗
- M15c: checkBudget(slug, role) 超限返回 blocked + 报告哪个 phase 超标
- M15d: pipeline continue() 集成 token-budget.checkBudget()，超限 → gate blocked
- M15e: token-budget.usage(slug) 返回 per-feature token 消耗分布
- TypeScript 类型 + 单元测试 80%+

### Out of Scope
- Token 压缩编排（prism token compress 由后续 change 实现）
- CLI 用户交互界面（prism token status/scan 由 M5 统一实现）
- 跨 feature 的 token 趋势分析
- 与外部 LLM provider 的实际 token 计数集成（仅提供接口）

<!-- Validate: In/Out互斥且穷尽？ -->

## Step 3: Visual Direction
> **[UI]** Goal: 前端项目预选视觉方向 | Inputs: 产品定位/品牌/竞品
<!-- Action: 前端项目必填，纯后端 skip。此选择被 Phase 4 ui-design 继承并深化 -->

- **调性**: 
- **理由**: 
- **参考产品**: 
- **明确排除**: 无 — CLI/workflow only; no visual surface

<!-- Validate: 调性选择有理由支撑？参考产品有可比性？ -->

## Step 4: Premise Challenge
> **[ALL]** Goal: 确认这是正确的问题 | Inputs: Step1+2
<!-- Action: 换角度重新审视 — 能不能不做/复用/更简单定义？有没有完全不同的路径？ -->

- **换个角度**: 
- **不做代价**: 
- **已有复用**: 
- **Scrap it?**: 

<!-- Validate: 挑战≥2个假设 + 至少考虑了一个替代路径 -->

## Step 5: Impact Map
> **[ALL]** Goal: 知道改了谁受影响 | Inputs: Step2
<!-- Action: 列出所有受影响的模块/服务/团队 -->

| 模块/服务/团队 | 影响 | 负责人 |
|--------------|------|--------|
| packages/orchestrator/src/token-budget.ts (new) | 新增：track/check/usage/estimate/bump | shixiaocai |
| packages/orchestrator/src/pipeline.ts | 修改：continue() 前调用 TokenBudget.check() | shixiaocai |
| packages/orchestrator/src/schema.ts | 补充 used 字段结构定义 | shixiaocai |
| packages/orchestrator/src/index.ts | 导出新模块 | shixiaocai |

> ⚠️ 如未列出 impact_map，Zod 校验会要求 ≥ 1 条；占位 fallback 已删除。

<!-- Validate: 遗漏=上线事故 -->

## Step 6: Success Criteria
> **[ALL]** Goal: 定义"做完"的客观标准 | Inputs: Step1目标
<!-- Action: SC-XX编号，可度量可验证。完成后勾选 -->

- [x] **SC-01**: TokenBudget.track(slug, role, amount) 记录消耗到 pipeline.json tokenBudget.used
- [x] **SC-02**: TokenBudget.check(slug, role) 超配额时返回 {passed:false, reason:"token exceeded for role:..."}
- [x] **SC-03**: TokenBudget.usage(slug) 返回 {total, byRole, quota} per-feature 消耗分布
- [x] **SC-04**: pipeline.continue() 前调用 TokenBudget.check(), 超限 → gate blocked
- [x] **SC-05**: 零配额或耗尽后 token-budget 操作不抛异常（降级为 pass）
- [x] **SC-06**: npm test 通过，新增模块覆盖率 >= 80%

<!-- Validate: 每条可客观度量(数字/百分比/布尔)？ -->

## Step 7: Dream State
> **[MEDIUM+]** Goal: 确认在正确方向 | Inputs: Step1+5
<!-- Action: 画现在→本次→12月后轨迹 -->

```
  CURRENT              THIS CHANGE              12-MONTH IDEAL
       --->          --->        
```

<!-- Validate: 向理想靠近而非引入未来技术债？ -->

## Step 8: Risk Assessment
> **[MEDIUM+]** Goal: 识别可能出错的地方 | Inputs: Step4
<!-- Action: 技术/业务/时间风险+概率+影响+缓解 -->

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| Token 计数依赖外部 LLM provider 返回——当前无集成点 | medium | track() 依赖调用方传入 amount，数量不准确则门禁无意义 | track() 接受 amount 参数由调用方提供；提供 estimate() 启发式估算（字符数/4）作为 fallback |
| 超限告警后 agent 被阻塞无法完成工作 | low | 需人工审批追加配额 | 提供 TokenBudget.bump(slug, amount) 管理员追加配额接口 |

<!-- Validate: 三类全覆盖？缓解可执行？ -->

## Step 9: Innovation Token Check
> **[MEDIUM+]** Goal: 不为新而新 | Inputs: Step7
<!-- Action: 新技术/新基础设施必须说明理由。每公司约3个token -->

| 技术决策 | Token? | 不选成熟方案的理由 |
|---------|:--:|-------------------|
| 本次无新技术引入 | 否 | 沿用现有技术栈 |

**已花费: 0/3**

<!-- Validate: ≤3？每个"是"有充分理由？ -->

## Step 10: Migration & Rollback
> **[HIGH]** Goal: 上线回退有预案 | Inputs: Step4+7
<!-- Action: 数据迁移/API变更/行为变更时描述切换和回退 -->

**迁移**: 
**回滚触发**: 
**回滚操作**: 
**回滚时间**: 

<!-- Validate: 回滚≤30min？步骤精确？ -->

## Step 11: Stakeholder Sign-off
> **[MEDIUM+]** Goal: 该知道的人都知道了 | Inputs: Step4
<!-- Action: PM/TechLead/QA/安全/运维无遗漏 -->

| 角色 | 姓名 | 诉求 |
|------|------|------|
| PM | shixiaocai | 可追踪各 feature token 消耗，超配额时有拦截 |

---
## Quality Gate
<!-- Evidence-first: 每项通过需要可验证证据，不是"感觉对了"。ECC verification-loop 取代 Superpowers verification-before-completion -->

⬜ S1 有量化数据
⬜ S2 边界清晰
⬜ [UI] S3 视觉调性已选定
⬜ S4 挑战≥2假设 + 有Scrap-it备选
⬜ S5 影响模块无遗漏
⬜ S6 每条SC可度量
⬜ [M+] S8 三类风险全覆盖
⬜ [H]  S10 回滚方案可执行
⬜ [M+] S11 干系人无遗漏
⬜ **TODOS.md**: 延期项已记录 | PD#7: 没写=不存在
