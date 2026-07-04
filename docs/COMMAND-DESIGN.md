# Pentad 命令设计

> 132 个 Agent × 5 个角色 × 4 层金字塔
>
> 状态: 已讨论 / 待落地 (本文档为设计 spec，不含已落地代码)
>
> 适用版本: prism-five v0.4.x 规划

---

## 目录

1. [故事与比喻](#1-故事与比喻)
2. [设计哲学](#2-设计哲学)
3. [4 层金字塔](#3-4-层金字塔)
4. [L1 主链层 5 命令](#4-l1-主链层-5-命令)
5. [L2 阶段入口层 18 命令](#5-l2-阶段入口层-18-命令)
6. [L3 Agent 层 132 命令](#6-l3-agent-层-132-命令)
7. [横切命令 12 个](#7-横切命令-12-个)
8. [三种用户典型用法](#8-三种用户典型用法)
9. [pipeline.json 状态映射](#9-pipelinejson-状态映射)
10. [自动守护 Hook 设计](#10-自动守护-hook-设计)
11. [参考与对比](#11-参考与对比)
12. [待决策项](#12-待决策项)

---

## 1. 故事与比喻

Pentad 的 5 个角色，对应一支装修队的 5 个工种：

| 工种 | 角色 | 工作内容 |
|------|------|----------|
| **木工** | Prototyper（原型师 · Explorer） | 出设计图、出原型 |
| **水电工** | Builder（构建者 · Operator） | 埋线铺管、生产代码 |
| **监理** | Sweeper（收尾者 · Scout） | 检查哪里不达标 |
| **软装师** | Grower（增长者 · Analyst） | 家具配饰、数据增长 |
| **物业** | Maintainer（维护者 · Guardian） | 住进去后修修补补 |

每个工种需要不同工具（agent）。比如木工需要电锯、刨子、水平仪；水电工需要扳手、试电笔、压线钳。**132 个 agent = 132 把不同的工具**。

`prism` CLI 就是这支装修队长的**对讲机**——你通过对讲机下指令，队长自动调度对应的工种和工具。

---

## 2. 设计哲学

### 2.1 核心矛盾

- **用户不需要认识 132 把工具**——记不住，查不到，每次都得查文档
- **特定场景下又必须能调单个工具**——比如"我只想重新刨一下这块板"

### 2.2 解决方案：4 层金字塔

```
              用户可发现性 ↑
                         │
                         │     L0
                         │   说话就行 ─ "帮我贴地砖"
                         │   (自动 intent dispatch)
                ┌────────┴────────┐
                │       L1         │
                │   5 个总按钮    ─ 装修队长主用
                │   (主链/全自动) │
          ┌─────┴──────────────────┴─────┐
          │            L2                 │
          │      18 个细按钮      ─ 单独做一件事
          │      (按工种细分)            │
    ┌─────┴────────────────────────────────┴─────┐
    │                  L3                       │
    │        132 个工具直调       ─ 极客 / 自动化
    │        (完整 agent 工具箱)                │
    └──────────────────────────────────────────────┘
              横切：暂停 / 队列 / 状态 / halt / ...
                         │
              用户控制粒度 ↑ (越往下越细)
```

### 2.3 用户面 35 个，实际只用 5 个

L0（自然语言）自动 dispatch；L1 5 个主链覆盖 95% 场景；L2 18 个是 L1 的细颗粒；L3 132 个给极客与 CI/CD。

**用户只看到 L1 + L2 + 横切 = 35 个命令**。L3 加 `prism-agent` 前缀隔离，不是普通用户要记的。

---

## 3. 4 层金字塔

### L0 — 自然语言层（0 命令）

用户在聊天说：

```
"我想做用户导出报表功能"
"先把那段代码 review 一下"
"先试试 5% canary"
```

**Agent 自动意图识别**（参考 gstack router 模式）：

| 自然语言关键词 | dispatch 到 L1 |
|---------------|---------------|
| "做/想/加个/新建" | `feature` |
| "review/审查/检查" | `sweep` |
| "上/发布/部署/deploy" | `ship` |
| "测试/TDD/单元测试" | `build` 或 `test` (L2) |
| "分析/data/数据" | `grow` 或 `analyze` (L2) |
| "5%/灰度/canary" | L2 `canary` |

**实现层**：通过 Skill tool 的 description 自动匹配，不需要新增命令。

### L1 — 主链层（5 命令）

#### `prism feature <slug> [message]`

- 创建 feature + 跑完 Prototyper 全阶段
- 默认全自动，13 个 Prototyper agent 并发执行
- 输出 `.pentad/features/<slug>/raw/`
- 通过 Quality self-check 后自动 `gate.prototype_approved = true`
- 失败重试 3 次或 escalate

#### `prism build <slug>`

- 读 raw/ 产出 → 跑 Builder 27 个 agent
- 强制 TDD（`pentad-evidence-collector` 自动核查）
- 输出 `.pentad/features/<slug>/built/`
- 通过 `npm run build + test + lint` 三件套后自动 `gate.build_reviewed = true`

#### `prism sweep <slug>`

- 跑 Sweeper 22 个 agent
- 输出 `.pentad/features/<slug>/swept/`
- 自动 gate 6 项必须 PASS（lint / typecheck / test / sec-scan / bundle / complexity）
- 失败分类：critical/high 立即 halt；medium 写 SWEEP.md；low 入 queue

#### `prism grow <slug>`

- 跑 Grower 36 个 agent
- 样本不够自动 `grow-idle` 等待，不擅自决策
- 不显著的 A/B 自动 escalate，不强推结论
- 输出 `.pentad/features/<slug>/grown/`

#### `prism ship <slug>`

- 跑 Maintainer 21 个 agent
- release-check → canary (5% → 25% → 100%) → ship → operate 初始化
- 失败自动 rollback + 写 INCIDENT.md
- 成功后自动 `close` 归档

### L2 — 阶段入口层（18 命令）

按角色分配，每个角色 3-4 个细颗粒入口。

#### Prototyper（4 命令）

| 命令 | 用途 | 触发 agent |
|------|------|-----------|
| `prism discover` | brainstorm + research + sketch | 调研类 8 个 agent 并发 |
| `prism prototype` | runnable code + PRD + tech spec | 实现类 5 个 agent |
| `prism prd` | 单独补 PRD | `pentad-visual-storyteller` 等 |
| `prism discard` | 主动放弃（high discard 路径） | 标记 status=discarded |

#### Builder（5 命令）

| 命令 | 用途 | 触发 agent |
|------|------|-----------|
| `prism engineer` | plan-mode task 拆分 + 选型 | `pentad-planner` + `pentad-tool-evaluator` |
| `prism build` | (同 L1) 实际生产代码 | 实施类 22 agent |
| `prism test` | TDD 红绿证据 | `pentad-test-api` + `pentad-evidence-collector` |
| `prism benchmark` | 性能基线 | `pentad-performance-benchmarker` |
| `prism doc` | 文档单独写 | `pentad-tech-writer` |

#### Sweeper（4 命令）

| 命令 | 用途 | 触发 agent |
|------|------|-----------|
| `prism review` | 人工可读代码审查 | `pentad-reviewer` |
| `prism inspect` | 6 项自动 gate | `pentad-integration-checker` + 等 |
| `prism audit` | 跨 feature 审计 | `pentad-nyquist-auditor` + 等 12 个 |
| `prism deprecate` | 标记 deprecated | `pentad-deprecator` + `pentad-version-sunset` |

#### Grower（3 命令）

| 命令 | 用途 | 触发 agent |
|------|------|-----------|
| `prism analyze` | 多维度数据分析 | 维度类 10 个 agent |
| `prism experiment` | A/B 实验 | `pentad-experiment-tracker` + `pentad-experiment-designer` + `pentab-stats-tester` |
| `prism evolve` | 跨角色发 PR | `pentad-evolver` + `pentad-feedback-synthesizer-g` |

#### Maintainer（2 命令）

| 命令 | 用途 | 触发 agent |
|------|------|-----------|
| `prism ship` | (同 L1) 真发布 | 部署类 13 agent |
| `prism operate` | 运维规划（监控/告警/成本） | `pentad-monitor-setup` + `pentad-cost-optimizer` + `pentad-backup-manager` |

### L3 — Agent 层（132 命令）

直调式接口，前缀 `prism-agent` 隔离：

```bash
prism-agent pentad-mobile-app-builder "<task>"
prism-agent pentad-security-engineer "<audit scope>"
prism-agent pentad-growth-hacker "<campaign>"
```

#### 132 个 agent 分组（共 5 角色 + 跨角色）

详见 [§6](#6-l3-agent-层-132-命令)。

---

## 4. L1 主链层 5 命令详解

### 4.1 公用 flag

所有 L1 + L2 命令支持：

| flag | 作用 |
|------|------|
| `--dry-run` | 只打印执行计划，不实际跑 agent |
| `--step` | 每 step 暂停，等用户回车继续 |
| `--no-retry` | 失败立刻停，不重试 |
| `--human` | 人工每步确认（极谨慎模式） |
| `--agents <list>` | 只跑指定 agent（如 `--agents pentad-rapid-prototyper,pentad-ux-architect`） |

### 4.2 `prism feature <slug> [message]`

**输入**：slug（kebab-case, 小写连字符）+ 可选自然语言描述

**输出**：

```
✓ Feature "user-auth" created
✓ Running Prototyper (13 agents)...

[1/13] pentad-trend-researcher      → raw/RESEARCH.md (3 references)
[2/13] pentad-ux-researcher         → raw/RESEARCH_USER.md
[3/13] pentad-ux-architect          → raw/SKETCH.md (3 variants)
[4/13] pentad-ui-designer           → raw/proto/visual.png
[5/13] pentad-rapid-prototyper      → raw/proto/run-demo.ts (✓ runnable)
[6/13] pentad-tech-writer           → raw/PRD.md
[7/13] pentad-visual-storyteller    → raw/STORY.md
[8/13] pentad-image-prompt-engineer → raw/proto/screens.md
[9/13] pentad-office-hours          → DECISION: WORTH BUILDING (yes)
[10/13] pentad-pattern-mapper       → raw/PATTERNS.md (2 reuse candidates)
[11/13] pentad-codebase-mapper      → raw/CODEBASE_MAP.md
[12/13] pentad-feedback-synthesizer → raw/FEEDBACK_BACKLOG.md
[13/13] pentad-whimsy-injector      → raw/DELIGHT_NOTES.md

✓ Quality self-check passed (6/6)
✓ gate.prototype_approved = true
→ Next: prism build user-auth
```

**状态变化**：

- `.pentad/pipeline.json` 新增 `features.user-auth`
- `feature.status = prototype_done`
- `feature.currentRole = prototyper → builder`
- `stageHistory[0] = {role: prototyper, completedAt: now}`
- `stageHistory[1] = {role: builder, enteredAt: now}`
- `gates.prototype_approved = true`

**失败处理**：

- 单 agent 失败 → 重试 3 次（同 agent）
- 重试用尽 → escalate（不阻塞后续 agent，但失败记录到 SWEEP.md）
- Quality self-check 失败 → write 但不设 gate，等 Sweeper 阶段发现

### 4.3 `prism build <slug>`

**输入**：slug（必须存在且当前 role=builder）

**输出**：

```
▶ Building "user-auth" (TDD mode)

[1/27] pentad-planner              → built/TASK.md (12 slices)
[2/27] pentad-tech-writer          → built/API.md (OpenAPI 3.1)
[3/27] pentad-tool-evaluator       → PICKED: zod 3.x for validation
[4/27] pentad-frontend-developer   → src/auth/login.tsx (RED ✓)
[5/27] pentad-frontend-developer   → src/auth/login.tsx (GREEN ✓)
[6/27] pentad-frontend-developer   → src/auth/login.tsx (REFACTORED ✓)
... (TDD 循环)
[15/27] pentad-backend-architect  → src/api/auth.ts (routes ✓)
[16/27] pentad-test-api           → tests/auth.test.ts (4 cases)
[17/27] pentad-integration-checker → tests/integration/auth.test.ts
[18/27] pentad-evidence-collector → built/EVIDENCE.md (RED→GREEN captured)
[19/27] pentad-workflow-optimizer → built/WORKFLOW.md
[20/27] pentad-performance-benchmarker → built/PERF.md (p95=185ms, target ≤200)
[21/27] pentad-lsp-index-engineer → built/LSP_READY
[22/27] pentad-cultural-intelligence → src/i18n/auth.zh-CN.ts
[23/27] pentad-build-ui-spec        → built/UI_SPEC.md
[24/27] pentad-test-results-analyzer → tests/coverage.xml (82%)
[25/27] pentad-debug-builder        → built/RETRY_LOG.md (0 retries)
[26/27] pentad-senior-developer    → built/SENIOR_NOTES.md
[27/27] pentad-data-engineer-g     → built/DATA_SCHEMA.md

✓ npm run build  → exit 0
✓ npm test        → 47/47 PASS, coverage 82%
✓ npm run lint   → clean
✓ gate.build_reviewed = true
→ Next: prism sweep user-auth
```

**硬要求**：

- 没有对应测试的代码 → 自动拒绝
- coverage <80% → 自动 retry（最多 3 轮）
- build/test/lint 三件套任一失败 → halt 到下次手动

### 4.4 `prism sweep <slug>`

```
▶ Reviewing "user-auth"

[1/22] pentad-reviewer             → swept/REVIEW.md (correctness 100%)
[2/22] pentad-security-engineer    → swept/SECURITY.md (STRIDE, OWASP)
[3/22] pentad-compliance-checker   → swept/COMPLIANCE.md
[4/22] pentad-accessibility-auditor → swept/A11Y.md (WCAG 2.1 AA)
[5/22] pentad-reality-checker      → REALITY ✓ (no fake claims)
[6/22] pentad-test-results-analyzer → tests satisfied: 47/47
[7/22] pentad-integration-checker  → integration PASS
[8/22] pentad-nyquist-auditor      → coverage/n-requirements gap: 0
[9/22] pentad-doc-verifier         → README ✓, API.md ✓
[10/22] pentad-eval-auditor        → rating 4.2/5 ≥ 3.5 threshold
[11/22] pentad-user-profiler        → personas-match: 0.84
[12/22] pentad-agent-trust         → identity trust: PASS
[13/22] pentad-security-auditor   → vulns: 0 critical, 0 high
[14/22] pentad-ui-auditor          → UI consistency: PASS
[15/22] pentad-physical-compat     → compat matrix ✓
[16/22] pentad-data-consolidation → dedup: 0 redundant
[17/22] pentad-debugger           → 0 latent issues
[18/22] pentad-debug-session-manager → session clean
[19/22] pentad-fix-build-issue    → no fixes needed (read-only)
[20/22] pentad-deprecator         → (optional) mark old auth method
[21/22] pentad-version-sunset     → scheduled: 2026-08-15
[22/22] pentad-financial-tracker   → cost OK

INSPECT 6 项:
  [✓] lint clean
  [✓] typecheck clean
  [✓] test 100% pass
  [✓] sec-scan clean
  [✓] bundle 142kB (target ≤200kB)
  [✓] cyclomatic 4.2 (target ≤5)

→ gate.sweep_passed = true
→ Next: prism grow user-auth
```

**失败分级**：
- critical/high → halt + 升级 builder
- medium → 写 SWEEP.md 不阻塞
- low → 入 queue 延后

### 4.5 `prism grow <slug>`

```
▶ Analyzing "user-auth" (live since 7d)

ANALYZE 多维度:
[1/36] pentad-analytics-reporter     → grown/ANALYZE_USAGE.md (DAU 1.2k, retention 71%)
[2/36] pentad-support-analytics      → grown/ANALYZE_SUPPORT.md (tickets 14/wk)
[3/36] pentad-finance-tracker        → grown/ANALYZE_FIN.md (ARR delta +$3k)
[4/36] pentad-sales-extractor        → grown/SALES_IMPACT.md
[5/36] pentad-user-researcher-g      → grown/USER_RESEARCH.md (3 themes)
[6/36] pentad-feedback-collector     → grown/FEEDBACK.md (47 items)
[7/36] pentad-data-engineer-g       → grown/DATA_PIPELINE.md (ETL idempotent)
[8/36] pentad-data-consolidator     → consolidated 4 sources
[9/36] pentad-lineage-tracker       → grown/LINEAGE.gv
[10/36] pentad-dq-scorer            → grown/DQ.md (gold 99.94%)
[11/36] pentad-usage-tracker        → grown/USAGE.md
[12/36] pentad-quality-monitor      → grown/QUALITY.md
[13/36] pentad-report-distributor   → grown/REPORT.md
[14/36] pentad-feedback-synthesizer-g → key themes: 5

EXPERIMENT:
[15/36] pentad-experiment-tracker   → grown/EXPERIMENT.md
[16/36] pentad-experiment-designer  → hypothesis: SSO 提升留存
[17/36] pentab-stats-tester        → required n=540, current=612 (POWER OK)

EVOLVE:
[18/36] pentad-evolver              → PR #234 to Builder queue
[19/36] pentad-discovery-engine     → 3 new needs

GROW:
[20/36] pentad-sprint-prioritizer   → ranked 8 backlog items
[21/36] pentad-growth-hacker        → 3 campaign concepts
[22/36] pentad-content-creator      → 5 content drafts
[23/36] pentad-social-strategist    → channels: 4 prioritized
[24/36] pentad-app-store-optimizer  → ASO 14 keywords (3 high-value)
[25/36] pentad-distribute-instagram → scheduled
[26/36] pentad-distribute-twitter    → scheduled
[27/36] pentad-distribute-reddit    → scheduled
[28/36] pentad-distribute-tiktok     → scheduled
[29/36] pentad-distribute-xiaohongshu → scheduled
[30/36] pentad-distribute-zhihu      → scheduled
[31/36] pentad-distribute-wechat     → scheduled
[32/36] pentad-brand-guardian        → brand consistency 100%
[33/36] pentad-developer-advocate   → 2 dev topics
[34/36] pentad-storyteller           → updated story
[35/36] pentad-whimsy-2              → delight plan
[36/36] pentad-nudge-engine          → 2 behavioral nudges

→ gate.analyze_complete = true
→ Next: prism ship user-auth
```

**重要限制**：
- 样本不够 → 自动 `grow-idle`，不擅自决策
- A/B 不显著 → escalate，不推结论
- 等待时长：默认 7d live，可调

### 4.6 `prism ship <slug>`

```
▶ Shipping "user-auth"

RELEASE-CHECK:
[1/21] pentad-verifier            → CHANGELOG ✓ version ✓
[2/21] pentad-doc-writer          → README synced
[3/21] pentad-rollback-engine     → rollback script generated
[4/21] pentad-monitor-setup       → Prometheus rule 12, Grafana dash 3
[5/21] pentad-cost-optimizer      → projected $0.12/h
[6/21] pentad-backup-manager      → GPG backup verified

CANARY 5%:
[7/21] pentad-canary-controller   → 5% for 30min
[8/21] pentad-monitor-setup       → error rate 0.8% (target <1%) ✓
[9/21] pentad-monitor-setup       → p95 178ms (target <200) ✓

CANARY 25%:
[10/21] pentad-canary-controller  → 25% for 30min
[11/21] → metrics still OK

FULL ROLLOUT:
[12/21] pentad-devops-automator   → merge main + tag v1.4.0
[13/21] pentad-executor-m         → deploy to prod
[14/21] pentad-infra-maintainer   → DNS switch

OPERATE:
[15/21] pentad-exec-summary       → weekly summary ready
[16/21] pentad-runbook-generator  → runbook.md generated
[17/21] pentad-cost-optimizer     → under budget

INCIDENT HANDLING (自动):
[18/21] pentad-debugger-m         → active
[19/21] pentad-debug-session-m   → ready
[20/21] pentad-code-fixer-m      → ready

CLOSE:
[21/21] pentad-learnings-curator  → LEARNINGS.md updated + queued next feature

✓ Feature LIVE in production
✓ gate.release_approved = true
✓ Auto-close + dequeue next
```

**回滚机制**：

- canary 任何指标异常 → 立即 0% 流量 + 写 INCIDENT.md
- rollback 脚本失败 → halt（绝不重试）

---

## 5. L2 阶段入口层 18 命令

详见 [§3 L2 阶段入口层](#l2--阶段入口层-18-命令) 表格。每个命令的输入输出与 L1 同名命令**不一致**——L2 是细颗粒入口，不是完整阶段。

### 5.1 Prototyper L2

#### `prism discover`
- 仅跑调研类 8 agent（trend / ux-researcher / feedback-synthesizer / office-hours / pattern-mapper / codebase-mapper / whimsy-injector）
- 输出 `raw/RESEARCH.md` + `raw/SKETCH.md`
- 不写代码

#### `prism prototype`
- 仅跑代码实现类 5 agent（rapid-prototyper / ux-architect / ui-designer / image-prompt-engineer / visual-storyteller）
- 输出 `raw/proto/` 可运行代码

#### `prism prd`
- 单独产出 PRD（用 `pentad-tech-writer`）
- 适用"已经调研好，只缺 PRD"场景

#### `prism discard`
- 主动停止不进入下一阶段
- 写 `raw/DISCARD_REASON.md`
- 重设 `feature.status = discarded`

### 5.2 Builder L2

#### `prism engineer`
- plan-mode 模式：只跑 `pentad-planner` + `pentad-tool-evaluator`
- 输出 `built/TASK.md` + `built/PICKS.md`
- 不写代码

#### `prism build`
- 与 L1 同名（细跑实际生产代码的 22 个 agent）
- 区别于 L1 `prism build` —— L2 的 build 是 Builder 阶段内单跑实施类

#### `prism test`
- 仅跑测试相关：`pentad-test-api` + `pentad-evidence-collector` + `pentad-test-results-analyzer`
- 强制 TDD 红绿证据

#### `prism benchmark`
- 仅 `pentad-performance-benchmarker`
- 写 `built/PERF.md`

#### `prism doc`
- 仅 `pentad-tech-writer`
- 输出 API doc / JSDoc / README

### 5.3 Sweeper L2

#### `prism review`
- 仅 `pentad-reviewer`
- 输出人工可读的 `swept/REVIEW.md`

#### `prism inspect`
- 仅 `pentad-integration-checker` + 等 6 项自动 gate
- 极快，秒级反馈

#### `prism audit`
- 跨 feature 审计（不止当前 feature）
- 涉及 `pentad-nyquist-auditor` + `pentad-doc-verifier` + `pentad-eval-auditor` + 等 12 个 agent

#### `prism deprecate`
- 标 deprecated + 迁移指南
- 涉及 `pentad-deprecator` + `pentad-version-sunset`

### 5.4 Grower L2

#### `prism analyze`
- 多维数据分析 10 agent
- 不启动 A/B

#### `prism experiment`
- 仅 A/B 实验设计 + 启动 + 显著性检验
- 不出 PR，不入 queue

#### `prism evolve`
- 仅跨角色发 PR 给 builder 队列
- 等同 `handoff builder`

### 5.5 Maintainer L2

#### `prism ship`
- 与 L1 同名（细跑实际发布的 13 个 agent）
- 不含 canary（默认 full rollout，可 `--canary` 开启）

#### `prism operate`
- 仅运维规划 5 个 agent（monitor-setup / cost-optimizer / backup-manager / exec-summary / runbook-generator）

---

## 6. L3 Agent 层 132 命令

### 6.1 总览

132 个 agent 全部用 `prism-agent` 前缀：

```bash
prism-agent <agent-name> [args]
```

| 角色 | agent 数 |
|------|----------|
| Prototyper | 13 |
| Builder | 27 |
| Sweeper | 22 |
| Grower | 36 |
| Maintainer | 21 |
| 跨角色 | 13 |
| **总计** | **132** |

### 6.2 Prototyper（13 个）

| # | agent | 工作 | 触发命令 |
|---|-------|------|----------|
| 1 | `pentad-rapid-prototyper` | 3 天 MVP + analytics day 1 | `prototype` |
| 2 | `pentad-ux-architect` | 信息架构 / 原型 | `discover` / `prototype --step /sketch` |
| 3 | `pentad-ux-researcher` | 用户研究 | `discover` |
| 4 | `pentad-ui-designer` | UI 设计 | `prototype --step /sketch` |
| 5 | `pentad-visual-storyteller` | 视觉叙事 | `feature` |
| 6 | `pentad-image-prompt-engineer` | 出图 prompt | `prototype` |
| 7 | `pentad-inclusive-visuals-specialist` | 包容性视觉 | `prototype` |
| 8 | `pentad-whimsy-injector` | 乐趣细节 | `discover` |
| 9 | `pentad-trend-researcher` | 趋势调研 | `discover` |
| 10 | `pentad-feedback-synthesizer` | 反馈综合 | `discover` |
| 11 | `pentad-office-hours` | 值不值得做 | `discover` |
| 12 | `pentad-pattern-mapper` | 复用模式 | `discover` |
| 13 | `pentad-codebase-mapper` | 代码库制图 | `discover` |

### 6.3 Builder（27 个）

| # | agent | 工作 | 触发命令 |
|---|-------|------|----------|
| 1 | `pentad-frontend-developer` | 前端开发 | `build --sub frontend` |
| 2 | `pentad-backend-architect` | 后端架构 | `build --sub backend` |
| 3 | `pentad-mobile-app-builder` | 移动端原生 | `build --sub mobile` |
| 4 | `pentad-data-engineer` | ETL / 数据管道 | `build --sub data` |
| 5 | `pentad-ai-engineer` | AI/LLM | `build --sub ai` |
| 6 | `pentad-senior-developer` | 高级开发 | `build --sub complex` |
| 7 | `pentad-tech-writer` | API doc / JSDoc | `doc` |
| 8 | `pentad-autonomous-optimization-architect` | 自动优化 | `build` 性能优化 |
| 9 | `pentad-lsp-index-engineer` | LSP 索引 | `build` 工具链 |
| 10 | `pentad-metal-engineer` | macOS Metal | `build --sub metal` |
| 11 | `pentad-visionos-engineer` | visionOS | `build --sub visionos` |
| 12 | `pentad-xr-immersive-developer` | XR 沉浸 | `build --sub xr` |
| 13 | `pentad-xr-cockpit` | XR 互动 | `build --sub xr-cockpit` |
| 14 | `pentad-xr-interface-architect` | XR 接口 | `build --sub xr-ui` |
| 15 | `pentad-terminal-integration` | CLI/terminal | `build` CLI |
| 16 | `pentad-cultural-intelligence` | i18n / 跨文化 | `build --sub i18n` |
| 17 | `pentad-planner` | 任务拆分 | `engineer` |
| 18 | `pentad-executor` | 实施代理 | `build` |
| 19 | `pentad-build-ux-arch` | 信息架构 (build) | `build` |
| 20 | `pentad-build-ui-spec` | UI spec (build) | `build` |
| 21 | `pentad-performance-benchmarker` | 性能基线 | `benchmark` |
| 22 | `pentad-test-api` | API 测试 | `test --sub api` |
| 23 | `pentad-evidence-collector` | TDD 红绿证据 | `test` |
| 24 | `pentad-tool-evaluator` | 选型决策 | `engineer` |
| 25 | `pentad-workflow-optimizer` | 流程优化 | `build` |
| 26 | `pentad-pattern-finder` | 复用查询 | `engineer` |
| 27 | `pentad-debug-builder` | 失败重试 | `build --on-fail` |

### 6.4 Sweeper（22 个）

| # | agent | 工作 | 触发命令 |
|---|-------|------|----------|
| 1 | `pentad-reviewer` | 人工可读代码审查 | `review` |
| 2 | `pentad-security-engineer` | STRIDE / OWASP | `audit --scope security` |
| 3 | `pentad-compliance-checker` | 合规 (PCI/HIPAA/SOC2) | `audit --scope compliance` |
| 4 | `pentad-accessibility-auditor` | WCAG 2.1 | `audit --scope a11y` |
| 5 | `pentad-reality-checker` | 真伪检验 | `review` |
| 6 | `pentad-test-results-analyzer` | 测试剖析 | `review` |
| 7 | `pentad-integration-checker` | 集成校验 | `inspect` |
| 8 | `pentad-nyquist-auditor` | 覆盖度 | `audit` |
| 9 | `pentad-doc-verifier` | 文档验证 | `audit --scope docs` |
| 10 | `pentad-eval-auditor` | 评估审计 | `audit` |
| 11 | `pentad-user-profiler` | 用户档案 | `audit` |
| 12 | `pentad-agent-trust` | AI 代理可信度 | `audit --scope trust` |
| 13 | `pentad-security-auditor` | 安全审计 | `audit --scope security` |
| 14 | `pentad-ui-auditor` | UI 一致性 | `audit --scope ui` |
| 15 | `pentad-data-consolidation` | 数据去重 | `sweep --step /clean` |
| 16 | `pentad-physical-compat` | 物理兼容 | `inspect` |
| 17 | `pentad-financial-tracker` | 成本审计 | `audit --scope cost` |
| 18 | `pentad-debugger` | 调试 | `sweep --step /review` |
| 19 | `pentad-debug-session-manager` | 调试会话管理 | `sweep` |
| 20 | `pentad-fix-build-issue` | 修复建议 | `sweep --step /clean` |
| 21 | `pentad-deprecator` | deprecated 标记 | `deprecate` |
| 22 | `pentad-version-sunset` | 版本 sunset 调度 | `deprecate` |

### 6.5 Grower（36 个）

| # | agent | 工作 | 触发命令 |
|---|-------|------|----------|
| 1 | `pentad-analytics-reporter` | 数据报告 | `analyze` |
| 2 | `pentad-support-analytics` | 支持侧分析 | `analyze` |
| 3 | `pentad-finance-tracker` | 财务追踪 | `analyze` |
| 4 | `pentad-sales-extractor` | 销售数据提取 | `analyze` |
| 5 | `pentad-experiment-tracker` | 实验追踪 | `experiment` |
| 6 | `pentad-growth-hacker` | 增长黑客 | `grow` |
| 7 | `pentad-app-store-optimizer` | ASO | `aso` |
| 8 | `pentad-content-creator` | 内容创作 | `distribute` |
| 9 | `pentad-social-strategist` | 社媒策略 | `distribute` |
| 10 | `pentad-instagram-curator` | Instagram | `distribute --platform instagram` |
| 11 | `pentad-twitter-engager` | Twitter | `distribute --platform twitter` |
| 12 | `pentad-reddit-builder` | Reddit | `distribute --platform reddit` |
| 13 | `pentad-tiktok-strategist` | TikTok | `distribute --platform tiktok` |
| 14 | `pentad-xiaohongshu` | 小红书 | `distribute --platform xhs` |
| 15 | `pentad-zhihu` | 知乎 | `distribute --platform zhihu` |
| 16 | `pentad-wechat-official` | 公众号 | `distribute --platform wechat` |
| 17 | `pentad-brand-guardian` | 品牌资产 | `brand` |
| 18 | `pentad-developer-advocate` | 开发者推广 | `devrel` |
| 19 | `pentad-storyteller` | 故事化 | `grow` |
| 20 | `pentad-whimsy-2` | 趣味注入 | `grow` |
| 21 | `pentad-nudge-engine` | 行为驱动 | `grow` |
| 22 | `pentad-sprint-prioritizer` | 优先级 | `grow` |
| 23 | `pentad-experiment-designer` | 实验设计 | `experiment` |
| 24 | `pentab-stats-tester` | 显著性检验 | `experiment` |
| 25 | `pentad-evolver` | 演化 PR | `evolve` |
| 26 | `pentad-discovery-engine` | 需求发现 | `grow` |
| 27 | `pentad-report-distributor` | 报告分发 | `grow` |
| 28 | `pentad-feedback-synthesizer-g` | 反馈综合 (g) | `grow` |
| 29 | `pentad-data-engineer-g` | ETL (g) | `grow` |
| 30 | `pentad-data-consolidator` | 数据合并 | `grow --step /analyze` |
| 31 | `pentad-lineage-tracker` | 数据血统 | `grow` |
| 32 | `pentad-dq-scorer` | DQ 评分 | `grow` |
| 33 | `pentad-user-researcher-g` | 用户研究 (g) | `analyze` |
| 34 | `pentad-feedback-collector` | 反馈收集 | `analyze --dim feedback` |
| 35 | `pentad-usage-tracker` | 使用追踪 | `analyze --dim usage` |
| 36 | `pentad-quality-monitor` | 质量监控 | `analyze --dim quality` |

### 6.6 Maintainer（21 个）

| # | agent | 工作 | 触发命令 |
|---|-------|------|----------|
| 1 | `pentad-infra-maintainer` | 基础设施运维 | `operate` |
| 2 | `pentad-devops-automator` | DevOps 自动化 | `ship` |
| 3 | `pentad-support-responder` | 客户支持响应 | (独立响应命令) |
| 4 | `pentad-exec-summary` | 高管摘要 | `operate` |
| 5 | `pentad-doc-writer` | 文档写手 | `maintain --step /close` |
| 6 | `pentad-debugger-m` | 调试 (m) | `incident` |
| 7 | `pentad-debug-session-m` | 调试会话 (m) | `incident` |
| 8 | `pentad-code-fixer-m` | 代码修复 (m) | `incident` |
| 9 | `pentad-verifier` | 发布前验证 | `ship` |
| 10 | `pentad-orchestrator-agent` | 编排 agent | `status --verbose` |
| 11 | `pentad-executor-m` | 执行 (m) | `ship` |
| 12 | `pentad-integration-checker-m` | 集成 (m) | `ship` |
| 13 | `pentad-canary-controller` | 灰度控制 | `canary` |
| 14 | `pentad-rollback-engine` | 回滚 | `rollback` |
| 15 | `pentad-monitor-setup` | 监控初始化 | `operate` |
| 16 | `pentad-cost-optimizer` | 成本优化 | `operate` |
| 17 | `pentad-backup-manager` | 加密备份 | `operate` |
| 18 | `pentad-runbook-generator` | runbook 生成 | `operate` |
| 19 | `pentad-postmortem-writer` | postmortem | `postmortem` |
| 20 | `pentad-learnings-curator` | LEARNINGS 更新 | `learnings` |
| 21 | `pentad-halt-controller` | 全停控制器 | `halt` |

### 6.7 跨角色（13 个）

| # | agent | 工作 | 触发命令 |
|---|-------|------|----------|
| 1 | `pentad-orchestrator` | 顶层编排 | `status` |
| 2 | `pentad-pm-senior` | 高级 PM | `pm` |
| 3 | `pentad-project-shepherd` | 项目牧羊 | `shepherd` |
| 4 | `pentad-studio-ops` | 工作室运营 | `studio-ops` |
| 5 | `pentad-studio-producer` | 工作室制作 | `produce` |
| 6 | `pentad-onboard` | 入门引导 | `onboard` |
| 7 | `pentad-intake-new` | 新建 feature | `new` |
| 8 | `pentad-queue-mgr` | 队列管理 | `queue` |
| 9 | `pentad-next-mgr` | 出队 | `next` |
| 10 | `pentad-pause-mgr` | 暂停 | `pause` |
| 11 | `pentad-resume-mgr` | 恢复 | `resume` |
| 12 | `pentad-cancel-mgr` | 取消 | `cancel` |
| 13 | `pentad-promote-mgr` | 产品生命周期 | `promote` |

### 6.8 L3 使用接口

```bash
# 直调单个 agent
$ prism-agent pentad-security-engineer "审计 src/auth"

# 列所有 agent
$ prism-agent list

# 按角色过滤
$ prism-agent list --role prototyper

# 看 agent 完整 prompt
$ prism-agent pentad-rapid-prototyper --prompt
```

---

## 7. 横切命令 12 个

任何阶段都能调，独立于 role 流转。

| # | 命令 | 作用 | 关键状态 |
|---|------|------|---------|
| 1 | `prism new <slug>` | 创建新 feature | `features[slug]`, `activeFeature`, `queue` |
| 2 | `prism status [--verbose]` | 看当前状态 | 读 pipeline.json |
| 3 | `prism list [--all]` | 列所有 features | 读 pipeline.json |
| 4 | `prism queue` | 队列管理（add/remove/priority） | `state.queue` |
| 5 | `prism next` | 出队下一 feature | `state.queue` |
| 6 | `prism pause` | 暂停，写 HANDOFF.md | `.pentad/HANDOFF.md` |
| 7 | `prism resume` | 读 HANDOFF.md 恢复 | 读 `.pentad/HANDOFF.md` |
| 8 | `prism cancel` | 取消当前 feature | 清理 artifacts |
| 9 | `prism promote <stage>` | 推进产品生命周期 | `state.productStage` |
| 10 | `prism escalate <to-role> --reason` | 升级到某角色 | 写 INCIDENT.md |
| 11 | `prism halt --reason` | P0 全停 | `state.halt = true` |
| 12 | `prism docs-sync <feature>` | 文档同步 | 更新 CHANGELOG |

---

## 8. 三种用户典型用法

### 8.1 小白用户：「我就想做完」

```bash
# 一句话搞定，自动 dispatch
$ prism feature user-auth "用户能用邮箱密码登录"

# 完成；不需要看过程
✓ Feature LIVE
```

**只用 L1**，剩下的都靠底层自动。

### 8.2 资深用户：「我懂每一步」

```bash
# 先调研
$ prism discover
# 出设计稿
$ prism prototype
# 通过
$ prism approve prototype_approved
# 进入 Builder
$ prism build --step            # 每步暂停
# 仅跑测试
$ prism test
# 单独审查
$ prism sweep --review
# 5% 灰度
$ prism ship --canary 5 --duration 30m
```

**用 L1 + L2 + 横切**组合。

### 8.3 自动化用户（CI/CD 程序员）

```yaml
# .github/workflows/e2e.yml
- name: Security audit
  run: prism-agent pentad-security-engineer "./src"

# .github/workflows/deploy.yml
- name: Canary deploy
  run: prism ship mybot --canary 10 --duration 30m

- name: Rollback on metrics
  if: failure()
  run: prism halt --reason "metrics abnormal"
```

**用 L3 + L1 的 ship/canary/halt**做脚本化。

---

## 9. pipeline.json 状态映射

### 9.1 Feature 状态机

```
                    draft
                      │
              prism feature
                      │
                      ▼
            prototype_done
              gate.prototype_approved
                      │
              prism continue (auto)
                      ▼
                building
              gate.build_reviewed
                      │
              prism continue (auto)
                      ▼
                sweeping
              gate.sweep_passed
                      │
              prism continue (auto)
                      ▼
                growing
              gate.analyze_complete
                      │
              prism continue (auto)
                      ▼
              releasing
              gate.release_approved (human)
                      │
              prism continue
                      ▼
                   live
                    │
              prism close
                    ▼
                  closed
```

### 9.2 各命令对状态的影响

| 命令 | 改 feature.status | 改 currentRole | 改 gates | 改 stageHistory |
|------|-------------------|----------------|----------|------------------|
| `prism new` | draft | prototyper | — | 推入 prototyper |
| `prism feature` | prototype_done | builder | prototype_approved=true | ✓✓ |
| `prism build` | build_done | sweeper | build_reviewed=true | ✓✓ |
| `prism sweep` | sweep_done | grower | sweep_passed=true | ✓✓ |
| `prism grow` | grow_done | maintainer | analyze_complete=true | ✓✓ |
| `prism ship` | live | — | release_approved=true | ✓ |
| `prism close` | closed | — | — | — |
| `prism discard` | discarded | — | — | — |
| `prism pause` | paused | — | — | — |
| `prism escalate` | — | (to-role) | — | 跳级记录 |
| `prism halt` | (system-wide) | — | — | — |
| `prism continue` | (next) | (next) | check | ✓ |
| `prism approve` | — | — | set true | — |
| `prism promote` | — | — | — | productStage++ |

`prism-agent` L3 命令不改 pipeline.json，仅写角色对应 artifacts/。

---

## 10. 自动守护 Hook 设计

### 10.1 三类 Hook

借鉴 ECC 的 hook 系统，但精简到 3 类（ECC 有 11 类 hook）。

#### PreToolUse（5 个）

| Hook | 触发时机 | 作用 |
|------|----------|------|
| `pre:bash` | 任何 bash 前 | 命令前置检查（禁危险命令） |
| `pre:write` | 写文件前 | 自动 quality-gate 检查 |
| `pre:read` | 读文件前 | GateGuard 事实核查 |
| `pre:commit` | 提交前 | 所有 gate 验证 |
| `pre:ecc:mcp-health` | MCP 用前 | MCP 健康检查 |

#### PostToolUse（4 个）

| Hook | 触发时机 | 作用 |
|------|----------|------|
| `post:bash` | bash 后 | 写日志 |
| `post:write` | 写后 | 质量门 |
| `post:write:design-quality` | 写后 | 设计质量 |
| `post:tool:continuous-learning` | 工具调用后 | 自动 LEARNINGS |

#### Stop（4 个）—— 会话级

| Hook | 触发时机 | 作用 |
|------|----------|------|
| `stop:auto-format` | 会话结束 | 自动跑 prettier |
| `stop:typecheck` | 会话结束 | 自动跑 tsc --noEmit |
| `stop:cost-tracker` | 会话结束 | 追踪 token |
| `stop:session-persistence` | 会话结束 | 写 HANDOFF.md |

### 10.2 hook 的自动化价值

- **`stop:typecheck` + `stop:auto-format`**——**会话结束自动跑 lint+typecheck**。人类**不需要记得**做。
- **`pre:write` quality-gate**——写入前先验证 PRD 符合。
- **`post:tool:continuous-learning`**——每次工具调用后自动 LEARNINGS 沉淀。

---

## 11. 参考与对比

### 11.1 vs TaiyiForge

| 维度 | TaiyiForge | Pentad |
|------|------------|--------|
| 阶段数 | 9 | 5 |
| 命令数（用户面） | 6 (main chain) | 5 (main chain) |
| 写工件 | `/taiyi:write` 统一 | 每个 L1 命令自带 |
| 命令风格 | chat slash | CLI 命令 |
| Agent | 隐式 | 132 个显式 L3 |

**借鉴**：Taiyi 的 main chain 六动词（new/status/write/continue/apply/archive），Pentad 简化为 5 链。

### 11.2 vs ECC

| 维度 | ECC | Pentad |
|------|-----|--------|
| Slash 数 | 92 | 35 + 132 工具 |
| 链式 | prp-* 7 命令 | 5 命令 |
| Hook | 11 类 | 3 类（精简） |
| Skills | 369 个 | 132 agents |
| 主链哲学 | prp-init → prp-pr | feature → ship |

**借鉴**：ECC 的 prp-* 主链、hook 系统、5 路径等价设计。

### 11.3 vs Superpowers

| 维度 | Superpowers | Pentad |
|------|-------------|--------|
| 命令 | 0（无 slash） | 35 |
| 触发 | 描述驱动自动 | 命令显式 |
| Iron Law | 硬门 | gate 机制（强约束） |
| 哲学 | 流程协议 | 阶段接力 |

**借鉴**：Iron Law 写入每个 SKILL.md；gate 类似但更结构化。

### 11.4 vs gstack

| 维度 | gstack | Pentad |
|------|--------|--------|
| 命令数 | ~50 | 35 + 132 |
| 命名 | persona 风格 | 角色 + 工具 |
| 路由 | 自然语言 router | L0 自动 |
| 模式 | plan-mode 显式 | L1/L2 隐式 |

**借鉴**：gstack 的 router 概念（L0）、plan-mode vs live-mode 区分（L2）。

### 11.5 vs Claude Code

| 维度 | Claude Code | Pentad |
|------|-------------|--------|
| Agent 总数 | 110 | 132（含 Pentad 自有 13） |
| 入口形式 | `/<agent>` 调度 | `prism-agent <name>` |
| 触发 | 描述匹配 | 显式调度 |

**借鉴**：Claude Code 的 110 个 agent 1:1 映射为 Pentad 的 132 个（22 个 Pentad 自有）。

---

## 12. 待决策项

### 12.1 主链命名

| 选项 | 取名 |
|------|------|
| A | `feature / build / sweep / grow / ship`（推荐，动词式） |
| B | `new / prototype / build / sweep / grow / maintain`（保留 `new` 与 `maintain`） |

### 12.2 L3 前缀

| 选项 | 取名 |
|------|------|
| A | `prism-agent xxx`（子命令，干净） |
| B | `prism agent xxx`（平铺，简单） |

### 12.3 一键串到底命令

| 选项 | 命令 |
|------|------|
| A | `prism chain <slug>`（跑完 5 阶段） |
| B | `prism fast-forward <slug>`（跳过 grow） |
| C | 都不加，靠 L1 5 命令自动接力 |

### 12.4 默认全自动 vs 半自动

| 选项 | 行为 |
|------|------|
| A | 默认全自动，flag `--step` 暂停（推荐） |
| B | 默认每阶段暂停，flag `--auto` 才全自动 |
| C | Builder 默认半自动，其余默认全自动 |

---

## 附录 A：完整命令清单（35 + 132）

```
用户面 L1（5）：
  prism feature <slug> [msg]
  prism build <slug>
  prism sweep <slug>
  prism grow <slug>
  prism ship <slug>

用户面 L2（18）：
  prism discover
  prism prototype
  prism prd
  prism discard
  prism engineer
  prism test
  prism benchmark
  prism doc
  prism review
  prism inspect
  prism audit
  prism deprecate
  prism analyze
  prism experiment
  prism evolve
  prism operate

用户面横切（12）：
  prism new <slug>
  prism status [--verbose]
  prism list [--all]
  prism queue [options]
  prism next
  prism pause
  prism resume
  prism cancel
  prism promote <stage>
  prism escalate <to-role> --reason
  prism halt --reason
  prism docs-sync <feature>

L3（132）：
  prism-agent list [--role <r>]
  prism-agent <agent-name> "<prompt>" [args]
  prism-agent <agent-name> --prompt
```

---

## 附录 B：待补 SKILL.md 索引

当前已存在 5 个核心：

```
.pentad/agents/
├── prototyper.md       (existing)
├── builder.md          (existing)
├── sweeper.md          (existing)
├── grower.md           (existing)
└── maintainer.md       (existing)
```

待补 127 个 agent 的 SKILL.md（建议分批）：

**Phase 1**：补全 L1 主链 dispatch 的 36 个核心 agent
**Phase 2**：补全 L2 阶段入口的 18 个
**Phase 3**：补全 L3 工具箱的 127 个

---

> 最后更新: 2026-07-04 · 状态: 已讨论，待落地
