---
phase: change
skill: taiyi-change
gate: human
produces: CHANGE.md
upstream: []
downstream: [requirement]
---
<!-- phase:change skill:taiyi-change gate:human est:15min produces:CHANGE.md upstream:[] downstream:[requirement] cplx:[ALL]5steps +[UI]1 +[M+]4 +[H]1 -->
# CHANGE: 退役 pipeline.json 真源——改为 Taiyi state.json

> **一句话**: prism-five 当前使用 .prism/pipeline.json 作为唯一状态真源。按架构决策（COMMAND-DESIGN.md §0），prism-five 应是 TaiyiForge workflow skin，使用 Taiyi 的 .taiyi/changes/<slug>/state.json engineTruth 作为唯一状态源。 | **Status**: active | **Slug**: c001-pipeline-json-prism-five-taiyi-state-json

---

## Step 1: Problem Statement
> **[ALL]** Goal: 证明值得做 | Inputs: 用户反馈/监控/业务指标
<!-- Action: 用数据回答: 当前多痛、不改多惨、改了多好 -->

**当前状态**: prism-five 当前使用 .prism/pipeline.json 作为唯一状态真源。按架构决策（COMMAND-DESIGN.md §0），prism-five 应是 TaiyiForge workflow skin，使用 Taiyi 的 .taiyi/changes/<slug>/state.json engineTruth 作为唯一状态源。

**不改的代价**: 后续 134 个 change 基于错误的 pipeline.json 真源，集成 Taiyi 时全要重写

**目标状态**: Pipeline 类双路径读状态（Taiyi 优先，pipeline.json 兜底），对外接口不变

<!-- Validate: 有可度量数字？ -->

## Step 2: Boundary Definition
> **[ALL]** Goal: 画清边界防蔓延 | Inputs: Step1
<!-- Action: 列出要做的(动词开头)和明确不做的 -->

### In Scope
- packages/orchestrator/src/state.ts: DEFAULT_PATH 改为优先读 Taiyi state.json，读不到 fallback pipeline.json
- packages/orchestrator/src/pipeline.ts: Pipeline 构造器改为从 Taiyi state.json 读
- 新增 packages/orchestrator/src/taiyi-bridge.ts: mapTaiyiToPipeline 适配函数

### Out of Scope
- 不删 pipeline.ts/state.ts（保留 fallback 路径）
- 不改 gate.ts/audit.ts/upstream.ts（后续 change 处理）
- 不改变 CLI 命令行为

<!-- Validate: In/Out互斥且穷尽？ -->

## Step 3: Visual Direction
> **[UI]** Goal: 前端项目预选视觉方向 | Inputs: 产品定位/品牌/竞品
<!-- Action: 前端项目必填，纯后端 skip。此选择被 Phase 4 ui-design 继承并深化 -->

- **调性**: 待选定
- **理由**: 结合业务说明
- **参考产品**: 3 个参考产品
- **明确排除**: 无 — CLI/workflow only; no visual surface

<!-- Validate: 调性选择有理由支撑？参考产品有可比性？ -->

## Step 4: Premise Challenge
> **[ALL]** Goal: 确认这是正确的问题 | Inputs: Step1+2
<!-- Action: 换角度重新审视 — 能不能不做/复用/更简单定义？有没有完全不同的路径？ -->

- **换个角度**: Taiyi engineTruth 是更完备的真源——但直接替换破坏现有代码；双路径是最安全的渐进方案
- **不做代价**: pipeline.json 无法感知 Taiyi 阶段推进；后续 134 个 change 需全量重写
- **已有复用**: TaiyiForge 的 engineTruth 已实现完整的状态管理——直接复用是最优方案
- **Scrap it?**: 直接引入 Taiyi engine 作为唯一真源而非写自己的状态机——这本身就是最省力的方案

<!-- Validate: 挑战≥2个假设 + 至少考虑了一个替代路径 -->

## Step 5: Impact Map
> **[ALL]** Goal: 知道改了谁受影响 | Inputs: Step2
<!-- Action: 列出所有受影响的模块/服务/团队 -->

| 模块/服务/团队 | 影响 | 负责人 |
|--------------|------|--------|
| packages/orchestrator/src/state.ts | DEFAULT_PATH 加 Taiyi 路径 | shixiaocai |
| packages/orchestrator/src/taiyi-bridge.ts (new) | 新增适配层 | shixiaocai |
| packages/orchestrator/src/pipeline.ts | 构造器改为双路径 | shixiaocai |

> ⚠️ 如未列出 impact_map，Zod 校验会要求 ≥ 1 条；占位 fallback 已删除。

<!-- Validate: 遗漏=上线事故 -->

## Step 6: Success Criteria
> **[ALL]** Goal: 定义"做完"的客观标准 | Inputs: Step1目标
<!-- Action: SC-XX编号，可度量可验证。完成后勾选 -->

- [ ] **SC-01**: Pipeline 构造器优先读取 .taiyi/changes/<slug>/state.json
- [ ] **SC-02**: Taiyi state.json 不存在时 fallback .prism/pipeline.json
- [ ] **SC-03**: 已有 89 个测试全部通过

<!-- Validate: 每条可客观度量(数字/百分比/布尔)？ -->

## Step 7: Dream State
> **[MEDIUM+]** Goal: 确认在正确方向 | Inputs: Step1+5
<!-- Action: 画现在→本次→12月后轨迹 -->

```
  CURRENT              THIS CHANGE              12-MONTH IDEAL
  现状     --->      本次增量    --->        理想终态
```

<!-- Validate: 向理想靠近而非引入未来技术债？ -->

## Step 8: Risk Assessment
> **[MEDIUM+]** Goal: 识别可能出错的地方 | Inputs: Step4
<!-- Action: 技术/业务/时间风险+概率+影响+缓解 -->

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| Taiyi state.json schema 与 pipeline.json 不一致 | low | 适配函数需处理缺失字段 | mapTaiyiToPipeline 补默认值 |

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

**迁移**: 1. 新建 taiyi-bridge.ts
2. 修改 state.ts 双路径
3. 验证 89 测试通过
**回滚触发**: 测试全部通过
**回滚操作**: git revert HEAD
**回滚时间**: ≤N min

<!-- Validate: 回滚≤30min？步骤精确？ -->

## Step 11: Stakeholder Sign-off
> **[MEDIUM+]** Goal: 该知道的人都知道了 | Inputs: Step4
<!-- Action: PM/TechLead/QA/安全/运维无遗漏 -->

| 角色 | 姓名 | 诉求 |
|------|------|------|
| PM | shixiaocai | 后续 change 能基于 Taiyi engineTruth 推进 |

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
