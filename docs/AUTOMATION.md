# Pentad 动态机制

> 与 COMMAND-DESIGN.md 互补——本文档讲**后台运行**的机制，COMMAND-DESIGN.md 讲**用户面**的命令
>
> 状态: 已讨论 / 待落地 (本文档为设计 spec，不含已落地代码)
>
> 适用版本: prism-five v0.4.x 规划

---

## 目录

1. [核心论点](#1-核心论点)
2. [已有机制（代码层）](#2-已有机制代码层)
3. [已有机制（隐式 / 缺）](#3-已有机制隐式--缺)
4. [借鉴 ECC 的动态机制](#4-借鉴-ecc-的动态机制)
5. [汇总：动态机制清单](#5-汇总动态机制清单)
6. [分阶段实施](#6-分阶段实施)
7. [13 个 Hook 详细清单](#7-13-个-hook-详细清单)
8. [文件结构](#8-文件结构)
9. [参考对照](#9-参考对照)

---

## 1. 核心论点

**动态机制与命令同等重要——"全自动"不只是命令的事，更是后台机制的事。**

文档 COMMAND-DESIGN.md 写的是**静态蓝图**（4 层 + 132 命令），但要真正落地"全自动"还需要**后台机制**：
- 守护 Hook：自动跑 lint+typecheck+test（人不必记得）
- 状态机：原子写入、自动 reconcile
- 重试 / 升级：失败自动恢复
- 调度：长期任务自动驱动
- 幂等：相同输入可重跑

**没有这些机制，"全自动"只是表面的——背后仍然依赖人记住所有事**。

ECC 的 hook 系统就是为这个目的：它把所有"重要但不紧急"的事自动化，**用户不需要记住**。

---

## 2. 已有机制（代码层）

### A. Pipeline 状态机（`packages/orchestrator/src/pipeline.ts`）

```
┌────────────────────────┐
│ pipeline.json 真源     │
│ state + activeFeature  │
└────────────────────────┘
          │ (命令)
          ▼
┌────────────────────────┐
│ checkHumanGate()       │  ← 人工门 (prototype/release)
│ checkAutoGate()        │  ← 自动门
└────────────────────────┘
```

**已有**：
- `checkHumanGate()` 拦截 prototyper / maintainer
- `checkAutoGate()` 在 builder / sweeper / grower 阶段自动判断
- 状态机串接 5 个 role

**可强化**：
- 自动门检查可加入"深度检测"（比如跑测试时不仅看 exit code，还看产出物）
- 支持弹性 gate（warning 通过但记录）
- 失败升级路径：auto 失败 → 升级 human gate

### B. AgentRuntime（`packages/orchestrator/src/runtime.ts`）

**已有**：
- `dispatch(feature)` —— 装载 SKILL.md
- `buildPrompt(feature)` —— 出 LLM prompt
- `formatPlan(plan)` —— CLI 表格展示
- `logExecution(feature, plan)` —— 记录执行历史

这是 L1 / L2 主链的运行时骨架。

### C. Prompt Builder（`packages/orchestrator/src/prompt.ts`）

```
agent-identity → iron-law → constraints → tools → fatal-constraints
                                                       ↓
                                                 system prompt
                                                       ↓
                                       steps + quality + context
                                                       ↓
                                                  user prompt
```

**已有**：把 SKILL.md 解析成 system+user 双 prompt。

**可强化**：
- 加 `--language <ts|python>` 自动注入语言包
- 加 `--tier <quick|standard|exhaustive>` 控制 agent 力度
- 加 token budget awareness（截断超长 steps）

### D. QueueManager（`packages/orchestrator/src/queue.ts`）

**已有**：优先级 P0 / P1 / P2 队列管理。

**可强化**：
- 自动优先级提升（如果 feature 卡 7 天不动）
- "超龄自动重新排序"机制
- 跨 feature 依赖图（DAG）

### E. 状态持久化（`packages/orchestrator/src/state.ts`）

**已有**：`.prism/pipeline.json` 读写。

**可强化**：
- 加 atomic write（写 tmp, rename，避免半路中断坏掉）
- 加 `.prism/pipeline.json.bak` 自动备份
- 启动时自动 reconcile（基于 backup 恢复）

---

## 3. 已有机制（隐式 / 缺）

### F. Gate（`packages/orchestrator/src/gate.ts`）

**已有**：
- `gateSummary()` 返回 passed / total
- Human gate: `prototype_approved`, `release_approved`
- Auto gate: `build_reviewed`, `sweep_passed`

**缺**：
- 弹性 gate（"warning 仍可通过，但需日志"）
- Gate 升级路径（auto 失败 → 升级 human）

### G. Hook（zero）

**现状**：完全没实现。

ECC 的 hook（PreToolUse / PostToolUse / Stop）是核心。如果要做"全自动"，必须加：

```
Pre-tool:
  pre:bash           bash 前安全检查
  pre:write          写文件前 quality-gate
  pre:read           读文件前 gateguard

Post-tool:
  post:write         写后质量门
  post:tool          工具调用后 LEARNINGS

Stop:                
  stop:typecheck     会话结束自动 tsc
  stop:format        会话结束自动 prettier
  stop:cost          自动计费
  stop:session-save  自动 HANDOFF.md
```

详见 [§7 13 个 Hook 详细清单](#7-13-个-hook-详细清单)。

### H. Scheduler（zero）

**现状**：靠用户手动 `prism continue`。

**待加**：
- 定时器：Grower 阶段每 24h 自动 check 样本是否够
- 事件驱动：Maintainer canary 完成自动 ship
- Cron：每周自动 `prism operate <feature>`

### I. Concurrency Control（zero）

**现状**：L1 命令是**串行**跑 132 个 agent。

**待加**：
- 读类 agent（如 trend-researcher, codebase-mapper）可并发
- 写类 agent（如 frontend-developer, data-engineer）必须串行
- 加 `--parallel` / `--sequential` flag

### J. Retry / Failure Recovery（partial）

**现状**：单 agent 失败只靠 `continue` 后的 gate 拦截。

**待加**：
- 每个 agent 都配 `retry: 3` 配置
- 失败自动 escalate 到人（不是 halting）
- `grow-idle` 自动恢复（样本足够时唤醒）
- 跨 feature rollback（一个 feature 失败，全部回滚）

### K. Observability / Logging（minimal）

**现状**：`structured logger` 已有基础（debug / info / warn / error）。

**待加**：
- 每个 agent 写自己的 `execution_log.json`
- 跨 feature 决策可追溯
- Token 用量（agent 按调用计费，per-feature 显示）

### L. Caching（zero）

**现状**：每次跑都重新读 SKILL.md / 重新解析。

**待加**：
- SKILL.md 解析结果 cache 到 `.prism/cache/`
- LLM 调用结果 cache（如 `pentad-ux-architect` 短时相同输入 = 同输出）

### M. Routing / Intent Recognition（L0）

**现状**：L0 在脑子里，没有实现。

**待加**：
- `prism route "..."` —— 用户自然语言 → 自动 dispatch
- 关键词 + 角色名识别

### N. Cross-Feature Coordination（partial）

**现状**：`QueueManager` 有但很弱。

**待加**：
- `prism cascade <feature>` —— 一个 feature 触发相关 feature
- 跨 feature 锁（一个 feature 在 builder 时，同 feature in grow 等待）
- Feature 依赖图（dependency DAG）

### O. Stale-state Detection（zero）

**现状**：状态可能因 crash 半路损坏，无检测。

**待加**：
- 启动时 `prism state-check`
- 检测孤儿 artifact（pipeline.json 说 live 但 raw/ 不存在）
- 自动 reconcile 状态

### P. Hot Reload of SKILL.md（zero）

**现状**：修改 SKILL.md 后必须重启进程。

**待加**：
- `prism skill-reload` —— 热加载
- 文件 watcher 自动重载

### Q. Plugin / MCP Interface（zero）

**现状**：CLI 单进程。

**待加**：
- MCP server: 外部 IDE 接入 Pentad 状态
- Plugin: 第三方加自定义 agent

---

## 4. 借鉴 ECC 的动态机制

### R. Continuous Learning（ECC `continuous-learning-v1/v2`）

每次 tool 调用后自动观测：

```
tool call → "this succeeded / failed / was unoptimized"
                            ↓
                  update .prism/LEARNINGS.md
                            ↓
          next run sees LEARNINGS.md, behaves smarter
```

**设计要点**：hook post:tool 实现，不需新增命令。

### S. Strategic Compact（ECC `strategic-compact`）

长会话 token 超阈值自动压缩：

```
session tokens > 50k
                ↓
        handoff.md + CONTEXT-COMPACT.md
                ↓
        fresh context, read COMPACT only
```

**设计要点**：自动写 CONTEXT-COMPACT.md，下次启动只读它。

### T. Verification Loop（ECC 自愈）

```
verify PRD ↔ 实现
    ↓ mismatch
grow → builder loop
    ↓
fixed
```

**设计要点**：Builder 出 PR 后自动 verify，失败自动循环回 builder。

### U. Token Budget Advisor（ECC `token-budget-advisor`）

```
feature tokens: 250k / 1M
                ↓
warn: "Grower 阶段 token 已用 60%，建议 strategic-compact"
```

**设计要点**：实时计算，超阈值自动提醒。

### V. Cost Tracker（ECC `cost-tracker`）

```
per-agent LLM cost tracking
                        ↓
              monthly budget cap
                        ↓
                  soft / hard halt
```

**设计要点**：每 agent 计费，per-feature 显示。

### W. Skill Health（ECC `skill-health`）

定期检查 SKILL.md：
- 内容是否过期
- 引用是否失效
- 语法是否仍然 parse

**设计要点**：cron 跑 `prism skill-health`。

### X. Hash & Fingerprint（zero）

每次执行留指纹：

```
input_fingerprint + agent + timestamp → execution_id
```

重跑相同 input 应该幂等。

**设计要点**：写 `execution_log.json` 时包含 fingerprint；二次执行前查询已有 fingerprint。

---

## 5. 汇总：动态机制清单

| # | 机制 | 重要性 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | **Hook（Pre / Post / Stop）** | **必须** | ❌ | ECC 全部 11 类，Pentad 13 类（详见 §7） |
| 2 | **Auto-retry 机制** | **必须** | ❌ | 每个 agent 配 retry + escalate |
| 3 | **Concurrency** | 高 | ❌ | 读并发 / 写串行规则 |
| 4 | **Scheduler** | 高 | ❌ | Grower 自动 idle 检查 |
| 5 | **State check / reconcile** | 高 | ❌ | 启动时自动检测孤儿 |
| 6 | **Stale cache invalidation** | 中 | ❌ | SKILL.md 修改自动重载 |
| 7 | **Atomic write** | 中 | ❌ | pipeline.json write 原子化 |
| 8 | **Logging / observability** | 中 | ⚠️ | 已有基础，需增强 |
| 9 | **L0 Natural-language router** | 中 | ❌ | `prism route "..."` |
| 10 | **Cross-feature lock** | 中 | ❌ | feature DAG |
| 11 | **Caching** | 低 | ❌ | SKILL.md 解析 + LLM 结果 |
| 12 | **Continuous learning** | 低 | ❌ | 自动沉淀 LEARNINGS |
| 13 | **Strategic compact** | 低 | ❌ | 自动 token 压缩 |
| 14 | **Verification loop** | 低 | ❌ | 自愈机制 |
| 15 | **Token budget advisor** | 低 | ❌ | 提醒预算 |
| 16 | **Cost tracker** | 低 | ❌ | 按 feature 计费 |
| 17 | **Skill health check** | 低 | ❌ | 定期校验 SKILL.md |
| 18 | **Hot reload** | 低 | ❌ | SKILL.md 热加载 |
| 19 | **Plugin / MCP** | 低 | ❌ | 第三方接入 |
| 20 | **Idempotency hash** | 低 | ❌ | 相同输入幂等 |

---

## 6. 分阶段实施

### Phase A — 核心机制（5 项）

**目标**：补足"全自动"的最低必要条件

| # | 机制 | 落地内容 |
|---|------|---------|
| 1 | Hook（核心 8 个） | 详见 §7 第一批 |
| 2 | Auto-retry | 每个 agent 配 `retry: 3` + escalate |
| 3 | Concurrency | 读并发 / 写串行规则 + 调度器 |
| 4 | State check / reconcile | 启动时自动检测 |
| 5 | Atomic write | pipeline.json 写 tmp + rename |

预计 1-2 周工作量。

### Phase B — 高优 4 项

| # | 机制 | 落地内容 |
|---|------|---------|
| 6 | Scheduler | 定时器 + 事件驱动 + Cron |
| 7 | L0 router | 自然语言 → intent |
| 8 | Cross-feature lock | feature DAG |
| 9 | Logging 增强 | per-agent execution_log.json |

预计 1 周工作量。

### Phase C — 自优化 5 项

| # | 机制 | 落地内容 |
|---|------|---------|
| 10 | Caching | `.prism/cache/` |
| 11 | Continuous learning | hook post:tool 实现 |
| 12 | Strategic compact | CONTEXT-COMPACT.md 自动写 |
| 13 | Verification loop | builder ↔ verify 自愈 |
| 14 | Hot reload | file watcher |

预计 2 周工作量。

### Phase D — 生态 4 项

| # | 机制 | 落地内容 |
|---|------|---------|
| 15 | Token budget / cost tracker | per-feature 计费 |
| 16 | Skill health | 定期校验 |
| 17 | Plugin interface | 第三方 agent 接入 |
| 18 | MCP server | 外部 IDE 接入 |

预计 2 周工作量。

---

## 7. 13 个 Hook 详细清单

### 第一批：核心 8（Phase A 必做）

| # | Hook | 事件 | 检查内容 |
|---|------|------|---------|
| 1 | `pre:bash:guard` | PreToolUse (Bash) | 防 `rm -rf` / 误触 `deploy --prod` |
| 2 | `pre:write:lint-guard` | PreToolUse (Write) | 禁止改 lint 配置 |
| 3 | `pre:write:quality-gate` | PreToolUse (Write) | 写前 PRD 匹配 |
| 4 | `post:write:quality-gate` | PostToolUse (Write) | 写后 lint + test |
| 5 | `post:write:console-check` | PostToolUse (Write) | 防止 console.log 漏到生产 |
| 6 | `post:bash:log` | PostToolUse (Bash) | 记录所有 bash |
| 7 | `stop:typecheck` | Stop | 自动 `tsc --noEmit` |
| 8 | `stop:format` | Stop | 自动 `prettier --write` |

### 第二批：高价值 5（Phase B）

| # | Hook | 事件 | 价值 |
|---|------|------|------|
| 9 | `post:tool:continuous-learning` | PostToolUse | 自动 LEARNINGS |
| 10 | `pre:read:gate-guard` | PreToolUse (Read) | 防 LLM 编造 |
| 11 | `session-start:history` | SessionStart | 启动加载上下文 |
| 12 | `stop:session-persistence` | Stop | 自动 HANDOFF |
| 13 | `pre:write:design-quality` | PreToolUse (Write) | 设计规范检查 |

### 与 ECC 对照

| ECC 类别 | ECC Hook 数 | Pentad 取用 |
|---------|------------|------------|
| PreToolUse (Bash) | 1 | 1 (核心 1) |
| PreToolUse (Write) | 2 | 3 (核心 2-4 + 高价值 13) |
| PreToolUse (Read) | 2 | 1 (高价值 10) |
| PreToolUse (ecc) | 2 | 0 |
| PreCompact | 1 | 0 |
| PostToolUse | 7 | 4 (核心 4-6 + 高价值 9) |
| PostToolUseFailure | 1 | 0 |
| SessionStart | 1 | 1 (高价值 11) |
| Stop | 5 | 4 (核心 7-8 + 高价值 12) |
| SessionEnd | 1 | 0 |
| **总计** | **23** | **13** |

**Pentad 13 类比 ECC 23 类少 10 类**——少的是 ECC 专属（MCP / governance / metrics），这些 Pentad 不需要。

### Hook 实现接口

```typescript
// packages/orchestrator/src/hooks/registry.ts

export interface Hook {
  event: 'PreToolUse' | 'PostToolUse' | 'Stop' | 'SessionStart';
  tool?: string; // 限制触发的工具名（可选）
  action: (input: HookInput) => Promise<HookResult>;
}

export interface HookResult {
  ok: boolean;
  halt?: boolean;  // true = 阻断后续执行
  reason?: string;
  warnings?: string[];
}

export const HOOK_REGISTRY: Record<string, Hook> = {
  'pre:bash:guard': {
    event: 'PreToolUse',
    tool: 'Bash',
    action: async (input) => {
      // 防 rm -rf / deploy
    },
  },
  'pre:write:quality-gate': {
    event: 'PreToolUse',
    tool: 'Write',
    action: async (input) => {
      // PRD 匹配检查
    },
  },
  // ... 13 个
};

export async function runHooks(event: string, tool: string, input: any) {
  const hooks = Object.values(HOOK_REGISTRY).filter(
    h => h.event === event && (!h.tool || h.tool === tool)
  );
  for (const h of hooks) {
    const result = await h.action(input);
    if (result.halt) return result;
  }
  return { ok: true };
}
```

每个 hook 是**可插拔**的——CLI 启动时按用户配置加载。

```typescript
// packages/orchestrator/src/hooks/pre.ts
import { pre:bash:guard } from './pre/bash-guard';
import { pre:write:lint-guard } from './pre/write-lint-guard';
import { pre:write:quality-gate } from './pre/write-quality-gate';

export const PRE_HOOKS = [
  pre:bash:guard,
  pre:write:lint-guard,
  pre:write:quality-gate,
];
```

---

## 8. 文件结构

```
packages/
└── orchestrator/src/
    ├── pipeline.ts          # 已有 (强化)
    ├── runtime.ts           # 已有 (强化)
    ├── prompt.ts            # 已有 (强化)
    ├── queue.ts             # 已有 (强化)
    ├── state.ts             # 已有 (强化)
    ├── gate.ts              # 已有 (强化)
    ├── auto.ts              # 新建 - 调度框架
    ├── retry.ts             # 新建 - retry + escalate
    ├── scheduling.ts        # 新建 - 定时器
    ├── concurrency.ts       # 新建 - 并发规则
    ├── reconcile.ts         # 新建 - 状态检查
    ├── atomic.ts            # 新建 - 原子写入
    ├── cache.ts             # 新建 - 缓存层
    ├── router.ts            # 新建 - L0 自然语言
    ├── features-dag.ts      # 新建 - feature 依赖图
    ├── watcher.ts           # 新建 - 文件 watcher
    ├── plugin.ts            # 新建 - 第三方接入
    ├── observability/
    │   ├── log.ts           # 已有
    │   ├── cost.ts          # 新建
    │   └── token-budget.ts  # 新建
    └── hooks/               # 新建 - hook 系统
        ├── pre/
        │   ├── bash-guard.ts
        │   ├── write-lint-guard.ts
        │   └── write-quality-gate.ts
        ├── post/
        │   ├── write-quality-gate.ts
        │   ├── write-console-check.ts
        │   └── bash-log.ts
        ├── stop/
        │   ├── typecheck.ts
        │   ├── format.ts
        │   └── session-persistence.ts
        ├── session-start/
        │   └── history.ts
        └── registry.ts      # 注册表

.prism/
├── pipeline.json            # 已有
├── pipeline.json.bak        # 新建（atomic 写备份）
├── cache/                   # 新建
│   ├── skills/
│   └── llm/
├── execution-logs/          # 新建（per-agent 决策追溯）
│   └── <feature>/
│       └── <agent>.json
├── HANDOFF.md               # 已有（强化）
├── CONTEXT-COMPACT.md       # 新建（strategic compact）
└── LEARNINGS.md             # 已有（强化）
```

---

## 9. 参考对照

### ECC 23 Hook → Pentad 13 Hook 对照

| ECC Hook | Pentad 对应 |
|----------|------------|
| `pre:bash (1)` | `pre:bash:guard`（同义） |
| `pre:write:write-lint` | `pre:write:lint-guard`（同义） |
| `pre:write:quality-gate` | `pre:write:quality-gate`（同义） |
| `pre:read:gateguard` | `pre:read:gate-guard`（同义） |
| `pre:read:continuous-learning` | 改用 `post:tool:continuous-learning`（更优） |
| `pre:ecc:mcp-health` | **删**（Pentad 短期没 MCP） |
| `pre:ecc:governance` | **删**（ECC 专属审计） |
| `pre:compact:save-state` | **删**（短期不需要） |
| `post:bash:log` | `post:bash:log`（同义） |
| `post:write:quality-gate` | `post:write:quality-gate`（同义） |
| `post:write:design-quality` | `pre:write:design-quality`（改为 pre，写前查） |
| `post:write:check-console-log` | `post:write:console-check`（同义） |
| `post:tool:continuous-learning` | `post:tool:continuous-learning`（同义） |
| `post:ecc:metrics` | **删**（Phase D 才需要） |
| `post:ecc:context-monitor` | `Phase D` 加（cost tracker） |
| `post-failure:mcp-reconnect` | **删**（无 MCP） |
| `session-start:history` | `session-start:history`（同义） |
| `stop:format-and-typecheck` | 拆成 `stop:format` + `stop:typecheck` |
| `stop:check-console-log` | `post:write:console-check` 替代（实时而非 end） |
| `stop:session-persistence` | `stop:session-persistence`（同义） |
| `stop:eval-extraction` | **Phase D** 加 |
| `stop:cost-tracker` | **Phase D** 加 |
| `session-end:mark` | **删**（debug 用，暂不需要） |

### vs TaiyiForge

| Taiyi 机制 | Pentad 对应 |
|------------|-----------|
| `engineTruth.currentPhase` | `pipeline.json.currentRole`（已有） |
| `completePhase` | `pipeline.continue()`（已有） |
| `--approver` 强制 | `prism approve <gate>`（已有） |
| `.ralph-state.json` | `execution-logs/<feature>/<agent>.json`（待加） |
| token budget 估算 | Phase D 加 |

### vs Superpowers

| Superpowers | Pentad 对应 |
|-------------|-----------|
| Iron Law | gate.ts 的 strict gate（已有） |
| 描述驱动 skill 加载 | L0 router（待加） |
| 硬门（NO PRODUCTION WITHOUT TEST） | `pre:write:quality-gate` |

### vs Claude Code

| Claude 机制 | Pentad 对应 |
|------------|-----------|
| 110 个 agent 描述触发 | `prism-agent` 直调（顶层暴露） |
| Skill tool 自动装载 | `dispatch()` SKILL.md（已有） |
| Subagent 隔离上下文 | 每个 agent 上下文独立（已有） |

---

## 附录 A：5 个核心机制落地 checklist（Phase A）

### 1. Hook 8 核心 + 5 高价值 = 13

```
□ packages/orchestrator/src/hooks/ 目录
□ registry.ts 统一注册
□ pre/bash-guard.ts (核心 1)
□ pre/write-lint-guard.ts (核心 2)
□ pre/write-quality-gate.ts (核心 3)
□ post/write-quality-gate.ts (核心 4)
□ post/write-console-check.ts (核心 5)
□ post/bash-log.ts (核心 6)
□ stop/typecheck.ts (核心 7)
□ stop/format.ts (核心 8)
```

### 2. Auto-retry

```
□ packages/orchestrator/src/retry.ts
□ 每个 agent 配置 retry: 3
□ escalate 升级路径
□ grow-idle 状态机
```

### 3. Concurrency

```
□ packages/orchestrator/src/concurrency.ts
□ 读并发 / 写串行规则
□ Promise.all 实现
□ --parallel / --sequential flag
```

### 4. State check / reconcile

```
□ packages/orchestrator/src/reconcile.ts
□ 启动时自动调用
□ 检测孤儿 artifact
□ 备份恢复
```

### 5. Atomic write

```
□ packages/orchestrator/src/atomic.ts
□ 写 tmp + rename
□ 自动 .bak
□ 锁文件防并发写
```

---

## 附录 B：分阶段工作量估算

| Phase | 项数 | 工作量 |
|-------|------|--------|
| Phase A | 5 + 13 hooks | 1-2 周 |
| Phase B | 4 | 1 周 |
| Phase C | 5 | 2 周 |
| Phase D | 4 | 2 周 |
| **总计** | 18 + 13 hooks | **6-7 周** |

---

> 最后更新: 2026-07-04 · 状态: 已讨论，待落地
