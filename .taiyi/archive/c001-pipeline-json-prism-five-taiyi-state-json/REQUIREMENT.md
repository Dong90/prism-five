---
phase: requirement
skill: taiyi-requirement
gate: auto
produces: REQUIREMENT.md
upstream: [change]
downstream: [design, ui-design]
---
<!-- phase:requirement skill:taiyi-requirement gate:auto est:20min produces:REQUIREMENT.md upstream:[change] downstream:[design,ui-design] cplx:[ALL]5steps +[M+]4 +[H]1 -->
# REQUIREMENT: 双路径状态读取

> **一句话**: 双路径状态读取

---

> ⛔ **Out of Scope — 本变更明确不覆盖以下事项**
> <!-- 放置在最顶部，让读者第一眼知道什么不做。与 Step 2 的 scope_out 内容一致无需重复详述，此处为硬性提醒 -->
> - 不删 pipeline.ts, 不改 CLI 行为
>
> 📌 *完整范围切分见下方 §Step 2 Scope Partitioning*

---

## Step 1: User Stories
> **[ALL]** Goal: 从用户视角说清需求 | Inputs: CHANGE.md §1, §2
<!-- Action: As a [角色] I want [功能] so that [价值]. 覆盖所有角色 -->

- **As a** 开发者, **I want** Pipeline 优先读 Taiyi state.json, **so that** 后续 change 基于 engineTruth 推进
- **As a** 开发者, **I want** Taiyi 不可用时 fallback pipeline.json, **so that** 现有功能不受影响

<!-- Validate: 所有用户角色都覆盖了？ -->

## Step 2: Scope Partitioning
> **[ALL]** Goal: 分版本切范围，防 TASK 阶段误判 | Inputs: CHANGE.md §2
<!-- Action: v1=本次必做, v2=下次, out=永不. 至少 v2+out 各 ≥1 条 -->

### v1（本次必做）

### v2（下次）

### out（永不）

<!-- Validate: v2 和 out 各 ≥ 1 条？v1 不包含 out 项？ -->

## Step 3: Functional Requirements
> **[ALL]** Goal: 拆成可测试的功能点 | Inputs: Step1
<!-- Action: FR-XX编号，分模块。涉及UI标注(UI)→触发Phase4 -->

### orchestrator
- **FR-01**: 读取 pipeline 状态

<!-- Validate: 每个FR可独立测试？编号连续？ -->

## Step 4: Acceptance Criteria
> **[ALL]** Goal: 每个FR都有客观验收标准 | Inputs: Step3
<!-- Action: Given/When/Then，AC-XX对应FR-XX。verify=可执行验证命令 -->

- [ ] **AC-01**: Given state.json存在 When Pipeline初始化 Then 使用Taiyi state
  - **验证**: npx vitest run packages/orchestrator
- [ ] **AC-02**: Given state.json不存在 When Pipeline初始化 Then fallback pipeline.json
  - **验证**: npx vitest run packages/orchestrator

<!-- Validate: 每个AC可独立验收？Given/When/Then完整？验证命令可执行？ -->

## Step 5: Non-Functional Requirements
> **[ALL]** Goal: 性能/安全/可用性有硬指标 | Inputs: Step2
<!-- Action: NFR-XX编号，每个带数值 -->

### 性能
- **NFR-P01**: N/A
### 安全
- **NFR-S01**: N/A
### 可用性
- **NFR-A01**: N/A

<!-- Validate: 每个指标有具体数字？ -->

> 📎 **SSOT 规则**: NFR-S* 安全要求应基于 [CHANGE.md §Risks](CHANGE.md) 做非功能性拆解，不独立重评估。每条 NFR-S 应与 CHANGE 的 risks[] 可追溯。

## Step 6: Error & Rescue Map
> **[MEDIUM+]** Goal: 每个错误都有名字和恢复路径 | Inputs: Step2+3
<!-- Action: 触发条件→捕获位置→用户看到→恢复路径 -->

| 错误类型 | 触发 | 捕获 | 用户看到 | 恢复 |
|---------|------|------|---------|------|
| N/A | 无 | _commander_ | Pipeline: no state found. Run prism new | 重试 |

<!-- Validate: 所有可能的错误都有名字？恢复路径可执行？ -->

## Step 7: Shadow Path Analysis
> **[MEDIUM+]** Goal: 每条数据流覆盖四路径 | Inputs: Step5
<!-- Action: Happy/Nil/Empty/UpstreamErr 逐条标注 -->

无paths 数据（MEDIUM+ 可跳过此步）_

<!-- Validate: 核心流程都覆盖了四路径？ -->

## Step 8: Non-Happy-Path Matrix
> **[MEDIUM+]** Goal: 边界和异常不遗漏 | Inputs: Step5+6
<!-- Action: 空值/超时/并发/权限/非法输入全覆盖 -->

| 场景 | 预期行为 |
|------|---------|
| 空输入返回错误 | N/A |

<!-- Validate: 典型边界(空/超/并发/权限)全覆盖？ -->

## Step 9: Dependencies
> **[MEDIUM+]** Goal: 外部依赖不阻塞 | Inputs: CHANGE.md §4
<!-- Action: 技术约束/第三方/跨团队+状态+风险 -->

| 依赖 | 类型 | 状态 | 风险 |
|------|------|------|------|
| vitest | 测试框架 | 已安装 | 无 |

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
- [ ] [M+] S6 Error/Rescue全覆盖 | PD#2
- [ ] [M+] S7 核心流程四路径 | PD#3
- [ ] [M+] S8 典型边界全覆盖
- [ ] [M+] S9 依赖关系已确认
- [ ] [H]  S10 安全合规已覆盖
- [ ] 无[NEEDS CLARIFICATION]残留
