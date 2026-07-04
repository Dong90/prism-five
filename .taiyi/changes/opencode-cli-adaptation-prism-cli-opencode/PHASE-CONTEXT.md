# Change Graph: opencode-cli-adaptation-prism-cli-opencode

## Phases
### change (11 nodes)
**risk** (2) OpenCode plugin API 与现有 commander.js CLI 冲突 / SKILL.md frontmatter 与 OpenCode skill format 不一致
**acceptance_criterion** (5)
  - 在 OpenCode 终端里运行 `prism status --json` 输出 machine-readabl...
  - OpenCode 能识别 `prism` 开头的所有 9 个命令，并通过 slash 或 tp interface 触发
  - 5 个 SKILL.md（.pentad/agents/*.md）能通过 OpenCode 的 skill loa...
  - ... +2 more
**unknown** (3) packages/cli/ / .pentad/agents/ / 新增 .opencode-plugin/
**rollback** (1) OpenCode plugin 与现有 command 冲突导致 5+ 关键命令不可用

### requirement (23 nodes)
**acceptance_criterion** (5)
  - 在 OpenCode 终端运行 `prism status --json` 输出 machine-readable...
  - OpenCode slash 菜单列出 prism 开头的 9 个命令；任一命令点击可执行。
Given: Ope...
  - .pentad/agents/prototyper.md 等 5 个 SKILL.md 被 OpenCode sk...
  - ... +2 more
**unknown** (13)
  - OpenCode 未安装或 plugin 未注册
  - .pentad/pipeline.json 不存在或损坏
  - SKILL.md format 不符合 OpenCode skill loader
  - ... +10 more
**nfr** (5)
  - plugin 不读取 .pentad/ 之外的任何路径
  - prism-agent <name> 不允许 shell-out，仅在 agent SKILL.md 限定的工具范围运行
  - prism status --json 输出耗时 < 50ms (文件读取 + JSON.parse)
  - ... +2 more

### design (19 nodes)
**threat** (3) 恶意 SKILL.md 让 OpenCode 执行危险命令 / prism-agent <name> 通过名字注入 shell 命令 / prism-agent 读 .pentad/ 之外的敏感文件
**risk** (2) 新增 OpenCode plugin 包 / status 命令加 --json flag
**design_decision** (3) plugin 与 prism CLI 同仓库 vs 独立仓库 / SKILL.md frontmatter 改造粒度 / A
**unknown** (5)
  - .opencode-plugin/index.ts
  - .opencode-plugin/tools/prism-commands.ts
  - .opencode-plugin/skills/loader.ts
  - ... +2 more
**deployment_step** (5)
  - 1. dev 阶段：先实现 status --json（最小）→ 单测通过
  - 2. dev 阶段：再实现 prism-agent list/<name> → 单测通过
  - 3. dev 阶段：最后实现 .opencode-plugin/ → 集成测试
  - ... +2 more
**rollback** (1) OpenCode plugin 与 9 命令任一冲突导致关键命令不可用

### ui-design (8 nodes)
**design_decision** (1) 本变更面向 OpenCode 终端集成；CLI 输出格式与 OpenCode tool schema 即为'视觉'...
**unknown** (7)
  - JSON mode
  - Text mode (legacy)
  - Loading state
  - ... +4 more

### task (10 nodes)
**slice** (4)
  - 扩展 status 命令支持 JSON 输出
  - 新增 prism-agent 子命令
  - 写 OpenCode plugin manifest
  - ... +1 more
**risk** (1) OpenCode plugin API 与 commander.js 冲突
**rollback** (2) git revert S1 commit / rm -rf .opencode-plugin/
**unknown** (3) Wave 1: baseline / Wave 2: extending CLI / Wave 3: OpenCode integration

### test (18 nodes)
**test_case** (18)
  - AC-01: prism status --json outputs valid JSON with pipeli...
  - AC-02: 9 prism CLI commands registered as OpenCode tools ...
  - AC-03: 5 SKILL.md files in .pentad/agents/ have OpenCode-...
  - ... +15 more

### review (21 nodes)
**unknown** (12)
  - agent.ts uses Map for role grouping; could be Record. No ...
  - OpenCode plugin manifest emitted via console.log JSON; co...
  - orchestrator/src/index.ts re-exports ROLE_ORDER which is ...
  - ... +9 more
**test_case** (9)
  - prism agent rejects path injection (../etc/passwd returns...
  - prism agent rejects names starting with -
  - prism agent resolves only against AGENT_MAP whitelist (no...
  - ... +6 more

### integration (1 nodes)
**unknown** (1) 待填写

## Cross-Cutting Concerns
**10** SSOT violations: 5 high, 2 medium, 3 low
- [MEDIUM] risk (change vs requirement): risk 跨阶段不一致: "OpenCode plugin API 与现有 commander.js CLI 冲突" ≠ "prism status --json 输出耗时 < 50ms (文件读取 + JSON.parse)"
- [MEDIUM] risk (change vs requirement): risk 跨阶段不一致: "SKILL.md frontmatter 与 OpenCode skill format 不一致" ≠ "OpenCode plugin 启动开销 < 100ms (不阻塞 IDE 启动)"
- [HIGH] rollback (change vs design): rollback 跨阶段不一致: "OpenCode plugin 与现有 command 冲突导致 5+ 关键命令不可用" ≠ "OpenCode plugin 与 9 命令任一冲突导致关键命令不可用"
- [LOW] design_decision (design vs task): design_decision 跨阶段不一致: "A" ≠ "扩展 status 命令支持 JSON 输出"
- [LOW] design_decision (design vs task): design_decision 跨阶段不一致: "plugin 与 prism CLI 同仓库 vs 独立仓库" ≠ "新增 prism-agent 子命令"
- [LOW] design_decision (design vs task): design_decision 跨阶段不一致: "SKILL.md frontmatter 改造粒度" ≠ "写 OpenCode plugin manifest"
- [HIGH] nfr (requirement vs design): nfr 跨阶段不一致: "prism status --json 输出耗时 < 50ms (文件读取 + JSON.parse)" ≠ "恶意 SKILL.md 让 OpenCode 执行危险命令"
- [HIGH] nfr (requirement vs design): nfr 跨阶段不一致: "OpenCode plugin 启动开销 < 100ms (不阻塞 IDE 启动)" ≠ "prism-agent <name> 通过名字注入 shell 命令"
- [HIGH] nfr (requirement vs design): nfr 跨阶段不一致: "9 个命令在 OpenCode 不可用时仍可在 standalone 模式下使用（prism CLI 二进制独立工作）" ≠ "prism-agent 读 .pentad/ 之外的敏感文件"
- [HIGH] rollback (task vs design): rollback 跨阶段不一致: "git revert S1 commit" ≠ "OpenCode plugin 与 9 命令任一冲突导致关键命令不可用"

## Stats
- Total nodes: 111
- Total edges: 82
- Phases with nodes: 8/8


## review (✓)
**评审**:
- [x] **Approve** — 可合并
---

**当前**: integration · Skill: @taiyi-integration · 工件: INTEGRATION.md
**复杂度**: low | Profile: full
**下一步**: 加载 @taiyi-integration，编辑 INTEGRATION.md

*引擎生成 · Agent 读此文件即可*

<!-- ⚠️ SSOT 声明: 以下摘要仅作快速参考。各阶段真源始终是对应的上游工件 (CHANGE.md / DESIGN.md / TASK.md 等)。
     版本发生变更或阶段有冲突时，请直接读取工件文件而非本摘要。 -->