---
phase: requirement
skill: taiyi-requirement
gate: auto
produces: REQUIREMENT.md
upstream: [change]
downstream: [design, ui-design]
---
<!-- phase:requirement skill:taiyi-requirement gate:auto est:20min produces:REQUIREMENT.md upstream:[change] downstream:[design,ui-design] cplx:[ALL]5steps +[M+]4 +[H]1 -->
# REQUIREMENT: M14 状态扩展：per-feature context snapshot + LEARNINGS + project memory

> **一句话**: 为 Prism 新增三种状态持久化：per-feature CONTEXT.md、跨 feature LEARNINGS.md、全局 project-memory.json

---

> ⛔ **Out of Scope — 本变更明确不覆盖以下事项**
> <!-- 放置在最顶部，让读者第一眼知道什么不做。与 Step 2 的 scope_out 内容一致无需重复详述，此处为硬性提醒 -->
> - LEARNINGS 自动推理/模式发现（仅提供读写 API，不包含 AI 分析）
> - project memory 的自动采集（仅提供读写 API，由 agent 调用）
> - 跨项目 memory 同步
> - UI 相关功能（api profile 跳过 ui-design）
>
> 📌 *完整范围切分见下方 §Step 2 Scope Partitioning*

---

## Step 1: User Stories
> **[ALL]** Goal: 从用户视角说清需求 | Inputs: CHANGE.md §1, §2
<!-- Action: As a [角色] I want [功能] so that [价值]. 覆盖所有角色 -->

- **As a** 开发者, **I want** 跨会话恢复时能看到上次停在哪、产出什么、卡在哪里、下一步做什么, **so that** 复工成本从 5-10 分钟降到 30 秒内 (P0)
- **As a** 开发者 / AI Agent, **I want** 记录和查询跨 feature 的成功模式、失败教训、可复用方案, **so that** 同类问题不反复踩坑，知识可积累传承 (P0)
- **As a** 开发者 / AI Agent, **I want** 在统一位置读写项目技术栈、惯例、约束信息, **so that** 新加入者或 AI agent 不需要搜索多个文档就能了解项目上下文 (P0)

<!-- Validate: 所有用户角色都覆盖了？ -->

## Step 2: Scope Partitioning
> **[ALL]** Goal: 分版本切范围，防 TASK 阶段误判 | Inputs: CHANGE.md §2
<!-- Action: v1=本次必做, v2=下次, out=永不. 至少 v2+out 各 ≥1 条 -->

### v1（本次必做）
- context.ts: saveContext()/loadContext() — 生成和读取 per-feature CONTEXT.md
- learnings.ts: add()/list() — 追加和查询 LEARNINGS.md
- memory.ts: write()/read()/delete() — 读写 project-memory.json
- pipeline.ts 集成: createFeature() 和 continue() 自动调用 context.saveContext()
- activity.jsonl 审计: learnings.add() 和 memory.write() 操作自动记录
- TypeScript 类型定义和 Zod schema 验证
- 单元测试覆盖 80%+

### v2（下次）
- CLI 用户交互界面（prism context/learnings/memory 完整命令由 M5 统一实现）

### out（永不）
- LEARNINGS 自动推理/模式发现（仅提供读写 API，不包含 AI 分析）
- project memory 的自动采集（仅提供读写 API，由 agent 调用）
- 跨项目 memory 同步
- UI 相关功能（api profile 跳过 ui-design）

<!-- Validate: v2 和 out 各 ≥ 1 条？v1 不包含 out 项？ -->

## Step 3: Functional Requirements
> **[ALL]** Goal: 拆成可测试的功能点 | Inputs: Step1
<!-- Action: FR-XX编号，分模块。涉及UI标注(UI)→触发Phase4 -->

### context.ts
- **FR-C01**: saveContext(feature): 读取 feature 对象，生成 markdown 格式的 CONTEXT.md 到 .prism/features/<slug>/
- **FR-C02**: CONTEXT.md 包含 4 个章节: Current Role, Artifacts, Blockers, Next Action
- **FR-C03**: loadContext(slug): 读取 CONTEXT.md 并解析为结构化的 Context 对象
- **FR-C04**: 解析时基于 markdown 章节标题分割字段，无对应章节时返回默认值 '(none)'
### learnings.ts
- **FR-L01**: add(entry): 追加 LearningEntry 到 .prism/LEARNINGS.md
- **FR-L02**: list(filter?): 读取并返回所有条目，支持按 category 过滤
- **FR-L03**: 使用 append-only 模式，不覆盖已有记录
- **FR-L04**: add() 成功后自动写入 activity.jsonl（event: learning_added）
### memory.ts
- **FR-M01**: write(key, value): 写入键值对到 .prism/project-memory.json，更新 updated 时间戳
- **FR-M02**: read(key?): 读取指定键，无参时返回全部。主文件损坏时自动回退到 backup
- **FR-M03**: delete(key): 删除指定键
- **FR-M04**: write() 前自动备份到 memory.backup.json，写入成功则删除备份
- **FR-M05**: 写入时通过 ProjectMemorySchema Zod 验证
### pipeline.ts 集成
- **FR-P01**: createFeature() 成功后调用 context.saveContext() 创建初始 CONTEXT.md
- **FR-P02**: continue() 在 status 更新后调用 context.saveContext() 更新 CONTEXT.md
- **FR-P03**: context 调用失败记录到 log 但不阻塞 pipeline 正常流程（error logged, not thrown）

<!-- Validate: 每个FR可独立测试？编号连续？ -->

## Step 4: Acceptance Criteria
> **[ALL]** Goal: 每个FR都有客观验收标准 | Inputs: Step3
<!-- Action: Given/When/Then，AC-XX对应FR-XX。verify=可执行验证命令 -->

- [ ] **AC-01**: context.saveContext(feature) 在 .prism/features/<slug>/CONTEXT.md 生成包含 Current Role/Artifacts/Blockers/Next Action 的可读摘要
  - **验证**: 
- [ ] **AC-02**: context.saveContext() 在 artifact 为空时输出 '(none)' 而不是空白
  - **验证**: 
- [ ] **AC-03**: context.loadContext(slug) 返回结构化 Context 对象
  - **验证**: 
- [ ] **AC-04**: learnings.add(entry) 追加到 .prism/LEARNINGS.md，不覆盖已有内容
  - **验证**: 
- [ ] **AC-05**: learnings.list({category:'fix'}) 仅返回 category 为 fix 的条目
  - **验证**: 
- [ ] **AC-06**: memory.write(key, value) 写入 .prism/project-memory.json 且 schema 验证通过
  - **验证**: 
- [ ] **AC-07**: memory.read(key) 读取指定键，memory.read() 无参时返回全部
  - **验证**: 
- [ ] **AC-08**: pipeline.continue() 后 CONTEXT.md 自动更新为新 role 状态
  - **验证**: 
- [ ] **AC-09**: pipeline.createFeature() 自动创建初始 CONTEXT.md
  - **验证**: 
- [ ] **AC-10**: learnings.add() 和 memory.write() 操作自动记录到 activity.jsonl
  - **验证**: 
- [ ] **AC-11**: memory.write() 前备份到 memory.backup.json，主文件损坏时 read() 自动回退到 backup
  - **验证**: 
- [ ] **AC-12**: npm test 通过，新增模块覆盖率 >= 80%
  - **验证**: 

<!-- Validate: 每个AC可独立验收？Given/When/Then完整？验证命令可执行？ -->

## Step 5: Non-Functional Requirements
> **[ALL]** Goal: 性能/安全/可用性有硬指标 | Inputs: Step2
<!-- Action: NFR-XX编号，每个带数值 -->

  ### 性能
  - **NFR-P01**: context.saveContext() 耗时 < 50ms
  - **NFR-P02**: learnings.add() 追加写入耗时 < 20ms
  - **NFR-P03**: memory.write() 含备份操作的耗时 < 100ms
  
  ### 安全
  - **NFR-S01**: 无硬编码路径——所有路径基于 process.cwd() 或配置参数
  - **NFR-S02**: 写入失败时保留已有数据不丢失（atomic write pattern）
  

<!-- Validate: 每个指标有具体数字？ -->

> 📎 **SSOT 规则**: NFR-S* 安全要求应基于 [CHANGE.md §Risks](CHANGE.md) 做非功能性拆解，不独立重评估。每条 NFR-S 应与 CHANGE 的 risks[] 可追溯。

## Step 6: Error & Rescue Map
> **[MEDIUM+]** Goal: 每个错误都有名字和恢复路径 | Inputs: Step2+3
<!-- Action: 触发条件→捕获位置→用户看到→恢复路径 -->


<!-- Validate: 所有可能的错误都有名字？恢复路径可执行？ -->



## Step 9: Dependencies
> **[MEDIUM+]** Goal: 外部依赖不阻塞 | Inputs: CHANGE.md §4
<!-- Action: 技术约束/第三方/跨团队+状态+风险 -->


<!-- Validate: 第三方SLA确认？跨团队排期对齐？ -->

## Step 10: Security & Compliance
> **[HIGH]** Goal: 安全不出事 | Inputs: Step4+5
<!-- Action: OWASP Top10 + GDPR/PIPL. user/auth/payment/PII场景必填 -->

- [ ] npm audit 无 critical/high
- [ ] 无硬编码密钥/令牌
- [ ] PII/GDPR 合规检查（若涉及用户数据）

<!-- Validate: threat modeling过了？PII合规？ -->

---
## Quality Gate
<!-- Evidence-first: 每个需求可追溯到CHANGE.md的SC，ECC 替代 Superpowers 需求逐条对账 -->

- [ ] S1 用户角色全覆盖
- [ ] S2 版本切分 v1/v2/out 各≥1条
- [ ] S3 每个FR可独立测试
- [ ] S4 AC用Given/When/Then + 验证命令
- [ ] S5 非功能需求有数值
- [ ] [H]  S10 安全合规已覆盖
- [ ] 无[NEEDS CLARIFICATION]残留
