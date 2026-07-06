# prism-five 命令设计

> 123 个 Agent × 5 个角色 × 9 个 Taiyi 阶段
>
> 状态: 已讨论 / 待落地 (本文档为设计 spec，不含已落地代码)
>
> 适用版本: prism-five v0.4.x 规划

---

## 0. 架构决策：prism-five 不是独立 pipeline engine

**prism-five 是 TaiyiForge 上的 5-role workflow skin。**

| 旧架构 | 新架构 |
|--------|--------|
| `.prism/pipeline.json` 独立真源 | Taiyi `.taiyi/changes/<slug>/state.json` engineTruth |
| `pipeline.continue()` 自建状态机 | Taiyi `continue` — 9 阶段引擎 |
| `gate.ts` 自建门禁 | Taiyi `--approver` + `review-loop` |
| `audit.ts` 审计日志 | Taiyi `activity-log` + `semantic-gate` |
| 5 个角色独立流转 | 5 角色映射到 9 个 Taiyi 阶段 |

**保留的 prism-five 独有能力**：`QueueManager`（feature 队列）、`AgentRuntime`（SKILL.md parser + prompt builder）、`prism` CLI、92 个 L3 Agent。

## 5 角色 → 8 阶段映射（prism-five 视角）

prism-five 的 Builder 的 design 阶段**内嵌 UI 设计**，不单独拆 ui-design。Taiyi 层面用 `--profile api` 跳过独立 ui-design 阶段（CLI 项目默认），UI 项目保留即可。

```
prism-five 角色           Taiyi 阶段                    默认 Agent 池
─────────────────        ─────────────────             ──────────────
Prototyper (Explorer) →  change + requirement          13 个（研究/原型/PRD）
Builder     (Operator) →  design(含UI) + task + dev    27 个（架构/TDD/API/组件）
Sweeper     (Scout)    →  test + review                22 个（审查/合规/审计）
Grower      (Analyst)  →  integration                  36 个（分析/实验/增长）
Maintainer  (Guardian) →  (commit/ship/land)           21 个（部署/监控/运维）
```

## 目录

1. [故事与比喻](#1-故事与比喻)
2. [设计哲学](#2-设计哲学)
3. [4 层金字塔](#3-4-层金字塔)
4. [L1 主链层 5 命令](#4-l1-主链层-5-命令)
5. [L2 阶段入口层 18 命令](#5-l2-阶段入口层-18-命令)
6. [L3 Agent 层 92 命令](#6-l3-agent-层-132-命令)
7. [横切命令 12 个](#7-横切命令-12-个)
8. [三种用户典型用法](#8-三种用户典型用法)
9. [pipeline.json 状态映射](#9-pipelinejson-状态映射)
10. [自动守护 Hook 设计](#10-自动守护-hook-设计)
11. [参考与对比](#11-参考与对比)
12. [架构决策（已决议）](#12-架构决策已决议)
13. [阶段 → Agent 池映射](#13-阶段--agent-池映射)
14. [Taiyi 能力迁入清单](#14-taiyi-能力迁入清单)

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

每个工种需要不同工具（agent）。比如木工需要电锯、刨子、水平仪；水电工需要扳手、试电笔、压线钳。**92 个 agent = 132 把不同的工具**。

`prism` CLI 就是这支装修队长的**对讲机**——你通过对讲机下指令，队长自动调度对应的工种和工具。

---

## 2. 设计哲学

### 2.1 核心矛盾

- **用户不需要认识 92 把工具**——记不住，查不到，每次都得查文档
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
- 输出 `.prism/features/<slug>/raw/`
- 通过 Quality self-check 后自动 `gate.prototype_approved = true`
- 失败重试 3 次或 escalate

#### `prism build <slug>`

- 读 raw/ 产出 → 跑 Builder 27 个 agent
- 强制 TDD（`prism-evidence-collector` 自动核查）
- 输出 `.prism/features/<slug>/built/`
- 通过 `npm run build + test + lint` 三件套后自动 `gate.build_reviewed = true`

#### `prism sweep <slug>`

- 跑 Sweeper 22 个 agent
- 输出 `.prism/features/<slug>/swept/`
- 自动 gate 6 项必须 PASS（lint / typecheck / test / sec-scan / bundle / complexity）
- 失败分类：critical/high 立即 halt；medium 写 SWEEP.md；low 入 queue

#### `prism grow <slug>`

- 跑 Grower 36 个 agent
- 样本不够自动 `grow-idle` 等待，不擅自决策
- 不显著的 A/B 自动 escalate，不强推结论
- 输出 `.prism/features/<slug>/grown/`

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
| `prism prd` | 单独补 PRD | `prism-visual-storyteller` 等 |
| `prism discard` | 主动放弃（high discard 路径） | 标记 status=discarded |

#### Builder（5 命令）

| 命令 | 用途 | 触发 agent |
|------|------|-----------|
| `prism engineer` | plan-mode task 拆分 + 选型 | `prism-planner` + `prism-tool-evaluator` |
| `prism build` | (同 L1) 实际生产代码 | 实施类 22 agent |
| `prism test` | TDD 红绿证据 | `prism-test-api` + `prism-evidence-collector` |
| `prism benchmark` | 性能基线 | `prism-performance-benchmarker` |
| `prism doc` | 文档单独写 | `prism-tech-writer` |

#### Sweeper（4 命令）

| 命令 | 用途 | 触发 agent |
|------|------|-----------|
| `prism review` | 人工可读代码审查 | `prism-reviewer` |
| `prism inspect` | 6 项自动 gate | `prism-integration-checker` + 等 |
| `prism audit` | 跨 feature 审计 | `prism-nyquist-auditor` + 等 12 个 |
| `prism deprecate` | 标记 deprecated | `prism-deprecator` + `prism-version-sunset` |

#### Grower（3 命令）

| 命令 | 用途 | 触发 agent |
|------|------|-----------|
| `prism analyze` | 多维度数据分析 | 维度类 10 个 agent |
| `prism experiment` | A/B 实验 | `prism-experiment-tracker` + `prism-experiment-designer` + `pentab-stats-tester` |
| `prism evolve` | 跨角色发 PR | `prism-evolver` + `prism-feedback-synthesizer-g` |

#### Maintainer（2 命令）

| 命令 | 用途 | 触发 agent |
|------|------|-----------|
| `prism ship` | (同 L1) 真发布 | 部署类 13 agent |
| `prism operate` | 运维规划（监控/告警/成本） | `prism-monitor-setup` + `prism-cost-optimizer` + `prism-backup-manager` |

### L3 — Agent 层（92 命令）

直调式接口，前缀 `prism-agent` 隔离：

```bash
prism-agent prism-mobile-app-builder "<task>"
prism-agent prism-security-engineer "<audit scope>"
prism-agent prism-growth-hacker "<campaign>"
```

#### 92 个 agent 分组（共 5 角色 + 跨角色）

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
| `--agents <list>` | 只跑指定 agent（如 `--agents prism-rapid-prototyper,prism-ux-architect`） |

### 4.2 `prism feature <slug> [message]`

**输入**：slug（kebab-case, 小写连字符）+ 可选自然语言描述

**输出**：

```
✓ Feature "user-auth" created
✓ Running Prototyper (13 agents)...

[1/13] prism-trend-researcher      → raw/RESEARCH.md (3 references)
[2/13] prism-ux-researcher         → raw/RESEARCH_USER.md
[3/13] prism-ux-architect          → raw/SKETCH.md (3 variants)
[4/13] prism-ui-designer           → raw/proto/visual.png
[5/13] prism-rapid-prototyper      → raw/proto/run-demo.ts (✓ runnable)
[6/13] prism-tech-writer           → raw/PRD.md
[7/13] prism-visual-storyteller    → raw/STORY.md
[8/13] prism-image-prompt-engineer → raw/proto/screens.md
[9/13] prism-office-hours          → DECISION: WORTH BUILDING (yes)
[10/13] prism-pattern-mapper       → raw/PATTERNS.md (2 reuse candidates)
[11/13] prism-codebase-mapper      → raw/CODEBASE_MAP.md
[12/13] prism-feedback-synthesizer → raw/FEEDBACK_BACKLOG.md
[13/13] prism-whimsy-injector      → raw/DELIGHT_NOTES.md

✓ Quality self-check passed (6/6)
✓ gate.prototype_approved = true
→ Next: prism build user-auth
```

**状态变化**：

- `.prism/pipeline.json` 新增 `features.user-auth`
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

[1/27] prism-planner              → built/TASK.md (12 slices)
[2/27] prism-tech-writer          → built/API.md (OpenAPI 3.1)
[3/27] prism-tool-evaluator       → PICKED: zod 3.x for validation
[4/27] prism-frontend-developer   → src/auth/login.tsx (RED ✓)
[5/27] prism-frontend-developer   → src/auth/login.tsx (GREEN ✓)
[6/27] prism-frontend-developer   → src/auth/login.tsx (REFACTORED ✓)
... (TDD 循环)
[15/27] prism-backend-architect  → src/api/auth.ts (routes ✓)
[16/27] prism-test-api           → tests/auth.test.ts (4 cases)
[17/27] prism-integration-checker → tests/integration/auth.test.ts
[18/27] prism-evidence-collector → built/EVIDENCE.md (RED→GREEN captured)
[19/27] prism-workflow-optimizer → built/WORKFLOW.md
[20/27] prism-performance-benchmarker → built/PERF.md (p95=185ms, target ≤200)
[21/27] prism-lsp-index-engineer → built/LSP_READY
[22/27] prism-cultural-intelligence → src/i18n/auth.zh-CN.ts
[23/27] prism-build-ui-spec        → built/UI_SPEC.md
[24/27] prism-test-results-analyzer → tests/coverage.xml (82%)
[25/27] prism-debug-builder        → built/RETRY_LOG.md (0 retries)
[26/27] prism-senior-developer    → built/SENIOR_NOTES.md
[27/27] prism-data-engineer-g     → built/DATA_SCHEMA.md

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

[1/22] prism-reviewer             → swept/REVIEW.md (correctness 100%)
[2/22] prism-security-engineer    → swept/SECURITY.md (STRIDE, OWASP)
[3/22] prism-compliance-checker   → swept/COMPLIANCE.md
[4/22] prism-accessibility-auditor → swept/A11Y.md (WCAG 2.1 AA)
[5/22] prism-reality-checker      → REALITY ✓ (no fake claims)
[6/22] prism-test-results-analyzer → tests satisfied: 47/47
[7/22] prism-integration-checker  → integration PASS
[8/22] prism-nyquist-auditor      → coverage/n-requirements gap: 0
[9/22] prism-doc-verifier         → README ✓, API.md ✓
[10/22] prism-eval-auditor        → rating 4.2/5 ≥ 3.5 threshold
[11/22] prism-user-profiler        → personas-match: 0.84
[12/22] prism-agent-trust         → identity trust: PASS
[13/22] prism-security-auditor   → vulns: 0 critical, 0 high
[14/22] prism-ui-auditor          → UI consistency: PASS
[15/22] prism-physical-compat     → compat matrix ✓
[16/22] prism-data-consolidation → dedup: 0 redundant
[17/22] prism-debugger           → 0 latent issues
[18/22] prism-debug-session-manager → session clean
[19/22] prism-fix-build-issue    → no fixes needed (read-only)
[20/22] prism-deprecator         → (optional) mark old auth method
[21/22] prism-version-sunset     → scheduled: 2026-08-15
[22/22] prism-financial-tracker   → cost OK

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
[1/36] prism-analytics-reporter     → grown/ANALYZE_USAGE.md (DAU 1.2k, retention 71%)
[2/36] prism-support-analytics      → grown/ANALYZE_SUPPORT.md (tickets 14/wk)
[3/36] prism-finance-tracker        → grown/ANALYZE_FIN.md (ARR delta +$3k)
[4/36] prism-sales-extractor        → grown/SALES_IMPACT.md
[5/36] prism-user-researcher-g      → grown/USER_RESEARCH.md (3 themes)
[6/36] prism-feedback-collector     → grown/FEEDBACK.md (47 items)
[7/36] prism-data-engineer-g       → grown/DATA_PIPELINE.md (ETL idempotent)
[8/36] prism-data-consolidator     → consolidated 4 sources
[9/36] prism-lineage-tracker       → grown/LINEAGE.gv
[10/36] prism-dq-scorer            → grown/DQ.md (gold 99.94%)
[11/36] prism-usage-tracker        → grown/USAGE.md
[12/36] prism-quality-monitor      → grown/QUALITY.md
[13/36] prism-report-distributor   → grown/REPORT.md
[14/36] prism-feedback-synthesizer-g → key themes: 5

EXPERIMENT:
[15/36] prism-experiment-tracker   → grown/EXPERIMENT.md
[16/36] prism-experiment-designer  → hypothesis: SSO 提升留存
[17/36] pentab-stats-tester        → required n=540, current=612 (POWER OK)

EVOLVE:
[18/36] prism-evolver              → PR #234 to Builder queue
[19/36] prism-discovery-engine     → 3 new needs

GROW:
[20/36] prism-sprint-prioritizer   → ranked 8 backlog items
[21/36] prism-growth-hacker        → 3 campaign concepts
[22/36] prism-content-creator      → 5 content drafts
[23/36] prism-social-strategist    → channels: 4 prioritized
[24/36] prism-app-store-optimizer  → ASO 14 keywords (3 high-value)
[25/36] prism-distribute-instagram → scheduled
[26/36] prism-distribute-twitter    → scheduled
[27/36] prism-distribute-reddit    → scheduled
[28/36] prism-distribute-tiktok     → scheduled
[29/36] prism-distribute-xiaohongshu → scheduled
[30/36] prism-distribute-zhihu      → scheduled
[31/36] prism-distribute-wechat     → scheduled
[32/36] prism-brand-guardian        → brand consistency 100%
[33/36] prism-developer-advocate   → 2 dev topics
[34/36] prism-storyteller           → updated story
[35/36] prism-whimsy-2              → delight plan
[36/36] prism-nudge-engine          → 2 behavioral nudges

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
[1/21] prism-verifier            → CHANGELOG ✓ version ✓
[2/21] prism-doc-writer          → README synced
[3/21] prism-rollback-engine     → rollback script generated
[4/21] prism-monitor-setup       → Prometheus rule 12, Grafana dash 3
[5/21] prism-cost-optimizer      → projected $0.12/h
[6/21] prism-backup-manager      → GPG backup verified

CANARY 5%:
[7/21] prism-canary-controller   → 5% for 30min
[8/21] prism-monitor-setup       → error rate 0.8% (target <1%) ✓
[9/21] prism-monitor-setup       → p95 178ms (target <200) ✓

CANARY 25%:
[10/21] prism-canary-controller  → 25% for 30min
[11/21] → metrics still OK

FULL ROLLOUT:
[12/21] prism-devops-automator   → merge main + tag v1.4.0
[13/21] prism-executor-m         → deploy to prod
[14/21] prism-infra-maintainer   → DNS switch

OPERATE:
[15/21] prism-exec-summary       → weekly summary ready
[16/21] prism-runbook-generator  → runbook.md generated
[17/21] prism-cost-optimizer     → under budget

INCIDENT HANDLING (自动):
[18/21] prism-debugger-m         → active
[19/21] prism-debug-session-m   → ready
[20/21] prism-code-fixer-m      → ready

CLOSE:
[21/21] prism-learnings-curator  → LEARNINGS.md updated + queued next feature

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
- 单独产出 PRD（用 `prism-tech-writer`）
- 适用"已经调研好，只缺 PRD"场景

#### `prism discard`
- 主动停止不进入下一阶段
- 写 `raw/DISCARD_REASON.md`
- 重设 `feature.status = discarded`

### 5.2 Builder L2

#### `prism engineer`
- plan-mode 模式：只跑 `prism-planner` + `prism-tool-evaluator`
- 输出 `built/TASK.md` + `built/PICKS.md`
- 不写代码

#### `prism build`
- 与 L1 同名（细跑实际生产代码的 22 个 agent）
- 区别于 L1 `prism build` —— L2 的 build 是 Builder 阶段内单跑实施类

#### `prism test`
- 仅跑测试相关：`prism-test-api` + `prism-evidence-collector` + `prism-test-results-analyzer`
- 强制 TDD 红绿证据

#### `prism benchmark`
- 仅 `prism-performance-benchmarker`
- 写 `built/PERF.md`

#### `prism doc`
- 仅 `prism-tech-writer`
- 输出 API doc / JSDoc / README

### 5.3 Sweeper L2

#### `prism review`
- 仅 `prism-reviewer`
- 输出人工可读的 `swept/REVIEW.md`

#### `prism inspect`
- 仅 `prism-integration-checker` + 等 6 项自动 gate
- 极快，秒级反馈

#### `prism audit`
- 跨 feature 审计（不止当前 feature）
- 涉及 `prism-nyquist-auditor` + `prism-doc-verifier` + `prism-eval-auditor` + 等 12 个 agent

#### `prism deprecate`
- 标 deprecated + 迁移指南
- 涉及 `prism-deprecator` + `prism-version-sunset`

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

## 6. L3 Agent 层 92 命令

> 详细完整目录见 [GLOSSARY.md](./GLOSSARY.md)。本章列出核心 agent 职责摘要。

### 6.1 总览

| 角色 | agent 数 | 说明 |
|------|:--:|------|
| Prototyper | 12 | 研究、原型、PRD、可行性评估 |
| Builder | 20 + 7 平台专属 | 架构、TDD、API、数据、性能、安全 |
| Sweeper | 20 | 审查、合规、审计、测试生成 |
| Grower | 16 + 1 社媒 | 分析、实验、增长、反馈 |
| Maintainer | 16 | 部署、监控、事故、容量 |
| 跨角色 | 8 | 编排、PM、队列、会话、审计 |
| **总计** | **92 + 8 按需** | |

### 6.2 各角色 Agent 摘要

完整 92 个 agent 的职责、产出、触发命令见 [GLOSSARY.md](./GLOSSARY.md) §3。此处仅列出核心 agent 概览：

**Prototyper（12）**：`rapid-prototyper`、`problem-framer`、`market-intelligence`、`ux-researcher`、`ux-architect`、`ui-designer`、`visual-storyteller`、`stakeholder-interviewer`、`tech-feasibility`、`risk-assessor`、`feedback-synthesizer`、`pattern-analyzer`

**Builder（20 + 7 按需）**：`frontend-developer`、`backend-architect`、`data-engineer`、`ai-engineer`、`senior-developer`、`tech-writer`、`planner`、`executor`、`tool-evaluator`、`workflow-optimizer`、`performance-engineer`、`db-schema-designer`、`api-contract-designer`、`dependency-auditor`、`feature-flag-engineer`、`state-machine-designer`、`resilience-designer`、`auth-engineer`、`ci-cd-designer`、`pattern-analyzer` + `mobile/metal/visionos/xr/terminal`（按需）

**Sweeper（20）**：`reviewer`、`security-engineer`、`compliance-checker`、`accessibility-auditor`、`integration-checker`、`lifecycle-manager`、`debugger`、`regression-test-generator`、`load-test-engineer`、`api-contract-checker`、`dependency-updater`、`license-compliance`、`e2e-generator`、`chaos-engineer` + `eval-auditor`/`agent-trust`【AI专属】、`ui-auditor`【UI专属】

**Grower（16 + 1）**：`analytics-reporter`、`retention-analyst`、`funnel-optimizer`、`adoption-tracker`、`metrics-designer`、`experiment-engineer`、`evolver`、`discovery-engine`、`feedback-engineer`、`data-engineer-g`、`sprint-prioritizer`、`revenue-analyst`、`churn-preventer` + `social-distributor`（平台分发）+ `sales-extractor`【B2B】、`brand-guardian`【营销】

**Maintainer（16）**：`infra-maintainer`、`devops-automator`、`deployment-engineer`、`release-verifier`、`incident-responder`、`incident-coordinator`、`health-check-designer`、`capacity-planner`、`dr-tester`、`secrets-manager`、`cost-optimizer`、`monitor-setup`、`quality-monitor`、`postmortem-writer`、`doc-writer`、`halt-controller`

**跨角色（8）**：`orchestrator`、`pm`、`program-manager`、`queue-manager`、`session-manager`、`lifecycle-manager`、`audit-reporter`、`onboard`

### 6.3 串联验证

一个 feature 从头跑到底，92 agent 之间的数据流衔接（完整版见 [GLOSSARY.md](./GLOSSARY.md) §3）：

```
prism feature user-login
│
├─ Prototyper（12 agent）
│   market-intelligence → raw/TREND.md
│   ux-researcher ─────→ raw/RESEARCH.md
│   pattern-analyzer ──→ raw/PATTERNS.md + raw/CODEBASE_MAP.md
│   problem-framer ────→ raw/PROBLEM.md
│   rapid-prototyper ──→ raw/proto/（runnable）
│   ui-designer ───────→ raw/proto/visual
│
├─ Builder（20 agent，读 raw/PRD.md）
│   planner ───────────→ built/TASK.md
│   api-contract-designer → built/API_CONTRACT.yaml
│   backend-architect ─→ src/api/
│   frontend-developer → src/components/
│   executor ──────────→ 生产代码（TDD）
│   performance-engineer → built/PERF.md
│   auth-engineer ─────→ src/auth/
│   ci-cd-designer ────→ .github/workflows/
│
├─ Sweeper（20 agent，读 built/SPEC.md + diff）
│   reviewer ──────────→ swept/REVIEW.md
│   security-engineer ─→ swept/SECURITY.md
│   lifecycle-manager ─→ swept/DEPRECATION.md
│   regression-test-generator → swept/REGRESSION_TESTS.md
│   chaos-engineer ────→ swept/CHAOS.md
│
├─ Grower（16 agent，读 swept/INSPECT.md + 线上数据）
│   analytics-reporter → grown/ANALYZE.md
│   experiment-engineer → grown/EXPERIMENT.md
│   feedback-engineer ─→ grown/FEEDBACK.md
│   evolver ───────────→ PR → Builder 队列
│   social-distributor ─→ 多平台分发
│
├─ Maintainer（16 agent，读 grown/ANALYZE.md）
│   release-verifier ──→ live/RELEASE_CHECK.md
│   deployment-engineer → live/SHIP.md
│   incident-responder → live/INCIDENT.md
│   postmortem-writer ─→ live/LEARNINGS.md
│   secrets-manager ───→ live/SECRETS.md
│
└─ live（上线，close + dequeue 下一个）
```

### 6.4 L3 使用接口

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
| 6 | `prism pause` | 暂停，写 HANDOFF.md | `.prism/HANDOFF.md` |
| 7 | `prism resume` | 读 HANDOFF.md 恢复 | 读 `.prism/HANDOFF.md` |
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
  run: prism-agent prism-security-engineer "./src"

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
| Slash 数 | 92 | 35 + 92 工具 |
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
| 命令数 | ~50 | 35 + 92 |
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

## 12. 架构决策（已决议）

### 12.0 prism-five 是 Taiyi 的 workflow skin ✅ 已决议

prism-five 不再自建 pipeline engine。直接使用 TaiyiForge 9 阶段引擎：
- `.prism/pipeline.json` → 退役，换 Taiyi `state.json`
- `gate.ts` / `audit.ts` / `upstream.ts` → 退役，换 Taiyi 原生
- 人门 `prototype_approved` / `release_approved` → 换 Taiyi `--approver`
- 保留 QueueManager、AgentRuntime、prism CLI、132 L3 Agent

### 12.1 主链命名

| 选项 | 取名 |
|------|------|
| A | `prism feature / build / sweep / grow / ship`（动词式） |

**选 A**，对齐 `prism-five` 命名。

### 12.2 L3 前缀

| 选项 | 取名 |
|------|------|
| A | `prism-agent xxx`（子命令） |

**选 A**。

### 12.3 一键串到底命令

Taiyi `continue` 已处理阶段推进，不需要额外 `chain` 命令。`prism fast-forward` 保留给 Grower 跳过场景。

### 12.4 默认全自动

**选 A**：默认全自动 + `--step` 暂停。Taiyi 引擎自带。

---

## 13. 阶段 → Agent 池映射

每个阶段自动 dispatch 对应角色的默认 agent 池。L3 的所有 agent 可跨池直调。

```
阶段                 角色            默认 Agent 池（自动）        可跨池直调
──────────          ────────        ──────────────────────      ──────────
change              Prototyper      13 个研究/原型/PRD           prism-agent xxx
requirement         Prototyper      13 个（同上）               prism-agent xxx
design (含UI)       Builder         27 个架构/TDD/API/组件      prism-agent xxx
task                Builder         27 个（同上）               prism-agent xxx
dev                 Builder         27 个（同上）               prism-agent xxx
test                Sweeper         22 个审查/合规/审计         prism-agent xxx
review              Sweeper         22 个（同上）               prism-agent xxx
integration         Grower          36 个分析/实验/增长         prism-agent xxx
(commit/ship/land)  Maintainer      21 个部署/监控/运维         prism-agent xxx
```

**三种调用方式**：

| 方式 | 例 | 说明 |
|------|-----|------|
| 阶段默认 | `prism continue` → dev 阶段自动调 Builder 池 | Taiyi 引擎驱动 |
| 角色切换 | `prism prototype` → 切到 Prototyper 池 | prism CLI |
| 跨池直调 | `prism-agent prism-security-engineer "审计"` | 任何时候任何角色 |

---

## 14. Taiyi 能力迁入清单

prism-five = TaiyiForge workflow skin（§0 已决议）。Taiyi 的 15 个独特设计，10 个通过 `prism` CLI 包给用户，3 个引擎自动生效，2 个不暴露。

### 14.1 包一层（11 个）

| Taiyi 设计 | prism-five 命令 | 说明 |
|-----------|---------------|------|
| DAG / change tree | `prism deps <feature>` | 展示 feature 间依赖关系图 |
| Activity log | `prism history <feature>` | 读 `activity.jsonl` 展示操作记录 |
| Token budget | `prism status` 底部 | 显示 token 用量 + 预算剩余 |
| Delivery chain | `prism commit/ship/land` | 一键提交→PR→合并→部署 |
| Plan file | `prism plan <file>` | 项目 PRD→多个 change 规划 |
| Continuous learning | `prism learnings` | 读 LEARNINGS.md 跨 change 知识 |
| Review loop | `prism review` | Sweeper 阶段机器审查循环 |
| Wave allocator | `prism build --parallel 3` | Builder 27 个 agent 分波并发执行 |
| Preflight | `prism check` | 已有，读 SKILL.md Pre-flight 段 |
| Engine truth | `prism status` | 已有 |
| Semantic gate | 自动（引擎） | 6 项自动检查 |

### 14.2 引擎自动（3 个，不需要包）

| Taiyi 设计 | 说明 |
|-----------|------|
| Phase guard | 自动，dev 前拦代码改动 |
| Harness | Taiyi 引擎内建，prism-five 不重复 |
| Strategic compact | token 超阈值自动压缩 |

### 14.3 不暴露（1 个）

| Taiyi 设计 | 理由 |
|-----------|------|
| Profile 系统 | prism-five 统一用 `api` profile |

### 14.4 能力对照

```
prism-five 状态机（退役前）        Taiyi 替代
──────────────────────────        ──────
pipeline.json 真源          →     state.json engineTruth
pipeline.continue()         →     taiyi continue
checkHumanGate()            →     taiyi --approver
checkAutoGate()             →     semantic gate
gate.ts                     →     taiyi gates/
audit.ts                    →     activity.jsonl
upstream.ts                 →     preflight artifact check
QueueManager                →     保留（feature 队列独有）
AgentRuntime                →     保留（SKILL.md → prompt 转换）
```

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
.prism/agents/
├── prototyper.md       (existing)
├── builder.md          (existing)
├── sweeper.md          (existing)
├── grower.md           (existing)
└── maintainer.md       (existing)
```

待补 127 个 agent 的 SKILL.md（建议分批）：

**Phase 1**：补全 L1 主链 dispatch 的 36 个核心 agent
**Phase 2**：补全 L2 阶段入口的 18 个
**Phase 3**：补全 Agent 清单见 GLOSSARY.md；

---

> 最后更新: 2026-07-04 · 已决议: prism-five = Taiyi workflow skin
