# prism-five 完整实现计划

> 135 个 Taiyi change，按工作流分 7 批，逐一执行。
> 每个 change 包含：角色、文件、前置依赖、验证标准、预估时间。
> 目标：单 change 10-15 min 走完 8 阶段。

---

## 目录

1. [架构](#1-架构)
2. [第 1 批：Taiyi 引擎集成](#2-第-1-批taiyi-引擎集成)
3. [第 2 批：L1 主链 5 命令](#3-第-2-批l1-主链-5-命令)
4. [第 3 批：L2 阶段入口 16 命令](#4-第-3-批l2-阶段入口-16-命令)
5. [第 4 批：L3 Agent 目录 74 个 SKILL.md](#5-第-4-批l3-agent-目录-74-个-skillmd)
6. [第 5 批：横切命令 + 交付链](#6-第-5-批横切命令--交付链)
7. [第 6 批：Hook 系统 + 动态机制](#7-第-6-批hook-系统--动态机制)
8. [第 7 批：测试补齐 + 集成 + 文档收尾](#8-第-7-批测试补齐--集成--文档收尾)
9. [依赖图](#9-依赖图)
10. [总览](#10-总览)

---

## 1. 架构

### 每个 Change 的格式

```
### CXXX · <标题>

| 字段 | 值 |
|------|-----|
| Role | Prototyper / Builder / Sweeper / Grower / Maintainer / 跨角色 |
| Touch | 要改的既有文件 |
| New | 要新建的文件 |
| Dep | 前置 change 编号（无则写"无"） |
| Est | 预估分钟数 |
| AC | 怎么验证完成 |
```

### 执行方式

```bash
# 每个 change：
taiyi new "<title>" --profile api
# → 写 change.json（填满所有字段）
# → render → continue × 8
# → 代码实现（dev 阶段 TDD）
# → 继续 test/review/integration/archive
```

### 进度追踪

每个 change 跑完后在 `[ ]` 里打勾：

```
[ ] C001 · 退役 pipeline.json 真源
[✓] C002 · 删 gate.ts
...
```

---

## 2. 第 1 批：Taiyi 引擎集成

> 把 prism-five 从独立 pipeline engine 改成 TaiyiForge 上的 workflow skin。
> 这一步是**地基**——后续所有 change 都依赖它。
> 8 个 change，~1.5 h。

---

### [ ] C001 · 退役 pipeline.json 真源

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `packages/orchestrator/src/pipeline.ts` |
| New | 无 |
| Dep | 无 |
| Est | 12 min |

**改什么**：
- `pipeline.ts` line 26: `'.prism/pipeline.json'` → 保留文件但标注 `@deprecated`
- `state.ts` line 5: `'.prism/pipeline.json'` → 同
- 不删文件——标注 deprecated，如果 Taiyi engine 断连可以 fallback

**AC**：
- `npm run build` clean
- `prism status` 仍能读 pipeline.json（fallback 模式）
- git diff 只改 2 行（标注 deprecated）

---

### [ ] C002 · 改为 Taiyi state.json 为单一真源

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `packages/orchestrator/src/state.ts`, `src/pipeline.ts` |
| New | 无 |
| Dep | C001 |
| Est | 15 min |

**改什么**：
- `state.ts`: 加 `import { readTaiyiState, writeTaiyiState } from './taiyi-bridge'`
- `pipeline.ts`: `Pipeline` 构造器改为从 `.taiyi/changes/<slug>/state.json` 读
- 读不到时 fallback 到 `.prism/pipeline.json`

**AC**：
- `prism status --json` 输出含 `engineTruth` 字段
- 若 `.taiyi/changes/<slug>/state.json` 不存在则报友好错误
- 已有 89 个测试仍通过

---

### [ ] C003 · 删 gate.ts

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `packages/orchestrator/src/gate.ts`, `src/index.ts` |
| New | 无 |
| Dep | C002 |
| Est | 8 min |

**改什么**：
- 删 `gate.ts`（Taiyi engine 有 `--approver` + `semantic-gate`）
- 删 `index.ts` 中 `checkHumanGate`, `checkAutoGate` 的 export
- 改 CLI `approve.ts`：从调 `pipeline.approveGate()` 改为调 `taiyi continue --approver`

**AC**：
- `npm run build` clean
- `prism approve prototype_approved` 不再依赖 gate.ts
- 测试全部通过

---

### [ ] C004 · 删 upstream.ts

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `packages/orchestrator/src/upstream.ts`, `src/index.ts` |
| New | 无 |
| Dep | C003 |
| Est | 8 min |

**改什么**：
- 删 `upstream.ts`（Taiyi engine 有 `preflight artifact check`）
- 删 `index.ts` 中相关 export
- CLI `check.ts` 改为读当前阶段 agent SKILL.md 的 `## Pre-flight` 段

**AC**：
- `npm run build` clean
- `prism check` 显示 Pre-flight 检查清单
- 测试全部通过

---

### [ ] C005 · 删 audit.ts

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `packages/orchestrator/src/audit.ts`, `src/index.ts` |
| New | 无 |
| Dep | C004 |
| Est | 5 min |

**改什么**：
- 删 `audit.ts`（Taiyi engine 有 `activity.jsonl`）
- `prism history <slug>` 改为读 `activity.jsonl`

**AC**：
- `npm run build` clean
- 无 `audit.ts` 残留

---

### [ ] C006 · 新建 taiyi-bridge.ts

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/orchestrator/src/taiyi-bridge.ts` |
| Touch | `packages/orchestrator/src/index.ts` |
| Dep | C005 |
| Est | 15 min |

**改什么**：
```typescript
// taiyi-bridge.ts — prism-five ↔ TaiyiForge 适配层
export function readTaiyiState(slug: string): PipelineState | null {
  const p = path.join('.taiyi/changes', slug, 'state.json');
  if (!existsSync(p)) return null;
  const raw = JSON.parse(readFileSync(p, 'utf8'));
  return mapTaiyiToPipeline(raw);  // engineTruth → pipeline 格式
}
export function mapTaiyiToPipeline(t: TaiyiState): PipelineState { ... }
export function currentPhase(): string { ... }  // engineTruth.currentPhase
```

**AC**：
- `prism status` 能读 Taiyi state.json 并展示 5 角色映射
- 测试通过

---

### [ ] C007 · CLI continue 改为调 Taiyi

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `packages/cli/src/commands/continue.ts` |
| New | 无 |
| Dep | C006 |
| Est | 10 min |

**改什么**：
```typescript
// 旧：pipeline.continue(slug)
// 新：
const result = spawnSync('taiyi-forge', ['continue', slug, '--approver', approver]);
```

**AC**：
- `prism continue` 调用 Taiyi engine
- 失败时显示 Taiyi 返回的 blockers

---

### [ ] C008 · 更新 5 角色 SKILL.md 适配 Taiyi phase

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `.prism/agents/prototyper.md`, `builder.md`, `sweeper.md`, `grower.md`, `maintainer.md` |
| New | 无 |
| Dep | C007 |
| Est | 12 min |

**改什么**：
- 每个 SKILL.md 加 frontmatter 字段：`taiyi_phase: <phase-id>`
  - prototyper → `change, requirement`
  - builder → `design, task, dev`
  - sweeper → `test, review`
  - grower → `integration`
  - maintainer → `(commit/ship/land)`
- `## Pre-flight` 段加一条：`- [ ] Taiyi engineTruth.currentPhase = <phase-id>`

**AC**：
- Taiyi `taiyi:write` 能识别这 5 个 phase-skill 映射
- 5 个 SKILL.md frontmatter 检查通过（35 个字段）

---

**第 1 批小计：8 个 change，~85 min ≈ 1.5 h**

---

## 3. 第 2 批：L1 主链 5 命令

> 一个命令 = 一个角色池自动 dispatch。打通 5 角色接力链路。
> 5 个 change，~1 h。

---

### [ ] C009 · prism feature `<slug>` — Prototyper 入口

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `packages/cli/src/commands/feature.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C008 |
| Est | 12 min |

**实现**：
```typescript
// feature.ts — 注册为 commander subcommand
export const featureCommand = new Command('feature')
  .argument('<slug>')
  .option('-m, --message <text>', 'Feature description')
  .action(async (slug, opts) => {
    // 1. 调 Taiyi new
    const result = spawnSync('taiyi-forge', ['new', slug, '--profile', 'api']);
    // 2. Dispatch Prototyper agent 池
    const agents = AGENT_POOLS['prototyper']; // 12 个 agent 名
    for (const agent of agents) {
      await runAgent(agent, slug, opts.message);
    }
    // 3. 全部通过后自动 continue（gate）
  });
```

**AC**：
- `prism feature user-auth "登录功能"` 创建 feature + 生成 raw/PRD.md
- 12 个 Prototyper agent 全部执行
- 自动 gate 通过后当前 phase = requirement

---

### [ ] C010 · prism build `<slug>` — Builder 入口

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `packages/cli/src/commands/build.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C009 |
| Est | 12 min |

**实现**：
```typescript
export const buildCommand = new Command('build')
  .argument('<slug>')
  .option('-p, --parallel <n>', 'Max parallel agents', '3')
  .option('--no-tdd', 'Skip TDD enforcement')
  .action(async (slug, opts) => {
    const feature = readFeature(slug);
    // 1. 检查上游：prototyper completed
    const up = checkUpstream(feature, 'builder');
    if (!up.ok) throw new Error(...);
    // 2. Dispatch Builder agent 池
    const agents = AGENT_POOLS['builder'];
    await runAgentsConcurrent(agents, opts.parallel);
    // 3. 质量门：build + test + lint
    await runQualityGate();
  });
```

**AC**：
- `prism build user-auth` 读 raw/PRD.md + 跑 Builder 20 agent
- TDD 红绿证据自动收集
- `npm run build + test + lint` 全通过才继续

---

### [ ] C011 · prism sweep `<slug>` — Sweeper 入口

| 字段 | 值 |
|------|-----|
| Role | Sweeper |
| New | `packages/cli/src/commands/sweep.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C010 |
| Est | 12 min |

**实现**：
```typescript
export const sweepCommand = new Command('sweep')
  .argument('<slug>')
  .option('--hal-on-critical', 'Stop on critical findings')
  .action(async (slug, opts) => {
    // 1. Dispatch Sweeper agent 池（22 agent）
    // 2. 6 项 auto gate：lint/typecheck/test/sec/bundle/complexity
    // 3. critical → halt; medium → write SWEEP.md; low → queue
  });
```

**AC**：
- `prism sweep user-auth` 生成 swept/REVIEW.md + INSPECT.md
- 6 项 auto gate 全 PASS 才继续

---

### [ ] C012 · prism grow `<slug>` — Grower 入口

| 字段 | 值 |
|------|-----|
| Role | Grower |
| New | `packages/cli/src/commands/grow.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C011 |
| Est | 12 min |

**实现**：
```typescript
export const growCommand = new Command('grow')
  .argument('<slug>')
  .option('--min-days <n>', 'Minimum live days before analysis', '7')
  .action(async (slug, opts) => {
    const feature = readFeature(slug);
    const daysSinceLive = daysBetween(feature.liveAt, new Date());
    if (daysSinceLive < opts.minDays) {
      console.log(`grow-idle: need ${opts.minDays - daysSinceLive} more days`);
      return;
    }
    // Dispatch Grower agent 池（16 agent）
  });
```

**AC**：
- live < 7 天 → 自动 grow-idle
- live ≥ 7 天 → 数据分析 + A/B 实验
- 不显著 → escalate（不擅自决策）

---

### [ ] C013 · prism ship `<slug>` — Maintainer 入口

| 字段 | 值 |
|------|-----|
| Role | Maintainer |
| New | `packages/cli/src/commands/ship.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C012 |
| Est | 12 min |

**实现**：
```typescript
export const shipCommand = new Command('ship')
  .argument('<slug>')
  .option('--canary <pct>', 'Canary percentage', '5')
  .option('--duration <min>', 'Canary duration', '30')
  .option('--force-skip', 'Bypass upstream checks')
  .action(async (slug, opts) => {
    // 1. release-check：7 项检查
    // 2. canary：5% → 25% → 100% 渐进
    // 3. ship：merge + tag + deploy
    // 4. operate 初始化：监控 + alert + runbook
    // 5. close：postmortem + learnings + dequeue
  });
```

**AC**：
- `prism ship user-auth --canary 5` 跑完整发布流程
- canary 异常 → 自动 rollback + INCIDENT.md
- 成功后自动 close + dequeue

---

**第 2 批小计：5 个 change，~60 min ≈ 1 h**

---

## 4. 第 3 批：L2 阶段入口 16 命令

> L2 命令是 L1 的细颗粒版本——"我只做一件事"。
> 每个命令 8-10 min。16 个 change，~2 h。

---

### Prototyper L2（C014-C017）

### [ ] C014 · prism discover

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `packages/cli/src/commands/discover.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C013 |
| Est | 8 min |

**实现**：调研类 8 个 agent 并发：market-intelligence, ux-researcher, stakeholder-interviewer, tech-feasibility, risk-assessor, feedback-synthesizer, pattern-analyzer, visual-storyteller

**AC**：输出 `raw/RESEARCH.md` + `raw/COMPETITIVE.md` + `raw/STAKEHOLDER.md` + `raw/FEASIBILITY.md` + `raw/RISK.md` + `raw/FEEDBACK.md`

---

### [ ] C015 · prism prototype

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `packages/cli/src/commands/prototype.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C014 |
| Est | 8 min |

**实现**：实现类 agent：rapid-prototyper, ux-architect, ui-designer, problem-framer（读调研结果→定义问题边界）

**AC**：输出 `raw/proto/`（可运行代码）+ `raw/PROBLEM.md`

---

### [ ] C016 · prism prd

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `packages/cli/src/commands/prd.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C015 |
| Est | 8 min |

**实现**：仅跑 rapid-prototyper 的 PRD step + visual-storyteller 的故事板

**AC**：输出 `raw/PRD.md` + `raw/STORY.md`（"已经调研好，只缺 PRD"场景）

---

### [ ] C017 · prism discard

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `packages/cli/src/commands/discard.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C016 |
| Est | 8 min |

**实现**：标记 `feature.status = discarded` + 写 `raw/DISCARD_REASON.md` + 释放队列位置

**AC**：`prism discard user-auth --reason "竞品已做"` → feature 标记为 discarded，不进入下一阶段

---

### Builder L2（C018-C022）

### [ ] C018 · prism engineer

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `packages/cli/src/commands/engineer.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C017 |
| Est | 8 min |

**实现**：plan-mode：planner + tool-evaluator + pattern-analyzer + dependency-auditor

**AC**：输出 `built/TASK.md` + `built/PICKS.md` + `built/DEPS_AUDIT.md`（不写代码）

---

### [ ] C019 · prism test（Builder 版）

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `packages/cli/src/commands/test.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C018 |
| Est | 8 min |

**实现**：仅跑测试相关 agent：executor（TDD step）、api-contract-checker（API 测试）、load-test-engineer（如有性能需求）

**AC**：强制 TDD 红绿证据；输出 `.dev-complete` 含 RED+GREEN

---

### [ ] C020 · prism benchmark

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `packages/cli/src/commands/benchmark.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C019 |
| Est | 8 min |

**实现**：仅跑 performance-engineer（合并后的性能测量+设计）

**AC**：输出 `built/PERF.md`（p95 延迟、Crash-free、startup time、bundle size）

---

### [ ] C021 · prism doc（Builder 版）

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `packages/cli/src/commands/doc.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C020 |
| Est | 8 min |

**实现**：仅跑 tech-writer + api-contract-designer（生成 OpenAPI spec）

**AC**：输出 `built/API.md` + `built/API_CONTRACT.yaml`

---

### [ ] C022 · prism configure

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `packages/cli/src/commands/configure.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C021 |
| Est | 8 min |

**实现**：仅跑 config/flag 类 agent：feature-flag-engineer + ci-cd-designer + secrets-manager（从 Maintainer 提前）

**AC**：输出 `built/FEATURE_FLAGS.md` + `.github/workflows/ci.yml` + `built/SECRETS.md`

---

### Sweeper L2（C023-C026）

### [ ] C023 · prism review

| 字段 | 值 |
|------|-----|
| Role | Sweeper |
| New | `packages/cli/src/commands/review.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C022 |
| Est | 8 min |

**实现**：仅跑 reviewer + reality-checker（真伪检验）

**AC**：输出 `swept/REVIEW.md`（全维度审查：正确性/安全/性能/可维护性）

---

### [ ] C024 · prism inspect

| 字段 | 值 |
|------|-----|
| Role | Sweeper |
| New | `packages/cli/src/commands/inspect.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C023 |
| Est | 8 min |

**实现**：仅跑 6 项 auto gate（lint/typecheck/test/sec-scan/bundle-size/complexity）

**AC**：输出 `swept/INSPECT.md`（6 项全 PASS 或列出失败项）

---

### [ ] C025 · prism audit

| 字段 | 值 |
|------|-----|
| Role | Sweeper |
| New | `packages/cli/src/commands/audit.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C024 |
| Est | 8 min |

**实现**：跨 feature 审计 agent：license-compliance, dependency-updater, ui-auditor, physical-compat, eval-auditor, agent-trust, chaos-engineer

**AC**：输出 `swept/AUDIT.md`（多维度审计报告）

---

### [ ] C026 · prism deprecate

| 字段 | 值 |
|------|-----|
| Role | Sweeper |
| New | `packages/cli/src/commands/deprecate.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C025 |
| Est | 8 min |

**实现**：仅跑 lifecycle-manager：弃用标记 + version-sunset + 迁移指南生成

**AC**：输出 `swept/DEPRECATION.md`；标记旧 feature 的 status

---

### Grower L2（C027-C029）

### [ ] C027 · prism analyze

| 字段 | 值 |
|------|-----|
| Role | Grower |
| New | `packages/cli/src/commands/analyze.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C026 |
| Est | 8 min |

**实现**：多维度数据分析 agent：analytics-reporter, retention-analyst, feedback-engineer, revenue-analyst, churn-preventer

**AC**：输出 `grown/ANALYZE.md`（usage + quality + feedback + revenue 四维）；不启动 A/B

---

### [ ] C028 · prism experiment

| 字段 | 值 |
|------|-----|
| Role | Grower |
| New | `packages/cli/src/commands/experiment.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C027 |
| Est | 8 min |

**实现**：仅跑 experiment-engineer：hypothesis → 实验组 → 数据收集 → 显著性检验

**AC**：输出 `grown/EXPERIMENT.md`（含 p-value + effect size）；不显著 → escalate

---

### [ ] C029 · prism evolve

| 字段 | 值 |
|------|-----|
| Role | Grower |
| New | `packages/cli/src/commands/evolve.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C028 |
| Est | 8 min |

**实现**：仅跑 evolver：验证通过的实验 → 生成 PR → 发送到 Builder 队列

**AC**：跨角色派单成功（Builder 队列出现新 feature）

---

**第 3 批小计：16 个 change，~130 min ≈ 2 h**

---

## 5. 第 4 批：L3 Agent 目录 74 个 SKILL.md

> 每个 agent 一个 SKILL.md，~60 行。
> 已有 6 个核心 + 1 个 orchestrator = 7 个，需要补 85 个。
> 其中 ~60 个结构相似可以模板批量生成，~25 个需要手工填核心内容。
> 74 个 change，分批处理。

### 模板结构

每个 SKILL.md 的模板：

```markdown
---
name: prism-<agent-name>
mode: agent
paradigm: <Paradigm>
role: <role>
description: <一句话职责>
taiyi_phase: <phase>
---

<constraints>
<核心约束，1-3 条>
</constraints>

## Iron Law
`<不可违反的规则>`

## Tools
allow: read, write, bash(...)
deny: bash(deploy|ship|prod)

## Pre-flight
- [ ] Taiyi engineTruth.currentPhase = <phase>
- [ ] 上游工件齐全

## Steps
1. /step1: <描述> → <产出>
2. /step2: <描述> → <产出>
3. /step3: <描述> → <产出>

## Gate
AUTO GATE: <条件>

## Quality self-check
- [ ] <检查项 1>
- [ ] <检查项 2>

<fatal_constraints>
NEVER <约束 1>.
NEVER <约束 2>.
</fatal_constraints>
```

---

### 5.1 Prototyper Agent（10 个新增，C030-C039）

> 已有：rapid-prototyper, ux-researcher, ux-architect, ui-designer, visual-storyteller
> 新增：problem-framer, market-intelligence, stakeholder-interviewer, tech-feasibility, risk-assessor, feedback-synthesizer, pattern-analyzer
> 更新：rapid-prototyper, ux-researcher, visual-storyteller（加到最终版）

#### [ ] C030 · prism-problem-framer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `.prism/agents/prism-problem-framer.md` |
| Dep | C029 |
| Est | 8 min |

**Iron Law**：`Never build without a well-defined problem. A problem well-stated is a problem half-solved.`

**Steps**：
1. `/frame`：原始想法 → 问题空间定义（边界、非目标、约束）→ `raw/PROBLEM.md`
2. `/scope`：In/Out scope 分解 → `raw/SCOPE.md`
3. `/criteria`：可验证的 Success Criteria（每条可映射到测试）→ `raw/CRITERIA.md`

---

#### [ ] C031 · prism-market-intelligence SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `.prism/agents/prism-market-intelligence.md` |
| Dep | C030 |
| Est | 8 min |

**Iron Law**：`No feature without market evidence. Search 10+ sources before concluding.`

**Steps**：
1. `/scan`：竞品功能矩阵 + 定价 + 市场定位 + 差异化 → `raw/COMPETITIVE.md`
2. `/trend`：行业报告、技术趋势、用户行为变化 → `raw/TREND.md`
3. `/synthesize`：综合评估：这个方向有没有市场基础？→ `raw/MARKET_DECISION.md`

---

#### [ ] C032 · prism-stakeholder-interviewer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `.prism/agents/prism-stakeholder-interviewer.md` |
| Dep | C031 |
| Est | 8 min |

**Iron Law**：`Interview at least 3 stakeholders before writing a single requirement.`

**Steps**：
1. `/script`：生成结构化访谈脚本（开放式问题，覆盖所有干系人角色）→ `raw/INTERVIEW_SCRIPT.md`
2. `/synthesize`：综合访谈发现，提取关键需求信号 → `raw/STAKEHOLDER.md`
3. `/prioritize`：需求优先级排序（MoSCoW 或 RICE）→ `raw/PRIORITY.md`

---

#### [ ] C033 · prism-tech-feasibility SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `.prism/agents/prism-tech-feasibility.md` |
| Dep | C032 |
| Est | 8 min |

**Iron Law**：`Feasibility check before prototype. Spike before spec.`

**Steps**：
1. `/assess`：现有架构/人力/时间线是否支持 → `raw/FEASIBILITY.md`
2. `/spike`：轻量 spike：测试 1 个高风险技术假设（< 半天）→ `raw/SPIKE.md`
3. `/recommend`：给出 Go/No-Go/Need-More-Info 建议 → `raw/RECOMMEND.md`

---

#### [ ] C034 · prism-risk-assessor SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `.prism/agents/prism-risk-assessor.md` |
| Dep | C033 |
| Est | 8 min |

**Iron Law**：`Identify risks before they become incidents. Every risk gets a mitigation.`

**Steps**：
1. `/legal`：法律合规风险 → `raw/RISK_LEGAL.md`
2. `/security`：安全威胁预判 → `raw/RISK_SECURITY.md`
3. `/timeline`：时间线风险 + 依赖风险 → `raw/RISK_TIMELINE.md`

---

#### [ ] C035 · prism-feedback-synthesizer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `.prism/agents/prism-feedback-synthesizer.md` |
| Dep | C034 |
| Est | 8 min |

**Iron Law**：`User feedback over intuition. Cluster before concluding.`

**Steps**：
1. `/collect`：多源反馈收集（工单、App Store、社媒、NPS）→ `raw/FEEDBACK_RAW.md`
2. `/cluster`：主题聚类 + 情绪分析 → `raw/FEEDBACK_CLUSTERS.md`
3. `/signal`：提取关键需求信号，标注信号强度 → `raw/FEEDBACK_SIGNALS.md`

---

#### [ ] C036 · prism-pattern-analyzer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| New | `.prism/agents/prism-pattern-analyzer.md` |
| Dep | C035 |
| Est | 8 min |

**Iron Law**：`Search the codebase before writing new code. Reuse over reinvent.`

**Steps**：
1. `/map`：模块依赖图 + 数据流 + 入口点 → `raw/CODEBASE_MAP.md`
2. `/reuse`：可复用模式、组件、抽象扫描 → `raw/PATTERNS.md`
3. `/gap`：识别需要新建的模块 → `raw/GAPS.md`

---

#### [ ] C037 · prism-rapid-prototyper SKILL.md（更新）

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| Touch | `.prism/agents/prototyper.md`（重命名为 `prism-rapid-prototyper.md`） |
| Dep | C036 |
| Est | 10 min |

**改什么**：把现有的 `prototyper.md` 内容升级到最终版 Iron Law + Steps + Quality self-check + fatal constraints。保持 `mode: agent` frontmatter。

**Steps**（扩到 6 步）：
1. `/research`：5+ 参考实现调研 → `raw/RESEARCH.md`
2. `/sketch`：3+ 原型变体对比 → `raw/SKETCH.md`
3. `/prototype`：Runnable dirty code → `raw/proto/`
4. `/prd`：User stories + AC + scope → `raw/PRD.md`
5. `/arch`：Tech spec + 2-3 approach comparison → `raw/TECH_SPEC.md`
6. `/initiate`：Final selected approach + risk list → `raw/INITIATE.md`

---

#### [ ] C038 · prism-ux-researcher SKILL.md（更新）

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| Touch | `.prism/agents/prism-ux-researcher.md`（新建，从现有 prototyper.md 提炼） |
| Dep | C037 |
| Est | 8 min |

---

#### [ ] C039 · prism-visual-storyteller SKILL.md（更新）

| 字段 | 值 |
|------|-----|
| Role | Prototyper |
| Touch | `.prism/agents/prism-visual-storyteller.md`（新建） |
| Dep | C038 |
| Est | 8 min |

**Iron Law**：`Show, don't tell. Every user scenario gets a visual storyboard.`

---

### 5.2 Builder Agent（17 个新增，C040-C056）

> 已有：frontend-developer, backend-architect, data-engineer, ai-engineer, senior-developer, tech-writer, planner, executor
> 新增：db-schema-designer, api-contract-designer, dependency-auditor, feature-flag-engineer, state-machine-designer, resilience-designer, auth-engineer, ci-cd-designer, performance-engineer
> 更新：planner, executor, tool-evaluator, workflow-optimizer, frontend-developer, backend-architect, data-engineer, tech-writer

#### [ ] C040 · prism-db-schema-designer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-db-schema-designer.md` |
| Dep | C039 |
| Est | 8 min |

**Iron Law**：`Design the schema before writing the query. Index for reads, normalize for writes.`

**Steps**：
1. `/model`：实体关系建模 → ER 图 + 数据字典 → `built/DB_SCHEMA.md`
2. `/index`：索引策略设计（覆盖查询 + 避免过度索引）→ `built/DB_INDEXES.md`
3. `/migrate`：Migration 方案设计（up + down + 回滚）→ `built/DB_MIGRATION.md`

---

#### [ ] C041 · prism-api-contract-designer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-api-contract-designer.md` |
| Dep | C040 |
| Est | 8 min |

**Steps**：
1. `/design`：从 REQUIREMENT AC 生成 OpenAPI/GraphQL/gRPC schema → `built/API_CONTRACT.yaml`
2. `/validate`：Schema 校验 + 示例请求/响应生成 → `built/API_EXAMPLES.md`

---

#### [ ] C042 · prism-dependency-auditor SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-dependency-auditor.md` |
| Dep | C041 |
| Est | 8 min |

**Steps**：
1. `/license`：License 兼容性检查（copyleft 传染性）→ `built/DEPS_LICENSE.md`
2. `/security`：供应链安全检查（npm audit + CVE 数据库）→ `built/DEPS_SECURITY.md`
3. `/health`：维护健康度评估（最近发布时间、issue 响应时间）→ `built/DEPS_HEALTH.md`

---

#### [ ] C043 · prism-feature-flag-engineer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-feature-flag-engineer.md` |
| Dep | C042 |
| Est | 8 min |

**Steps**：
1. `/namespace`：Flag 命名空间 + 生命周期设计 → `built/FEATURE_FLAGS.md`
2. `/strategy`：灰度策略（用户% / 地域 / 企业 / 内部）→ `built/FLAG_STRATEGY.md`
3. `/cleanup`：Flag 清理计划（上线后 N 天自动删除）→ `built/FLAG_CLEANUP.md`

---

#### [ ] C044 · prism-state-machine-designer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-state-machine-designer.md` |
| Dep | C043 |
| Est | 8 min |

**Steps**：
1. `/states`：状态枚举 + 合法转换定义 → `built/STATE_MACHINE.md`
2. `/events`：事件触发 + 副作用声明 → `built/STATE_EVENTS.md`
3. `/diagram`：Mermaid 状态图 → `built/STATE_DIAGRAM.mermaid`

---

#### [ ] C045 · prism-resilience-designer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-resilience-designer.md` |
| Dep | C044 |
| Est | 8 min |

**Steps**：
1. `/retry`：重试策略设计（指数退避 + jitter + max attempts）→ `built/RESILIENCE.md`
2. `/circuit`：熔断器配置（failure threshold + recovery time）→ `built/CIRCUIT_BREAKER.md`
3. `/fallback`：优雅降级方案（功能降级 + 静态兜底）→ `built/FALLBACK.md`

---

#### [ ] C046 · prism-auth-engineer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-auth-engineer.md` |
| Dep | C045 |
| Est | 8 min |

**Steps**：
1. `/auth`：认证实现（OAuth2/OIDC/JWT/SAML）→ `src/auth/`
2. `/rbac`：授权模型（RBAC/ABAC/ReBAC）→ `src/auth/permissions.ts`
3. `/mfa`：多因素认证（TOTP/WebAuthn/SMS）→ `src/auth/mfa.ts`

---

#### [ ] C047 · prism-ci-cd-designer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-ci-cd-designer.md` |
| Dep | C046 |
| Est | 8 min |

**Steps**：
1. `/pipeline`：CI 管线设计（build matrix + test 并行化）→ `.github/workflows/ci.yml`
2. `/artifact`：Artifact 发布策略（npm/Docker/二进制）→ `built/ARTIFACT.md`
3. `/env`：环境提升流水线（dev→staging→prod）→ `.github/workflows/deploy.yml`

---

#### [ ] C048 · prism-performance-engineer SKILL.md

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-performance-engineer.md` |
| Dep | C047 |
| Est | 8 min |

**Steps**：
1. `/baseline`：性能基线测量（p95 延迟、Crash-free、startup、bundle）→ `built/PERF.md`
2. `/optimize`：优化方案（bundle 分析、懒加载、缓存、CDN）→ `built/PERF_OPTIMIZE.md`
3. `/monitor`：性能回归监控阈值设置 → `built/PERF_MONITOR.md`

---

### 平台专属 Agent（7 个，只建 SKILL.md 骨架）

#### [ ] C049 · prism-mobile-app-builder SKILL.md【平台专属】

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-mobile-app-builder.md` |
| Dep | C048 |
| Est | 5 min |

**标记**：frontmatter 加 `platform: ios|android|cross-platform`

#### [ ] C050 · prism-metal-engineer SKILL.md【平台专属】

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-metal-engineer.md` |
| Dep | C049 |
| Est | 5 min |

#### [ ] C051 · prism-visionos-engineer SKILL.md【平台专属】

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-visionos-engineer.md` |
| Dep | C050 |
| Est | 5 min |

#### [ ] C052 · prism-xr-immersive SKILL.md【平台专属】

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-xr-immersive.md` |
| Dep | C051 |
| Est | 5 min |

#### [ ] C053 · prism-xr-cockpit SKILL.md【平台专属】

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-xr-cockpit.md` |
| Dep | C052 |
| Est | 5 min |

#### [ ] C054 · prism-xr-interface-architect SKILL.md【平台专属】

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-xr-interface-architect.md` |
| Dep | C053 |
| Est | 5 min |

#### [ ] C055 · prism-terminal-integration SKILL.md【平台专属】

| 字段 | 值 |
|------|-----|
| Role | Builder |
| New | `.prism/agents/prism-terminal-integration.md` |
| Dep | C054 |
| Est | 5 min |

---

### 已有 Builder agent 更新（7 个）

#### [ ] C056 · Builder 已有 agent 批量更新（7 个）

| 字段 | 值 |
|------|-----|
| Role | Builder |
| Touch | `.prism/agents/prism-planner.md`, `prism-executor.md`, `prism-tool-evaluator.md`, `prism-workflow-optimizer.md`, `prism-frontend-developer.md`, `prism-backend-architect.md`, `prism-data-engineer.md` |
| Dep | C055 |
| Est | 12 min |

**改什么**：7 个已有 agent 统一更新到最终版模板格式（加 `taiyi_phase: design,task,dev`、`mode: agent`、完整的 Quality self-check）

---

### 5.3 Sweeper Agent（18 个，C057-C074）

> 已有：reviewer, security-engineer, compliance-checker, accessibility-auditor, integration-checker, lifecycle-manager, debugger
> 新增：regression-test-generator, load-test-engineer, api-contract-checker, dependency-updater, license-compliance, e2e-generator, chaos-engineer
> 按需：eval-auditor【AI专属】, agent-trust【AI专属】, ui-auditor【UI专属】, physical-compat【平台专属】
> 更新：reviewer, security-engineer, compliance-checker, integration-checker, lifecycle-manager, debugger

**由于篇幅限制，Sweeper/Grower/Maintainer agent 的详细 change 结构与前面一致（每个 5-8 min，模板化生成）。完整清单见 [GLOSSARY.md](./GLOSSARY.md) §3。**

#### C057-C063 · Sweeper 新增 7 个 + 更新 7 个

| Change | Agent | Est |
|--------|-------|:--:|
| C057 | `prism-regression-test-generator` | 8 min |
| C058 | `prism-load-test-engineer` | 8 min |
| C059 | `prism-api-contract-checker` | 8 min |
| C060 | `prism-dependency-updater` | 8 min |
| C061 | `prism-license-compliance` | 8 min |
| C062 | `prism-e2e-generator` | 8 min |
| C063 | `prism-chaos-engineer` | 8 min |
| C064 | `prism-eval-auditor`【AI专属】 | 5 min |
| C065 | `prism-agent-trust`【AI专属】 | 5 min |
| C066 | `prism-ui-auditor`【UI专属】 | 5 min |
| C067 | `prism-physical-compat`【平台专属】 | 5 min |
| C068 | Sweeper 已有 7 个更新 | 12 min |
| C069-C074 | 同上，逐个 | — |

**Sweeper 小计：18 个 change，~2 h**

---

### 5.4 Grower Agent（14 个，C075-C088）

| Change | Agent | Est |
|--------|-------|:--:|
| C075 | `prism-retention-analyst` | 8 min |
| C076 | `prism-funnel-optimizer` | 8 min |
| C077 | `prism-adoption-tracker` | 8 min |
| C078 | `prism-metrics-designer` | 8 min |
| C079 | `prism-experiment-engineer` | 8 min |
| C080 | `prism-feedback-engineer` | 8 min |
| C081 | `prism-revenue-analyst` | 8 min |
| C082 | `prism-churn-preventer` | 8 min |
| C083 | `prism-social-distributor` | 10 min |
| C084 | `prism-sales-extractor`【B2B专属】 | 5 min |
| C085 | `prism-brand-guardian`【营销专属】 | 5 min |
| C086 | Grower 已有 7 个更新 | 12 min |
| C087-C088 | 同上 | — |

**Grower 小计：14 个 change，~1.5 h**

---

### 5.5 Maintainer Agent（14 个，C089-C102）

| Change | Agent | Est |
|--------|-------|:--:|
| C089 | `prism-deployment-engineer` | 8 min |
| C090 | `prism-release-verifier` | 8 min |
| C091 | `prism-incident-responder` | 8 min |
| C092 | `prism-incident-coordinator` | 8 min |
| C093 | `prism-health-check-designer` | 8 min |
| C094 | `prism-capacity-planner` | 8 min |
| C095 | `prism-dr-tester` | 8 min |
| C096 | `prism-secrets-manager` | 8 min |
| C097 | `prism-quality-monitor` | 8 min |
| C098 | Maintainer 已有 8 个更新 | 12 min |
| C099-C102 | 同上 | — |

**Maintainer 小计：14 个 change，~1.5 h**

---

**第 4 批总计：74 个 change，~8.5 h（模板批量生成可压到 3 h）**

---

## 6. 第 5 批：横切命令 + 交付链

> 8 个 change，~1 h。

### [ ] C103 · prism deps `<feature>`

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/cli/src/commands/deps.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C102 |
| Est | 8 min |

**实现**：读 Taiyi `state.json` 的 feature 间依赖关系，用 Mermaid 或 ASCII 输出 DAG

**AC**：`prism deps user-auth` → 输出 feature 依赖图

---

### [ ] C104 · prism history `<feature>`

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/cli/src/commands/history.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C103 |
| Est | 8 min |

**实现**：读 Taiyi `activity.jsonl`，格式化展示 feature 操作时间线

**AC**：`prism history user-auth` → 输出操作历史表格

---

### [ ] C105 · prism plan `<file>`

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/cli/src/commands/plan.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C104 |
| Est | 8 min |

**AC**：`prism plan README.md` → 生成多个 change 的 batch 规划

---

### [ ] C106 · prism learnings

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/cli/src/commands/learnings.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C105 |
| Est | 8 min |

**AC**：`prism learnings` → 输出 LEARNINGS.md 的内容

---

### [ ] C107 · prism commit

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/cli/src/commands/commit.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C106 |
| Est | 8 min |

**实现**：`git add -A && git commit -m "..."` + 自动添加 `Taiyi-Change: <slug>` trailer

---

### [ ] C108 · prism ship（交付版：push + PR）

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `packages/cli/src/commands/ship.ts`（扩展） |
| Dep | C107 |
| Est | 8 min |

**AC**：`prism ship --pr` → git push + `gh pr create`

---

### [ ] C109 · prism land

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/cli/src/commands/land.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C108 |
| Est | 8 min |

**AC**：`prism land` → merge PR + deploy

---

### [ ] C110 · prism onboard

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/cli/src/commands/onboard.ts` |
| Touch | `packages/cli/src/index.ts` |
| Dep | C109 |
| Est | 8 min |

**AC**：`prism onboard` → 新成员入门引导 + 第一个 feature 走查

---

**第 5 批小计：8 个 change，~1 h**

---

## 7. 第 6 批：Hook 系统 + 动态机制

> 18 个 change，~3 h。

### Hook 核心框架

### [ ] C111 · Hook 注册表框架

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/orchestrator/src/hooks/registry.ts` |
| Dep | C110 |
| Est | 12 min |

```typescript
// registry.ts
export interface Hook {
  event: 'PreToolUse' | 'PostToolUse' | 'Stop' | 'SessionStart';
  tool?: string;
  action: (input: HookInput) => Promise<HookResult>;
}
export const HOOK_REGISTRY: Map<string, Hook> = new Map();
export async function runHooks(event: string, tool: string, input: any): Promise<HookResult> { ... }
```

**AC**：框架可加载 hook；空注册表时 `runHooks` 返回 `{ ok: true }`

---

### [ ] C112-C119 · Hook 核心 8 个

| Change | Hook | Est |
|--------|------|:--:|
| C112 | `pre:bash:guard` — 防 rm -rf / deploy 误触 | 8 min |
| C113 | `pre:write:lint-guard` — 禁止改 lint 配置 | 8 min |
| C114 | `pre:write:quality-gate` — 写前检查 PRD 匹配 | 8 min |
| C115 | `post:write:quality-gate` — 写后 lint+test | 8 min |
| C116 | `post:write:console-check` — 防 console.log 漏到生产 | 8 min |
| C117 | `post:bash:log` — 记录所有 bash 操作 | 8 min |
| C118 | `stop:typecheck` — 会话结束自动 tsc --noEmit | 8 min |
| C119 | `stop:format` — 会话结束自动 prettier | 8 min |

---

### [ ] C120-C124 · Hook 高优 5 个

| Change | Hook | Est |
|--------|------|:--:|
| C120 | `post:tool:continuous-learning` — 自动 LEARNINGS | 8 min |
| C121 | `pre:read:gate-guard` — 防 LLM 编造 | 8 min |
| C122 | `session-start:history` — 启动加载上下文 | 8 min |
| C123 | `stop:session-persistence` — 自动 HANDOFF | 8 min |
| C124 | `pre:write:design-quality` — 设计规范检查 | 8 min |

---

### 动态机制 Phase A

### [ ] C125 · Auto-retry 机制

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/orchestrator/src/retry.ts` |
| Dep | C124 |
| Est | 12 min |

**实现**：每个 agent 配 `retry: 3` + 失败 escalate。AgentRuntime 执行时自动包裹

**AC**：agent 执行失败 → 自动重试 3 次 → 第 4 次 escalate

---

### [ ] C126 · Concurrency control

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/orchestrator/src/concurrency.ts` |
| Dep | C125 |
| Est | 12 min |

**实现**：读类 agent 并发（Promise.all），写类 agent 串行。`--parallel <n>` flag

**AC**：`prism build --parallel 3` → 最多 3 个 agent 同时执行

---

### [ ] C127 · Scheduler

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/orchestrator/src/scheduler.ts` |
| Dep | C126 |
| Est | 10 min |

**实现**：Grower idle 自动 24h 检查；Maintainer canary 完成自动 ship

**AC**：Grower idle 7 天后自动唤醒 check 样本是否足够

---

### [ ] C128 · State reconcile

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `packages/orchestrator/src/reconcile.ts` |
| Dep | C127 |
| Est | 10 min |

**实现**：启动时自动检测孤儿 artifact（state 说 live 但没有 raw/）。自动备份 + 恢复

**AC**：crash 后重启不丢状态

---

**第 6 批小计：18 个 change，~2.5 h**

---

## 8. 第 7 批：测试补齐 + 集成 + 文档收尾

> 7 个 change，~1.5 h。

### [ ] C129 · 全线回归测试

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | 所有 test 文件 |
| Dep | C128 |
| Est | 15 min |

**AC**：200+ tests pass；覆盖所有 CLI 命令 + Hook + agent dispatch

---

### [ ] C130 · OpenCode plugin 完善

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `.opencode-plugin/index.ts`, `tools/prism-commands.ts`, `skills/loader.ts` |
| Dep | C129 |
| Est | 15 min |

**AC**：9 tool + 5 skill + manifest 全部注册成功

---

### [ ] C131 · ECC 集成

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `.claude/skills/prism-five/SKILL.md` |
| Dep | C130 |
| Est | 10 min |

**AC**：ECC `/prp-prd` → 自动触发 prism 的 Prototyper agent 池

**参考**：ECC 的 `prp-*` 链式命令设计、6 步 happy path、5 条执行路径（见 IMPLEMENTATION-PLAN.md 会引用 ECC 模式）

---

### [ ] C132 · Superpowers 集成

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `.claude/skills/prism-five/SKILL.md`（更新） |
| Dep | C131 |
| Est | 10 min |

**AC**：Superpowers 的 brainstorming → writing-plans → executing-plans 能触发 prism 对应角色池

**参考**：Superpowers 的 Iron Law 硬门模式、brainstorming→plan→execute 链式流程

---

### [ ] C133 · gstack 集成

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `.claude/skills/prism-five/SKILL.md`（更新） |
| Dep | C132 |
| Est | 10 min |

**AC**：gstack `/office-hours` → Prototyper 池；`/plan-eng-review` → Builder 池

**参考**：gstack 的 persona 路由模式、plan-mode vs live-mode 命名惯例

---

### [ ] C134 · CHANGELOG + 文档收尾

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| Touch | `README.md`, `CHANGELOG.md`, `ARCHITECTURE.md` |
| Dep | C133 |
| Est | 15 min |

**AC**：README 更新到 92 agent 架构 + Taiyi 集成说明；CHANGELOG 记录 v0.4.0

---

### [ ] C135 · AGENTS.md 编写

| 字段 | 值 |
|------|-----|
| Role | 跨角色 |
| New | `AGENTS.md` |
| Dep | C134 |
| Est | 10 min |

**内容**：5 角色 × 92 agent 的目录索引 + 每个 agent 的 1 句话职责 + 触发命令。Agent 可据此自行 dispatch。

**AC**：`prism-agent list` 输出与 AGENTS.md 一致

---

**第 7 批小计：7 个 change，~1.5 h**

---

## 9. 依赖图

```
C001 → C002 → C003 → C004 → C005 → C006 → C007 → C008
                                                         │
                              ┌──────────────────────────┘
                              ▼
                        C009 → C010 → C011 → C012 → C013
                                                         │
          ┌──────────────────────────────────────────────┘
          ▼
    C014 → C015 → C016 → C017    (Prototyper L2)
              │
              ▼
    C018 → C019 → C020 → C021 → C022    (Builder L2)
              │
              ▼
    C023 → C024 → C025 → C026    (Sweeper L2)
              │
              ▼
    C027 → C028 → C029    (Grower L2)
              │
              ▼
    C030 ... C102    (74 SKILL.md，按角色顺序)
              │
              ▼
    C103 ... C110    (横切命令)
              │
              ▼
    C111 ... C128    (Hook + 动态机制)
              │
              ▼
    C129 ... C135    (测试 + 集成 + 文档)
```

---

## 10. 总览

| 批 | 内容 | Change 数 | 时间 | 说明 |
|:--:|------|:--:|:--:|------|
| 1 | Taiyi 集成 | 8 | 1.5 h | 地基，不可跳过 |
| 2 | L1 主链 | 5 | 1.0 h | 打通 5 角色接力 |
| 3 | L2 阶段入口 | 16 | 2.0 h | 细颗粒命令 |
| 4 | L3 Agent SKILL.md | 74 | 8.5 h | 模板批量：3 h |
| 5 | 横切命令 | 8 | 1.0 h | 交付链 |
| 6 | Hook + 动态机制 | 18 | 2.5 h | 守护 + 自动化 |
| 7 | 测试 + 集成 | 7 | 1.5 h | 收尾 |
| **合计** | | **135** | **17.5 h** | AI + 模板 ≈ 8 h |

```
135 change × 平均 8 min（AI 跑 + 模板脚本）= 约 8 小时 ≈ 1 天
```

---

## 附录 A：SKILL.md 批量生成脚本

```bash
#!/bin/bash
# 模板批量生成第 4 批 SKILL.md
# 用法：./scripts/gen-skills.sh

SKILL_DIR=".prism/agents"
TEMPLATE="$SKILL_DIR/_template.md"

# Prototyper agents（12 个）
for agent in problem-framer market-intelligence stakeholder-interviewer \
            tech-feasibility risk-assessor feedback-synthesizer pattern-analyzer; do
  sed "s/{{NAME}}/$agent/g; s/{{ROLE}}/prototyper/g" "$TEMPLATE" > "$SKILL_DIR/prism-$agent.md"
done

# Builder agents（17 个 + 7 平台专属）
for agent in db-schema-designer api-contract-designer dependency-auditor \
            feature-flag-engineer state-machine-designer resilience-designer \
            auth-engineer ci-cd-designer performance-engineer; do
  sed "s/{{NAME}}/$agent/g; s/{{ROLE}}/builder/g" "$TEMPLATE" > "$SKILL_DIR/prism-$agent.md"
done

# ... Sweeper/Grower/Maintainer 同理
echo "Generated SKILL.md files"
```

---

## 附录 B：参考系统设计模式

### ECC 模式

| 模式 | prism-five 对应 |
|------|----------------|
| `prp-*` 6 步主链 | L1 5 命令（feature/build/sweep/grow/ship） |
| 5 条执行路径 | L0 自然语言 / L1 全自动 / L2 细颗粒 / L3 直调 / 归档 |
| Hook 系统 | 第 6 批 13 个 hook |
| Language rules 外挂 | `.prism/rules/typescript/`（后续可加） |

### Superpowers 模式

| 模式 | prism-five 对应 |
|------|----------------|
| Iron Law 硬门 | 每个 SKILL.md 有 `## Iron Law` + `<fatal_constraints>` |
| brainstorming → writing-plans → executing-plans | Prototyper(change+requirement) → Builder(design+task+dev) |
| verification-before-completion | Sweeper(test+review) |

### gstack 模式

| 模式 | prism-five 对应 |
|------|----------------|
| Persona 路由 | 5 角色 → 5 个 persona（Explorer/Operator/Scout/Analyst/Guardian） |
| plan-mode vs live-mode | L2 阶段入口 vs L1 全自动 |
| `benefits-from` 依赖声明 | Taiyi change 的 Dep 字段 |
