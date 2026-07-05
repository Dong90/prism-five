# Roadmap

> Prism-Five：五棱镜数据管道 + 多 Profile 编排引擎。
> TaiyiForge 全部逻辑吸收进 Prism，**不使用 taiyi 命名**。所有能力以 Prism 原生方式重建。

---

## v0.1 — 骨架 ✅

- [x] monorepo 结构 (npm workspaces)
- [x] 5 包骨架 (incidence, refraction, dispersion, absorption, emission)
- [x] 共享 TypeScript 配置
- [x] README / ARCHITECTURE / CONTRIBUTING 文档
- [x] CI 基础 (typecheck + lint + test)

## v0.2 — 五棱镜核心 ✅

- [x] incidence: `incident<T>()` 类型安全事件入口
- [x] refraction: `refract<T,U>()` 纯函数变换
- [x] dispersion: `disperse<T>()` 多目标分发
- [x] absorption: `absorb<T>()` 多源聚合
- [x] emission: `emit<T>()` 可插拔输出
- [x] orchestrator: Pipeline 状态机 + 5 Agent Role
- [x] agent markdown 解析器

## v0.3 — Orchestrator 引擎升级

> 合并 13 个 Taiyi change 为 5 个工程条目。做完后多 profile、多平台 executor 才能动工。

### [ ] M1 · Schema 扩展 + Profile 系统

**合并自**: `schema-ts-profile-token-budget-artifact`、`pipeline-json-profile-token`、`orchestrator-profile-prism-new-profile-xxx`、`agent-prism-agents-prism-profiles-taiyi`

**内容**:
- `schema.ts` 新增字段：`profile`、`tokenBudget`（per-phase）、`artifactManifest`（per-role 工件清单）
- `pipeline.ts` `createFeature()` 接受 `profile` 参数
- `agent.ts` `loadAgent()` 从 `.prism/profiles/<profile>/<role>.md` 加载
- 现有 agent 文件迁移：`.prism/agents/*.md` → `.prism/profiles/develop/*.md`
- `pipeline.json` 结构升级到 v0.2

**AC**: `PipelineStateSchema.safeParse()` 通过；`createFeature('foo', { profile: 'taiyi' })` 正确记录

### [ ] M2 · 删除 taiyi-bridge + 独立状态

**合并自**: `taiyi-bridge-ts-pipeline`

**内容**: 删除 `taiyi-bridge.ts`；pipeline 不再读取 `.taiyi/changes/`；以 `.prism/pipeline.json` 为唯一真源

**AC**: `npm run build` clean；无 `.taiyi` 目录依赖

### [ ] M3 · 增强门控 + 工件追踪

**合并自**: `design-reviewed-review-approved`、`agent-role`

**内容**: `GateStateSchema` 扩展为 5 道门（3 人审 + 2 自动）；`ARTIFACT_MAP` 定义每 role 必须工件；`checkAutoGate()` 增加工件完整性检查

**5 道门控**:
```
prototype_approved   ← 👤 人审（prototyper → builder）
design_reviewed      ← 👤 人审（builder → sweeper）
sweep_passed         ← 🔄 自动（sweeper → grower）
review_approved      ← 👤 人审（grower → maintainer）
release_approved     ← 👤 人审（maintainer → live）
```

**AC**: 工件缺失时 auto gate 返回 `reason: "missing artifact: raw/PRD.md"`

### [ ] M4 · Executor 薄层（三平台后端）

**合并自**: `executor-executor-interface`、`executor-orchestrator-opencode-task`、`executor-codex-cli`、`executor-cursor-agent`、`opencode-skill-prism-profile-agent-skill`

**内容**:
- 新增 `executor.ts`：定义 `Executor` 抽象接口，paradigm → category/model 映射
- `OpenCodeExecutor`：调用 `task()`，原生集成
- `CodexExecutor`：构建 CLI 命令字符串
- `CursorExecutor`：构建 agent prompt
- Profile agent markdown → OpenCode skill 注册

**AC**: 三种 executor 可通过 `PRISM_EXECUTOR` 环境变量切换；agent 可注册为 OpenCode 可加载 skill

### [ ] M5 · CLI 命令层

**合并自**: `cli-prism-new-continue-status-verify-archive`

**命令**:
```
prism new <slug> --profile <name>    创建 feature
prism status [slug]                  查看状态
prism continue <slug>                推进下一个 role
prism approve <slug> <gate>          人审通过
prism verify <slug>                  CI 工件检查
prism archive <slug>                 归档
```

**AC**: `prism new test --profile develop` 创建 feature；`prism status` 输出 role + gate 状态

### [ ] M6 · 跨会话 Checkpoint（TaiyiForge HANDOFF 迁移）

**内容**:
- 将 TaiyiForge 的 `/taiyi:pause` + `/taiyi:continue` + `HANDOFF.md` 吸收为 Prism 原生能力
- 新增 `checkpoint.ts`：会话结束时自动保存当前 feature 状态 + 未完成步骤 + 上下文摘要
- 新增 `resume.ts`：会话恢复时加载 checkpoint，重建 agent 上下文
- `prism pause [slug]`：保存 checkpoint
- `prism resume [slug]`：恢复上次 checkpoint

**AC**: crash 或手动 pause 后 `prism resume` 无信息损失

### [ ] M7 · 活动日志（TaiyiForge activity.jsonl 迁移）

**内容**:
- 将 TaiyiForge 的 `activity.jsonl` 吸收为 Prism 原生审计日志
- 新增 `logger.ts` 增强：记录每次 agent dispatch、gate check、artifact write
- `.prism/activity.jsonl`：结构化日志行
- `prism history <slug>`：读取并格式化展示

**AC**: 每个 feature 有完整可审计的操作时间线

### [ ] M8 · Profile 配置变体（TaiyiForge profile full/api/lite 迁移）

**内容**:
- 每个 profile 支持变体配置：`full`（5 role 全跑）、`api`（跳过 ui-design 阶段）、`lite`（3 role 最小集）
- `profile-config.ts`：定义变体映射规则
- `prism new --profile develop --variant api` 创建变体 feature

**AC**: 同一套 agent 文件，不同变体跳过不同 role

### [ ] M9 · Auto Harness 铁三角（TaiyiForge auto harness 迁移）

**内容**:
- 将 TaiyiForge 的铁三角机制吸收为 gate 前置检查
- `harness.ts`：每个 role 执行前自动检查 3 项
  - brainstorming（创意任务之前）
  - plan review（架构任务之前）
  - verification（完成声明之前）
- 检查失败 → gate blocked，提示具体缺失项

**AC**: prototyper 执行前自动触发 brainstorming check

### [ ] M10 · 批量 Plan 系统（TaiyiForge /taiyi:plan 迁移）

**内容**:
- 将 TaiyiForge 的 `/taiyi:plan` 吸收为 `prism plan`
- 输入 README/PRD → 拆解为多个独立 feature → 分析依赖关系 → 推荐执行顺序
- 输出 `.prism/plan/<plan-name>.json`

**AC**: `prism plan docs/ROADMAP.md` 产出多 feature DAG

### [ ] M11 · 多平台 CI 同步（TaiyiForge taiyi_ci_platform 迁移）

**内容**:
- 将 TaiyiForge 的 CI 平台同步吸收为 `prism ci sync`
- `ci.ts`：skill 同步到 opencode / claude / codex / cursor
- `prism ci sync --platform opencode` 同步当前 profile agent skill

**AC**: 一键同步 agent skill 到目标平台

---

## v0.4 — Profile 生态（后置）

> develop profile 已在 v0.3 完成。以下 5 套在引擎稳定后逐步补齐。

### [ ] P1 · observability Profile（Agent 可观测性）

5 agent：定义指标 → 构建面板 → 告警降噪 → 趋势分析 → 跑书运维

### [ ] P2 · security Profile（安全审计与加固）

5 agent：威胁建模 → 审计工具 → 漏洞扫描 → 风险评估 → 修复跟踪

### [ ] P3 · video Profile（视频内容生产管线）

5 agent：选题策划 → 内容制作 → 审片把关 → 数据复盘 → 分发运营

### [ ] P4 · collab Profile（多 Agent 协作）

5 agent：任务拆解 → 分配执行 → 结果验证 → 冲突消解 → 交付合成

### [ ] P5 · experiment Profile（A/B 实验平台）

5 agent：假设设计 → 实验配置 → 分流验证 → 统计推断 → 决策上线

---

## v0.5 — 运营与发布

- [ ] S1 · Token 预算：per-phase 配额追踪 + 超限告警
- [ ] S2 · CI 验证：`prism verify` 工件完整性 + schema 校验
- [ ] S3 · examples：端到端串联示例
- [ ] S4 · 测试覆盖率 80%+
- [ ] S5 · 发布到 npm
- [ ] S6 · rename develop profile：清除所有 `taiyi` 命名残留（目录、代码注释、文档）

---

## 架构演进

```
v0.1–v0.2:              v0.3:                   v0.4:                  v0.5:
┌──────────────┐       ┌──────────────────┐    ┌──────────────────┐   ┌──────────┐
│ 五棱镜管道    │       │ 五棱镜管道 (不动)  │    │ 五棱镜管道 (不动)  │   │ 五棱镜   │
│ (5 纯函数包)  │       │                  │    │                  │   │ (不动)   │
│              │  →    │ orchestrator      │ → │ orchestrator      │ → │ 运营     │
│ orchestrator │       │ · 多 profile      │    │ · 6 套 profile    │   │ · Token  │
│ (基础版)     │       │ · 5 道门控        │    │ · 30 个 agent     │   │ · CI     │
│              │       │ · Executor 三平台  │    │ · skill 自动注册  │   │ · npm    │
│              │       │ · CLI + Checkpoint │    │                  │   │          │
│              │       │ · 活动日志 + Plan  │    │                  │   │          │
│              │       │ · Auto Harness     │    │                  │   │          │
└──────────────┘       └──────────────────┘    └──────────────────┘   └──────────┘
```

## 已登记的 Taiyi Change（20 → 17 合并后）

| M# | 标题 | 合并数 |
|----|------|:-----:|
| M1 | Schema 扩展 + Profile 系统 | 4 |
| M2 | 删除 taiyi-bridge + 独立状态 | 1 |
| M3 | 增强门控 + 工件追踪 | 2 |
| M4 | Executor 薄层（三平台） | 5 |
| M5 | CLI 命令层 | 1 |
| M6 | 跨会话 Checkpoint | 1 |
| M7 | 活动日志 | 1 |
| M8 | Profile 配置变体 | 1 |
| M9 | Auto Harness 铁三角 | 1 |
| M10 | 批量 Plan 系统 | 1 |
| M11 | 多平台 CI 同步 | 1 |
| P1 | observability Profile | 1 |
| P2 | security Profile | 1 |
| P3 | video Profile | 1 |
| P4 | collab Profile | 1 |
| P5 | experiment Profile | 1 |
| S1 | Token 预算 | 1 |
| S6 | examples + 测试 + 发布 + 命名清理 | 0 |
| | **合计** | **26** |

## TaiyiForge 完整迁移对照表

> 逐项对账，确保零遗漏。

### 已覆盖 ✅

| TaiyiForge | Prism | M# |
|-----------|-------|:--:|
| 9 阶段工作流 | 5 角色 develop profile | 已有 |
| state.json | .prism/pipeline.json | M1 |
| /taiyi:new | prism new | M5 |
| /taiyi:continue | prism continue | M5 |
| /taiyi:status | prism status | M5 |
| /taiyi:archive | prism archive | M5 |
| /taiyi:verify | prism verify | S2 |
| /taiyi:pause + handoff | prism pause/resume | M6 |
| activity.jsonl | .prism/activity.jsonl | M7 |
| profile full/api/lite | prism variant | M8 |
| iron triangle auto harness | auto harness | M9 |
| /taiyi:plan | prism plan | M10 |
| taiyi_ci_platform | prism ci sync | M11 |
| 人审门 (approver) | GateStateSchema 5 门 | M3 |
| /taiyi:token status/record | Token 预算追踪 | S1 |
| executor dispatch | OpenCode/Codex/Cursor executor | M4 |

### 遗漏 ❌ — 需要新增

| TaiyiForge | 应映射为 | 分类 |
|-----------|---------|------|
| /taiyi:cancel | prism cancel | CLI 补齐 |
| /taiyi:list | prism list | CLI 补齐 |
| /taiyi:doctor | prism doctor | CLI 补齐 |
| /taiyi:guide | prism guide（下一步指引） | CLI 补齐 |
| /taiyi:check | prism check（快速质量门） | CLI 补齐 |
| /taiyi:sync | prism sync（状态自修复） | CLI 补齐 |
| /taiyi:init | prism init（初始化项目） | CLI 补齐 |
| /taiyi:commit + /taiyi:ship + /taiyi:land | prism commit / ship / land（交付链） | 交付链 |
| /taiyi:write | agent artifact writer | 辅助模块 |
| /taiyi:bug | prism bug（缺陷追踪） | 追踪 |
| CONTEXT.md per change | per-feature context snapshot | 状态 |
| LEARNINGS.md | project-wide LEARNINGS | 状态 |
| taiyi_remember | project-memory.json | 状态 |
| /taiyi:token compress | Token 压缩编排 | 辅助模块 |
| /taiyi:token scan | Token 使用分析 | 辅助模块 |
| taiyi-health | prism health（代码库巡检） | 辅助模块 |
| taiyi-intel-scan | prism scan（代码库情报扫描） | 辅助模块 |
| taiyi-architect | prism adr（架构决策记录） | 辅助模块 |
| taiyi-evolve | prism evolve（实现后架构同步） | 辅助模块 |
| taiyi-reanalyze | prism reanalyze（工件矛盾检测） | 辅助模块 |
| taiyi-restyle | prism restyle（UI 改版任务清单） | 辅助模块 |
| taiyi-diagram-arch | prism diagram arch（系统架构图） | 图表 |
| taiyi-diagram-flow | prism diagram flow（流程图/状态机） | 图表 |
| taiyi-diagram-c4 | prism diagram c4（C4 反推） | 图表 |
| taiyi-diagram-pipeline | prism diagram pipeline（图表三步流水线） | 图表 |
| taiyi-diagram-render | prism diagram render（Mermaid→SVG/PNG） | 图表 |
| profile ui/spike/micro/nano/audit | variant 扩展 | Profile |
| autopilot mode | prism autopilot（全自主） | 运行模式 |
| ralph mode | prism loop（验证循环） | 运行模式 |
| ultrawork mode | prism ultrawork（并行切片执行） | 运行模式 |
| team mode | prism team（多 agent 协作执行） | 运行模式 |
| taiyi_sync_openspec | prism openspec sync | 集成 |
| /taiyi:ci prompt | prism ci prompt | CI |

---

### 新增 Change 清单（展开为详细子项）

#### M12 · CLI 补齐：7 个命令

| 子项 | 命令 | 文件 | AC |
|:---:|------|------|-----|
| M12a | `prism cancel <slug>` | `cli/src/commands/cancel.ts` | feature 标记 aborted，释放队列位 |
| M12b | `prism list [--active\|--all]` | `cli/src/commands/list.ts` | 表格输出所有 feature 及状态 |
| M12c | `prism doctor [--strict]` | `cli/src/commands/doctor.ts` | 检查 workspace 健康：profile 目录存在、pipeline.json 可读、agent 文件完整 |
| M12d | `prism guide [slug]` | `cli/src/commands/guide.ts` | 输出当前 feature 的下一步 action |
| M12e | `prism check <slug>` | `cli/src/commands/check.ts` | 快速质量门：只跑 typecheck+lint，5s 内出结果 |
| M12f | `prism sync [slug]` | `cli/src/commands/sync.ts` | 磁盘状态 → pipeline.json 自动对齐（补缺漏、修正不一致） |
| M12g | `prism init [--profile develop]` | `cli/src/commands/init.ts` | 初始化项目：创建 .prism/ 结构 + 写入初始 pipeline.json |

#### M13 · 交付链

| 子项 | 命令 | 文件 | AC |
|:---:|------|------|-----|
| M13a | `prism commit <slug>` | `cli/src/commands/commit.ts` | git add + commit + `Prism-Change: <slug>` trailer 自动追加 |
| M13b | `prism ship <slug>` | `cli/src/commands/ship.ts` | push + `gh pr create` + 关联 issue，必须所有 gate 通过 |
| M13c | `prism land <slug>` | `cli/src/commands/land.ts` | merge PR + 等待 CI + deploy hook |

#### M14 · 状态扩展

| 子项 | 功能 | 文件 | AC |
|:---:|------|------|-----|
| M14a | per-feature context snapshot | `orchestrator/src/context.ts` | 每个 feature 保存 CONTEXT.md：当前 role、已产出工件、阻塞项、下一步 |
| M14b | LEARNINGS.md 全局 | `orchestrator/src/learnings.ts` | 跨 feature 学习积累：失败模式、成功模式、可复用方案 |
| M14c | project memory | `orchestrator/src/memory.ts` | `.prism/project-memory.json`：技术栈、惯例、约束，跨 feature 持久化 |

#### M15 · Token 管理

| 子项 | 功能 | 文件 | AC |
|:---:|------|------|-----|
| M15a | Token 预算定义 | `orchestrator/src/token-budget.ts` | 在 pipeline.json 存 per-role quota |
| M15b | Token 实时追踪 | 同上 | executor 每次调用后更新 used + 检查是否超限 |
| M15c | Token 超限告警 | 同上 | 超限 → gate blocked + 报告哪 phase 超标 |
| M15d | Token 压缩 | 同上 | 触发条件：上下文接近上限 → 自动 COMPACT + HANDOFF |
| M15e | Token 扫描 | `cli/src/commands/token.ts` | `prism token status/scan` 查看各 feature 用量 |

#### M16 · Bug 追踪

| 子项 | 功能 | 文件 | AC |
|:---:|------|------|-----|
| M16a | `prism bug <slug> --severity P0-P3` | `cli/src/commands/bug.ts` | 创建 bug feature，继承关联 feature 上下文 |
| M16b | Bug 与 feature 关联 | `orchestrator/src/schema.ts` | PipelineState 支持 `linkedBugs` 字段 |
| M16c | 修复回归门 | `orchestrator/src/gate.ts` | bug fix 必须补齐对应测试才放行 |

#### M17 · Profile variant 扩展

| 子项 | variant | 跳过 role |
|:---:|---------|-----------|
| M17a | `ui` | 跳过 grower（无数据阶段） |
| M17b | `spike` | 只跑 prototyper（研究专用） |
| M17c | `micro` | 只跑 builder + sweeper |
| M17d | `nano` | 单 agent 直调（prototyper 一步跑完） |
| M17e | `audit` | 只跑 sweeper（只读分析） |

#### M18 · OpenSpec 同步

| 子项 | 文件 | AC |
|:---:|------|-----|
| M18a | `orchestrator/src/openspec-sync.ts` | 读 pipeline 状态 → 写 openspec/changes/<slug>/ 目录 |
| M18b | `prism openspec sync <slug>` | 双向同步：工件 → openspec design.md/tasks.md/specs/ |

---

#### 新增：M19-M24 · 第二轮缺漏补齐

| # | 标题 | 文件 | AC |
|---|------|------|-----|
| M19 | Quality self-check 执行引擎 | `orchestrator/src/quality.ts` | agent.md `## Quality self-check` 段自动解析为 checklist，gate 检查是否全部通过 |
| M20 | Escalation 系统 | `orchestrator/src/escalation.ts` | agent.md `## Escalation` 表解析为自动规则：3 次 retry 失败 → escalate、critical 发现 → 立即 escalate |
| M21 | Exemption 豁免系统 | `orchestrator/src/schema.ts` | Feature 支持 `exemptions` 字段：跳过某个 role（附原因、审批人、过期时间） |
| M22 | Queue 优先级 + Stage 升级 | `orchestrator/src/queue.ts` + `pipeline.ts` | P0 优先执行；产品级 stage 从 exploring → building → growing → mature |
| M23 | Feature 完整生命周期 | `orchestrator/src/schema.ts` | 状态补全：draft → ... → live → incident → deprecated → sunset |
| M24 | Pre-flight 执行引擎 | `orchestrator/src/preflight.ts` | agent.md `## Pre-flight` 段自动解析为启动前检查，失败 → gate blocked |

---

#### v0.6 — 辅助模块（8 项，展开子项）

| # | 标题 | 文件 |
|---|------|------|
| A1a | `prism health` | `cli/src/commands/health.ts` + `orchestrator/src/health.ts` |
| A2a | `prism scan` | `cli/src/commands/scan.ts` + `orchestrator/src/intel-scan.ts` |
| A3a | `prism adr <title>` | `cli/src/commands/adr.ts` |
| A4a | `prism evolve <slug>` | `cli/src/commands/evolve.ts` + `orchestrator/src/evolve.ts` |
| A5a | `prism reanalyze <slug>` | `cli/src/commands/reanalyze.ts` |
| A6a | `prism restyle <slug>` | `cli/src/commands/restyle.ts` |
| A7a | `prism diagram arch/flow/c4` | `cli/src/commands/diagram.ts` |
| A7b | Mermaid → SVG/PNG render | `orchestrator/src/diagram-render.ts` |
| A8a | `prism autopilot <slug>` | `cli/src/commands/autopilot.ts` + `orchestrator/src/autopilot.ts` |

#### v0.6 追加 — 运行模式（4 项，展开子项）

| # | 标题 | 文件 | AC |
|---|------|------|-----|
| R1a | `prism loop <slug> --max-rounds 10` | `cli/src/commands/loop.ts` + `orchestrator/src/loop.ts` | 验证循环：run → fail → fix → retry，直到绿或达上限 |
| R2a | `prism ultrawork <slug>` | `cli/src/commands/ultrawork.ts` + `orchestrator/src/ultrawork.ts` | TASK.md 拆成独立切片，并行 execute |
| R3a | `prism team <slug> --size 5` | `cli/src/commands/team.ts` + `orchestrator/src/team.ts` | 派发 N 个 agent 并行工作，merge 结果 |
| R4a | `prism ci prompt` | `cli/src/commands/ci-prompt.ts` | 生成 CI 可执行的 prompt

---

### 最终总数

| 分类 | 原有 | 新增 | 小计 |
|------|:--:|:--:|:--:|
| M (引擎) | 24 | Schema/Profile/门控/Executor/CLI/Checkpoint/日志/Plan/Harness/CI/Quality/Escalation/豁免/队列/生命周期/Preflight |
| P (Profile) | 5 | observability/security/video/collab/experiment |
| S (运营) | 6 | Token/CI/examples/覆盖率/npm/命名清理 |
| A (辅助模块) | 9 | health/scan/adr/evolve/reanalyze/restyle/diagram(x2)/autopilot |
| R (运行模式) | 4 | loop/ultrawork/team/ci-prompt |
| **合计** | **48** |

## 执行依赖顺序

```
M1──►M2──►M3──►M4──►M5──►M6──►M7
 │                        │
 ├─ M8 (variant)          ├─ M12 (CLI补齐)──►M13 (交付链)
 │                        │
 ├─ M9 (harness)          ├─ M14 (状态扩展)
 │                        │
 └─ M11 (CI sync)         ├─ M15 (token)
                          │
                          ├─ M16 (bug追踪)
                          │
                          ├─ M17 (variant扩展)
                          │
                          ├─ M18 (openspec)
                          │
                          ├─ M19-M24 (质量/Escalation/豁免/队列/生命周期/Preflight)
                          │
                          ▼
                    P1─P5 (profile生态)
                          │
                          ▼
                    S1─S6 (运营)
                          │
                          ▼
                    A1─A8 (辅助模块)
                          │
                          ▼
                    R1─R4 (运行模式)
```

> M1-M7 是基底线，必须串行。M8-M18 可部分并行。P/S/A/R 放最后。
