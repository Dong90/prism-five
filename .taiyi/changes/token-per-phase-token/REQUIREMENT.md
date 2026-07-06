---
phase: requirement
skill: taiyi-requirement
gate: auto
produces: REQUIREMENT.md
upstream: [change]
downstream: [design, ui-design]
---
<!-- phase:requirement skill:taiyi-requirement gate:auto est:20min produces:REQUIREMENT.md upstream:[change] downstream:[design,ui-design] cplx:[ALL]5steps +[M+]4 +[H]1 -->
# REQUIREMENT: M15 Token 管理需求

> **一句话**: TokenBudget 模块提供 per-role token 追踪、超限拦截和使用分析

---

> ⛔ **Out of Scope — 本变更明确不覆盖以下事项**
> <!-- 放置在最顶部，让读者第一眼知道什么不做。与 Step 2 的 scope_out 内容一致无需重复详述，此处为硬性提醒 -->
> - 与 LLM provider 的实际 token API 集成
> - 跨 feature 趋势分析
> - UI 仪表盘
>
> 📌 *完整范围切分见下方 §Step 2 Scope Partitioning*

---

## Step 1: User Stories
> **[ALL]** Goal: 从用户视角说清需求 | Inputs: CHANGE.md §1, §2
<!-- Action: As a [角色] I want [功能] so that [价值]. 覆盖所有角色 -->

- **As a** 开发者, **I want** 每个 feature 的 token 消耗自动记录, **so that** 了解各 feature 的成本 (P0)
- **As a** AI Agent, **I want** 超配额时自动停止执行, **so that** 不会无限消耗 token 超出预算 (P0)
- **As a** PM, **I want** 查询各 feature 的 token 使用分布, **so that** 评估成本并优化预算分配 (P1)

<!-- Validate: 所有用户角色都覆盖了？ -->

## Step 2: Scope Partitioning
> **[ALL]** Goal: 分版本切范围，防 TASK 阶段误判 | Inputs: CHANGE.md §2
<!-- Action: v1=本次必做, v2=下次, out=永不. 至少 v2+out 各 ≥1 条 -->

### v1（本次必做）
- TokenBudget.track(slug,role,amount) 记录消耗
- TokenBudget.check(slug,role) 超限检查
- TokenBudget.usage(slug) 使用分析
- TokenBudget.bump(slug,amount) 追加配额
- pipeline.continue() 集成超限门禁

### v2（下次）
- CLI 交互界面（prism token status/scan —— M5 统一实现）
- Token 压缩编排（后续 change）

### out（永不）
- 与 LLM provider 的实际 token API 集成
- 跨 feature 趋势分析
- UI 仪表盘

<!-- Validate: v2 和 out 各 ≥ 1 条？v1 不包含 out 项？ -->

## Step 3: Functional Requirements
> **[ALL]** Goal: 拆成可测试的功能点 | Inputs: Step1
<!-- Action: FR-XX编号，分模块。涉及UI标注(UI)→触发Phase4 -->

### token-budget.ts
- **FR-T01**: track(slug,role,amount) 更新 pipeline.json tokenBudget.used
- **FR-T02**: check(slug,role) 比较 used vs quota, 超限返回 blocked+reason
- **FR-T03**: usage(slug) 返回 {total,byRole,quota}
- **FR-T04**: bump(slug,amount) 追加配额
- **FR-T05**: estimate(text) 启发式估算 token 数（字符数/4）
### pipeline.ts
- **FR-P01**: continue() 前调用 check(), 超限 → gate blocked

<!-- Validate: 每个FR可独立测试？编号连续？ -->

## Step 4: Acceptance Criteria
> **[ALL]** Goal: 每个FR都有客观验收标准 | Inputs: Step3
<!-- Action: Given/When/Then，AC-XX对应FR-XX。verify=可执行验证命令 -->

- [ ] **AC-01**: track() 写入 pipeline.json used 字段且可通过 readPipeline 读取
  - **验证**: 
- [ ] **AC-02**: check() 配额耗尽返回 {passed:false, reason:"token exceeded"}
  - **验证**: 
- [ ] **AC-03**: check() 配额充足返回 {passed:true}
  - **验证**: 
- [ ] **AC-04**: usage() 返回 per-role 消耗和配额
  - **验证**: 
- [ ] **AC-05**: bump() 追加配额后 check() 变为 passed
  - **验证**: 
- [ ] **AC-06**: pipeline.continue() 超限时 gate blocked
  - **验证**: 
- [ ] **AC-07**: npm test 通过，新增覆盖率 >= 80%
  - **验证**: 

<!-- Validate: 每个AC可独立验收？Given/When/Then完整？验证命令可执行？ -->

## Step 5: Non-Functional Requirements
> **[ALL]** Goal: 性能/安全/可用性有硬指标 | Inputs: Step2
<!-- Action: NFR-XX编号，每个带数值 -->

  ### 性能
  - **NFR-P01**: track() 操作 < 5ms（纯内存操作）
  
  

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
