---
phase: change
skill: taiyi-change
gate: human
produces: CHANGE.md
upstream: []
downstream: [requirement]
---
<!-- phase:change skill:taiyi-change gate:human est:15min produces:CHANGE.md upstream:[] downstream:[requirement] cplx:[ALL]5steps +[UI]1 +[M+]4 +[H]1 -->
# CHANGE: 把 prism CLI 适配 OpenCode 终端命令工作流

> **一句话**: prism-five 当前 9 个 CLI 命令（new/status/continue/approve/check/promote/run/queue/next）仅在裸 terminal 里跑。在 OpenCode 终端里跑时，需要 OpenCode 模型能识别这些命令、能 dispatch、能读到当前 pipeline 状态、并把命令输出作为 skill/tool 输出展示给用户。本次变更让 9 个 CLI 命令 + 5 个核心角色全部在 OpenCode 工作可用，能 slash 触发、能 agent-driven dispatch、能被 superpowers harness 串接。 | **Status**: active | **Slug**: opencode-cli-adaptation-prism-cli-opencode

---

## Step 1: Problem Statement
> **[ALL]** Goal: 证明值得做 | Inputs: 用户反馈/监控/业务指标
<!-- Action: 用数据回答: 当前多痛、不改多惨、改了多好 -->

**当前状态**: prism-five 当前 9 个 CLI 命令（new/status/continue/approve/check/promote/run/queue/next）仅在裸 terminal 里跑。在 OpenCode 终端里跑时，需要 OpenCode 模型能识别这些命令、能 dispatch、能读到当前 pipeline 状态、并把命令输出作为 skill/tool 输出展示给用户。本次变更让 9 个 CLI 命令 + 5 个核心角色全部在 OpenCode 工作可用，能 slash 触发、能 agent-driven dispatch、能被 superpowers harness 串接。

**不改的代价**: 继续手动在 OpenCode terminal / 裸 terminal 间切换，每次 5 步接力要 30+ 次手动输入；新团队成员学习成本高

**目标状态**: 用户在 OpenCode 终端一个 session 内完成 5 角色全流程；prism 命令作为 OpenCode tool/tp 暴露，由 slash / agent dispatch 触发

<!-- Validate: 有可度量数字？ -->

## Step 2: Boundary Definition
> **[ALL]** Goal: 画清边界防蔓延 | Inputs: Step1
<!-- Action: 列出要做的(动词开头)和明确不做的 -->

### In Scope
- 新增 OpenCode plugin/extension 注册 (taiyi-style)
- 把 9 个 prism CLI 命令映射成 OpenCode 可识别的工具/tp 接口
- 把 5 个 SKILL.md (.pentad/agents/) 暴露为 OpenCode 可加载 skill
- 在 packages/cli/src/ 改造 OpenCode-aware 的输出格式（JSON mode、machine-readable stdout）
- 新增 prism 命令用于 OpenCode 上下文输出 pipeline.json 状态

### Out of Scope
- 不引入 taiyi 的 9 阶段 workflow 引擎（保留 Pentad 5 角色独立模型）
- 不重写 .pentad/pipeline.json schema（仅加 OpenCode-facing 字段）
- 不动 5 角色 SKILL.md 的实质内容（仅做 OpenCode-frontmatter 适配）

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

- **换个角度**: prism 不应该只是 CLI 二进制；它应该是 OpenCode 可编排的 skill/tool 集合
- **不做代价**: 现有 9 命令+5 SKILL.md 已能完成基本接力；适配 OpenCode 是工具级体验优化而非本质瓶颈
- **已有复用**: 现有 commander.js CLI + 5 个 SKILL.md frontmatter (.pentad/agents/) + OpenCode 的 skill loader 全部已存在
- **Scrap it?**: 改用 taiyi 9 阶段工作流引擎替代 Pentad 5 角色（已排除，scope.excludes）

<!-- Validate: 挑战≥2个假设 + 至少考虑了一个替代路径 -->

## Step 5: Impact Map
> **[ALL]** Goal: 知道改了谁受影响 | Inputs: Step2
<!-- Action: 列出所有受影响的模块/服务/团队 -->

| 模块/服务/团队 | 影响 | 负责人 |
|--------------|------|--------|
| packages/cli/ | OpenCode-aware 输出 + JSON mode | shixiaocai |
| .pentad/agents/ | SKILL.md frontmatter 增加 OpenCode 字段 | shixiaocai |
| 新增 .opencode-plugin/ | OpenCode plugin 注册 + tp interface | shixiaocai |

<!-- Validate: 遗漏=上线事故 -->

## Step 6: Success Criteria
> **[ALL]** Goal: 定义"做完"的客观标准 | Inputs: Step1目标
<!-- Action: SC-XX编号，可度量可验证。完成后勾选 -->

- [x] **SC-01**: 在 OpenCode 终端里运行 `prism status --json` 输出 machine-readable 状态，OpenCode 模型能 parse
- [x] **SC-02**: OpenCode 能识别 `prism` 开头的所有 9 个命令，并通过 slash 或 tp interface 触发
- [x] **SC-03**: 5 个 SKILL.md（.pentad/agents/*.md）能通过 OpenCode 的 skill loader 加载，并被 dispatch 到对应 agent
- [x] **SC-04**: 新增 prism-agent list / prism-agent <name> 子命令，使其能在 OpenCode 工具调用里被调用
- [x] **SC-05**: OpenCode 集成测试通过：打开 OpenCode → 输入 slash → 走完 5 角色接力，全程无 manual terminal 介入

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
| OpenCode plugin API 与现有 commander.js CLI 冲突 | medium | 需额外适配层，可能延迟 | 保留 command 作为子命令，同时输出 JSON mode；OpenCode plugin 只做 wrapper |
| SKILL.md frontmatter 与 OpenCode skill format 不一致 | low | skill 加载失败 | frontmatter 增加 OpenCode 字段 (paradigm/mode)，保留现有 description/tools 字段 |

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

**迁移**: 无需迁移（纯增层）；保留原 9 命令不变，新增 OpenCode plugin 作为 wrapper
**回滚触发**: OpenCode plugin 与现有 command 冲突导致 5+ 关键命令不可用
**回滚操作**: git revert <commit>; npm uninstall @prism-five/opencode-plugin; 9 命令全部回退到 standalone 模式
**回滚时间**: ≤≤10min

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
