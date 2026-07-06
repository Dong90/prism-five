---
phase: change
skill: taiyi-change
gate: human
produces: CHANGE.md
upstream: []
downstream: [requirement]
---
<!-- phase:change skill:taiyi-change gate:human est:15min produces:CHANGE.md upstream:[] downstream:[requirement] cplx:[ALL]5steps +[UI]1 +[M+]4 +[H]1 -->
# CHANGE: M14 状态扩展：per-feature context snapshot + LEARNINGS + project memory

> **一句话**: 当前 Prism 缺乏三种关键状态持久化能力：(1) 跨会话恢复时只能靠 checkpoint.json 恢复 pipeline 状态，但缺少人类可读的上下文摘要（当前 role、已产出工件、阻塞项、下一步），导致复工成本高；(2) 跨 feature 的经验积累完全依赖开发者记忆，没有持久化的失败模式/成功模式/可复用方案记录；(3) 技术栈、惯例、项目约束等全局信息散落在各个文档和开发者头脑中，没有结构化的机器可读存储。TaiyiForge 已有 CONTEXT.md per change、LEARNINGS.md、project-memory.json 三项能力，需吸收为 Prism 原生模块。 | **Status**: active | **Slug**: per-feature-context-snapshot-learnings-project-m

---

## Step 1: Problem Statement
> **[ALL]** Goal: 证明值得做 | Inputs: 用户反馈/监控/业务指标
<!-- Action: 用数据回答: 当前多痛、不改多惨、改了多好 -->

**当前状态**: 当前 Prism 缺乏三种关键状态持久化能力：(1) 跨会话恢复时只能靠 checkpoint.json 恢复 pipeline 状态，但缺少人类可读的上下文摘要（当前 role、已产出工件、阻塞项、下一步），导致复工成本高；(2) 跨 feature 的经验积累完全依赖开发者记忆，没有持久化的失败模式/成功模式/可复用方案记录；(3) 技术栈、惯例、项目约束等全局信息散落在各个文档和开发者头脑中，没有结构化的机器可读存储。TaiyiForge 已有 CONTEXT.md per change、LEARNINGS.md、project-memory.json 三项能力，需吸收为 Prism 原生模块。

**不改的代价**: 跨会话复工时每次需重读代码和文档重建上下文，人均约 5-10 分钟；跨 feature 经验无法积累，同类问题反复出现；项目约束和技术栈信息散落，新加入者或 AI agent 需要额外搜索

**目标状态**: 每个 feature 有 CONTEXT.md 人类可读摘要；全局 LEARNINGS.md 积累跨 feature 经验；project-memory.json 持久化技术栈/惯例/约束。pipeline.continue() 自动更新 context，CLI 命令可查询 learnings/memory

<!-- Validate: 有可度量数字？ -->

## Step 2: Boundary Definition
> **[ALL]** Goal: 画清边界防蔓延 | Inputs: Step1
<!-- Action: 列出要做的(动词开头)和明确不做的 -->

### In Scope
- M14a: 新增 context.ts，为每个 feature 生成/更新 CONTEXT.md（当前 role、已产出工件、阻塞项、下一步 action）
- M14b: 新增 learnings.ts，跨 feature 学习积累（失败模式、成功模式、可复用方案），读/写 .prism/LEARNINGS.md
- M14c: 新增 memory.ts，project memory 持久化（技术栈、惯例、约束），读/写 .prism/project-memory.json
- pipeline.ts continue() 和 persist() 集成 context snapshot 自动更新
- prism learnings 和 prism memory CLI 子命令注册入口
- TypeScript 类型定义和 Zod schema 验证
- 单元测试覆盖 80%+

### Out of Scope
- CLI 用户交互界面（prism context/learnings/memory 完整命令由 M5 统一实现）
- LEARNINGS 自动推理/模式发现（仅提供读写 API，不包含 AI 分析）
- project memory 的自动采集（仅提供读写 API，由 agent 调用）
- 跨项目 memory 同步
- UI 相关功能（api profile 跳过 ui-design）

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
| packages/orchestrator/src/context.ts (new) | 新增：CONTEXT.md 生成/读取 | shixiaocai |
| packages/orchestrator/src/learnings.ts (new) | 新增：LEARNINGS.md 读写 | shixiaocai |
| packages/orchestrator/src/memory.ts (new) | 新增：project-memory.json 读写 | shixiaocai |
| packages/orchestrator/src/pipeline.ts | 修改：continue() 和 createFeature() 集成 context 调用 | shixiaocai |
| packages/orchestrator/src/index.ts | 修改：导出新模块 | shixiaocai |
| .prism/features/<slug>/CONTEXT.md (new) | 新增：运行时产物 | shixiaocai |
| .prism/LEARNINGS.md (new) | 新增：运行时产物 | shixiaocai |
| .prism/project-memory.json (new) | 新增：运行时产物 | shixiaocai |

> ⚠️ 如未列出 impact_map，Zod 校验会要求 ≥ 1 条；占位 fallback 已删除。

<!-- Validate: 遗漏=上线事故 -->

## Step 6: Success Criteria
> **[ALL]** Goal: 定义"做完"的客观标准 | Inputs: Step1目标
<!-- Action: SC-XX编号，可度量可验证。完成后勾选 -->

- [x] **AC-01**: context.saveContext(feature) 在 .prism/features/<slug>/CONTEXT.md 生成包含当前 role、已产出工件、阻塞项、下一步的可读摘要
- [x] **AC-02**: context.loadContext(slug) 返回结构化 Context 对象
- [x] **AC-03**: learnings.add(entry) 追加到 .prism/LEARNINGS.md，learnings.list() 返回所有条目，支持按分类过滤
- [x] **AC-04**: memory.write(key, value) 写入 .prism/project-memory.json，memory.read(key) 读取，schema 验证通过
- [x] **AC-05**: pipeline.continue() 自动调用 context.saveContext() 保存上下文快照
- [x] **AC-06**: pipeline.createFeature() 自动创建 feature CONTEXT.md 初始文件
- [x] **AC-07**: learnings.add() 和 memory.write() 操作自动记录到 activity.jsonl 审计日志
- [x] **AC-08**: npm test 通过，新增模块测试覆盖率 >= 80%

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
| CONTEXT.md 与 checkpoint.json 数据可能不同步 | low | 复工时看到过期上下文导致误判 | pipeline.continue() 中先更新 checkpoint 再生成 CONTEXT.md，保证同一事务内完成；提供 context.sync(slug) 手动同步工具函数 |
| LEARNINGS.md 文件在并发写入时可能丢失数据 | low | 部分学习条目未持久化 | 使用 append-only 写模式；高频写入场景由调用方控制 |
| project-memory.json 写入失败导致数据丢失 | low | 项目配置重建需要手动配置 | 写入前先备份（memory.backup.json），写入成功后删除备份；读时优先读主文件，主文件损坏时自动回退到备份 |

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
| PM | shixiaocai | 跨会话复工零信息损失；跨 feature 经验可积累查询 |

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
