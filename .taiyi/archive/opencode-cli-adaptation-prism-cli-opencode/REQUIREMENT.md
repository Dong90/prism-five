---
phase: requirement
skill: taiyi-requirement
gate: auto
produces: REQUIREMENT.md
upstream: [change]
downstream: [design, ui-design]
---
<!-- phase:requirement skill:taiyi-requirement gate:auto est:20min produces:REQUIREMENT.md upstream:[change] downstream:[design,ui-design] cplx:[ALL]5steps +[M+]4 +[H]1 -->
# REQUIREMENT: OpenCode 可识别的 prism CLI 命令与 skill 加载

> **一句话**: 9 个 prism CLI 命令在 OpenCode 终端可被识别、dispatch、状态可被 OpenCode 模型 parse

---

> ⛔ **Out of Scope — 本变更明确不覆盖以下事项**
> <!-- 放置在最顶部，让读者第一眼知道什么不做。与 Step 2 的 scope_out 内容一致无需重复详述，此处为硬性提醒 -->
> - 不引入 taiyi 的 9 阶段工作流引擎（保留 Pentad 5 角色独立模型）
> - 不重写 .pentad/pipeline.json schema（仅加 OpenCode-facing 输出字段）
> - 不动 5 角色 SKILL.md 的实质内容（仅做 OpenCode-frontmatter 适配）
> - 不提供 MCP server（v0.5 再做）
> - 不重构现有 commander.js CLI（保留 9 命令作为子命令）
>
> 📌 *完整范围切分见下方 §Step 2 Scope Partitioning*

---

## Step 1: User Stories
> **[ALL]** Goal: 从用户视角说清需求 | Inputs: CHANGE.md §1, §2
<!-- Action: As a [角色] I want [功能] so that [价值]. 覆盖所有角色 -->

* prism status 命令支持 --json 输出，让 OpenCode 模型 parse pipeline 状态
* 9 个 prism CLI 命令在 OpenCode slash 菜单中可见并可触发
* 5 个 SKILL.md (.pentad/agents/*.md) 通过 OpenCode skill loader 加载并 dispatch 到对应 agent
* 新增 prism-agent list / prism-agent <name> 子命令支持 L3 直调
* OpenCode 集成测试：单 session 走完 prototyper → builder → sweeper → grower → maintainer 5 角色全流程

<!-- Validate: 所有用户角色都覆盖了？ -->

## Step 2: Scope Partitioning
> **[ALL]** Goal: 分版本切范围，防 TASK 阶段误判 | Inputs: CHANGE.md §2
<!-- Action: v1=本次必做, v2=下次, out=永不. 至少 v2+out 各 ≥1 条 -->

### v1（本次必做）

### v2（下次）

### out（永不）
- 不引入 taiyi 的 9 阶段工作流引擎（保留 Pentad 5 角色独立模型）
- 不重写 .pentad/pipeline.json schema（仅加 OpenCode-facing 输出字段）
- 不动 5 角色 SKILL.md 的实质内容（仅做 OpenCode-frontmatter 适配）
- 不提供 MCP server（v0.5 再做）
- 不重构现有 commander.js CLI（保留 9 命令作为子命令）

<!-- Validate: v2 和 out 各 ≥ 1 条？v1 不包含 out 项？ -->

## Step 3: Functional Requirements
> **[ALL]** Goal: 拆成可测试的功能点 | Inputs: Step1
<!-- Action: FR-XX编号，分模块。涉及UI标注(UI)→触发Phase4 -->

### packages/cli
- **FR-CLI-01**: status 命令接受 --json flag，输出 machine-readable JSON（含 pipeline.json 全字段 + activeFeature + 队列）
- **FR-CLI-02**: 新增 prism-agent 子命令：list（列全部 132 agent）/ <name> "<prompt>"（直调单个 agent）
- **FR-CLI-03**: 所有现有命令（new/status/continue/approve/check/promote/run/queue/next）保持原行为不变
### .opencode-plugin
- **FR-OC-01**: 注册 OpenCode plugin（taiyi-style），通过 .opencode/plugin.json 或类似 manifest 暴露
- **FR-OC-02**: plugin 把 9 个 prism CLI 命令映射成 OpenCode tp（tool provider）或 slash interface
- **FR-OC-03**: plugin 实现 on_session_start hook，调用 prism status --json 把 pipeline 状态注入 OpenCode 上下文
### .pentad/agents
- **FR-SK-01**: 5 个核心 SKILL.md (prototyper/builder/sweeper/grower/maintainer) frontmatter 增加 OpenCode 兼容字段（mode/paradigm）
- **FR-SK-02**: SKILL.md 描述字段满足 OpenCode skill loader 的 description pattern（trigger phrase）

<!-- Validate: 每个FR可独立测试？编号连续？ -->

## Step 4: Acceptance Criteria
> **[ALL]** Goal: 每个FR都有客观验收标准 | Inputs: Step3
<!-- Action: Given/When/Then，AC-XX对应FR-XX。verify=可执行验证命令 -->

- [ ] **AC-01**: 在 OpenCode 终端运行 `prism status --json` 输出 machine-readable JSON；包含 activeFeature / queue / stageHistory / gates 全字段。
Given: 已初始化 .pentad/pipeline.json（含至少 1 个 active feature）
When: 在 OpenCode 终端执行 prism status --json
Then: 输出是合法 JSON，含 type=success，stdout 含 pipeline.json 全部字段
  - **验证**: `cd /Users/shixiaocai/prism-five && npx prism status --json | python3 -c 'import sys,json; print(json.load(sys.stdin)["features"]["user-auth"]["currentRole"])'`
- [ ] **AC-02**: OpenCode slash 菜单列出 prism 开头的 9 个命令；任一命令点击可执行。
Given: OpenCode 已加载 .opencode-plugin
When: 打开 slash 菜单
Then: 列出 prism-new, prism-status, prism-continue, prism-approve, prism-check, prism-promote, prism-run, prism-queue, prism-next
  - **验证**: `opencode --list-slash | grep '^prism-' | wc -l  # 应 = 9`
- [ ] **AC-03**: .pentad/agents/prototyper.md 等 5 个 SKILL.md 被 OpenCode skill loader 加载；可通过 /skill pentad-prototyper 触发。
Given: 5 个 SKILL.md 存在于 .pentad/agents/
When: OpenCode 启动
Then: skill loader 识别这 5 个；trigger phrase 匹配用户自然语言
  - **验证**: `opencode --list-skills | grep '^pentad-' | wc -l  # 应 = 5`
- [ ] **AC-04**: prism-agent list 输出 132 个 agent（按角色分组）；prism-agent pentad-rapid-prototyper "<task>" 调度单个 agent 执行。
Given: agent catalog 已注册 132 个
When: 执行 prism-agent list
Then: 输出 132 个 agent，5 角色分组；执行 prism-agent pentad-rapid-prototyper "design login UI"
Then: dispatch 到该 agent 并出 prompt/plan
  - **验证**: `npx prism agent list | wc -l  # 应 ≥ 132
npx prism agent pentad-rapid-prototyper 'design login UI'`
- [ ] **AC-05**: OpenCode 单 session 内走完 5 角色接力，全自动 + 2 个人工门 (prototype_approved + release_approved)；无 manual terminal 介入。
Given: 一个 OpenCode session
When: 跑 /prism-new auth && /prism-prototype && /prism-approve prototype_approved && /prism-build && /prism-sweep && /prism-grow && /prism-ship --canary 5
Then: feature 从 draft → live；含 canary 步骤；release_approved 需 human
  - **验证**: `scripts/e2e-opencode-pentad.sh  # E2E 脚本应存在并通过`

<!-- Validate: 每个AC可独立验收？Given/When/Then完整？验证命令可执行？ -->

## Step 5: Non-Functional Requirements
> **[ALL]** Goal: 性能/安全/可用性有硬指标 | Inputs: Step2
<!-- Action: NFR-XX编号，每个带数值 -->

### 性能
- **NFR-PERF-01**: prism status --json 输出耗时 < 50ms (文件读取 + JSON.parse)
- **NFR-PERF-02**: OpenCode plugin 启动开销 < 100ms (不阻塞 IDE 启动)

### 安全
- **NFR-SEC-01**: plugin 不读取 .pentad/ 之外的任何路径
- **NFR-SEC-02**: prism-agent <name> 不允许 shell-out，仅在 agent SKILL.md 限定的工具范围运行

### 可用性
- **NFR-AVAIL-01**: 9 个命令在 OpenCode 不可用时仍可在 standalone 模式下使用（prism CLI 二进制独立工作）

<!-- Validate: 每个指标有具体数字？ -->

> 📎 **SSOT 规则**: NFR-S* 安全要求应基于 [CHANGE.md §Risks](CHANGE.md) 做非功能性拆解，不独立重评估。每条 NFR-S 应与 CHANGE 的 risks[] 可追溯。

## Step 6: Error & Rescue Map
> **[MEDIUM+]** Goal: 每个错误都有名字和恢复路径 | Inputs: Step2+3
<!-- Action: 触发条件→捕获位置→用户看到→恢复路径 -->

| 错误类型 | 触发 | 捕获 | 用户看到 | 恢复 |
|---------|------|------|---------|------|
| OpenCode 未安装或 plugin 未注册 | opencode 启动时报 .opencode-plugin/ 找不到 | plugin loader 捕获 | warning: prism OpenCode plugin 未加载，9 命令仍可在 standalone 终端用 | 用户安装 plugin：`npm link @prism-five/opencode-plugin` 后重启 OpenCode |
| .pentad/pipeline.json 不存在或损坏 | prism status 读 JSON.parse 失败 | state.ts 的 readPipeline try-catch | ✗ pipeline.json not found at .pentad/pipeline.json，运行 prism new <slug> 创建 | 运行 prism new <slug> 重新初始化 |
| SKILL.md format 不符合 OpenCode skill loader | OpenCode skill loader skip / 报错 | frontmatter validator | warning: pentad-prototyper.md frontmatter invalid (missing 'description'), 见 docs/SKILL-FORMAT.md | 添加 description 字段满足 OpenCode pattern |

<!-- Validate: 所有可能的错误都有名字？恢复路径可执行？ -->

## Step 7: Shadow Path Analysis
> **[MEDIUM+]** Goal: 每条数据流覆盖四路径 | Inputs: Step5
<!-- Action: Happy/Nil/Empty/UpstreamErr 逐条标注 -->

### prism status --json 在 pipeline.json 不存在时
| 路径 | 输入 | 预期 |
|------|------|------|
| Happy | pipeline.json 存在 | 输出 JSON |
| Nil | pipeline.json 不存在 | 输出 JSON 含 error field，exit code 1 |
| Empty | pipeline.json 是空文件 | 输出 JSON parse error message |
| UpstreamErr | pipeline.json 字段缺失（如无 activeFeature） | 输出 JSON 含 null activeFeature 但其他字段正常 |
### prism-agent <unknown-name>
| 路径 | 输入 | 预期 |
|------|------|------|
| Happy | <name> 在 AGENT_MAP 中 | 调度该 agent |
| Nil | <name> 不存在 | exit 1，错误信息 'no such agent' |
| Empty | <name> 是空字符串 | exit 1，错误信息 |
| UpstreamErr | <name> 是 path 注入 ("../etc/passwd") | exit 1，blocked by input validation |

<!-- Validate: 核心流程都覆盖了四路径？ -->

## Step 8: Non-Happy-Path Matrix
> **[MEDIUM+]** Goal: 边界和异常不遗漏 | Inputs: Step5+6
<!-- Action: 空值/超时/并发/权限/非法输入全覆盖 -->

| 场景 | 预期行为 |
|------|---------|
| _空输入_ | _显示用法提示_ |

<!-- Validate: 典型边界(空/超/并发/权限)全覆盖？ -->

## Step 9: Dependencies
> **[MEDIUM+]** Goal: 外部依赖不阻塞 | Inputs: CHANGE.md §4
<!-- Action: 技术约束/第三方/跨团队+状态+风险 -->

| 依赖 | 类型 | 状态 | 风险 |
|------|------|------|------|
| OpenCode CLI v0.3+ | external | available | OpenCode 插件 API 可能变动；锁版本 |
| commander.js 12.x | internal | available | low; 现有 9 命令已用它 |
| Node.js >= 18 | external | available | low |

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
