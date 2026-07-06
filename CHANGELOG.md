# Changelog

> 📦 较早的变更已归档至 [CHANGELOG-ARCHIVE.md](CHANGELOG-ARCHIVE.md)。

<!-- taiyi:prism-five-incidence-refraction-dispersion-absor --> 2026-07-04
# CHANGELOG: 还原项目名 + 5 要素重命名

## Changed

- 项目名 pentad → prism-five
- 核心包目录 prototyper→incidence, builder→refraction, sweeper→dispersion, grower→absorption,
  maintainer→emission
- 包名 @pentad/\* → @prism-five/\*（9 个包全部更新）
- 25 处源码 import 同步
- 全配置同步（tsconfig.json / README.md）

## Verification

- [x] `npm run build` exit 0
- [x] `npm test` 42 tests pass (9 files)
- [x] `npm run lint` pass
- [x] 源码零残留 `@pentad/` 引用
- [x] package-lock.json 干净

<!-- taiyi:ty-5ocn6io9 --> 2026-07-04
# CHANGELOG: 性能基准测试

## Added

- packages/benchmarks: vitest bench 套件 (7 个基准)
- script: `npm run bench`

## Changed

- package.json: 添加 bench script
- tsconfig.json: 添加 packages/benchmarks 引用

## Verification

- [x] `npm run build` passes
- [x] `npm test` passes (42 tests)
- [x] `npm run bench` runs (7 benchmarks)

<!-- taiyi:opencode-cli-adaptation-prism-cli-opencode --> 2026-07-04
---

phase: integration skill: taiyi-integration gate: auto produces: INTEGRATION.md upstream: [review,
dev, test] downstream: []
---

<!-- phase:integration skill:taiyi-integration gate:auto est:15min produces:INTEGRATION.md upstream:[review,dev,test] downstream:[] cplx:[ALL]1steps +[M+]4 +[H]2 -->

# INTEGRATION: OpenCode plugin 集成 v0.4.0

> **Release**: `0.4.0` | **Date**: 2026-07-04 | **Status**: released

---

## Step 1: Changelog & Breaking Changes

> **[ALL]** Goal: 下游知道变了什么 | Inputs: 所有上游工件

<!-- Action: Added/Changed/Fixed/Deprecated/Removed/Security。每条: 什么变了+对用户影响 -->

- **feat**: prism status: 加 --json flag，输出 machine-readable JSON（OpenCode 集成基础）
- **feat**: prism agent: 新增 list 子命令，按 5 角色分组显示所有 agent
- **feat**: prism agent: 新增 <name> "<task>" 子命令，直调单个 agent（白名单 AGENT_MAP）
- **feat**: .opencode-plugin/: 新增独立目录与 manifest skeleton，注册 9 个 prism-* tool +
  5 个 pentad-* skill
- **chore**: 5 个核心 SKILL.md frontmatter 加 mode 字段满足 OpenCode skill loader 兼容
- **chore**: orchestrator/src/index.ts 重导出 AGENT_MAP / ROLE_ORDER / AgentDefinition 给 cli
- **test**: 新增 4 个测试文件 / 44 个测试用例：status-json (3), agent (4), skill-frontmatter (35),
  opencode-plugin (5) — 总测试 45 → 89

### Breaking Changes

_无_

<!-- Validate: 每条让读者一眼看懂"对我有什么影响"？Breaking有迁移指引？ -->

## Step 2: Migration

> **[MEDIUM+]** Goal: 迁移一步完成 | Inputs: DESIGN.md §5, §9

<!-- Action: DDL变更/环境变量变更/配置变更 -->

### 数据库

_未提供 DDL 变更_

### 环境变量

- 新增: | 修改: | 删除:

### 配置

| 配置项       | 旧值 | 新值 |
| ------------ | ---- | ---- |
| _无配置变更_ |

<!-- Validate: 迁移可一条命令完成？失败可回滚？ -->

## Step 3: Deployment Checklist

> **[MEDIUM+]** Goal: 上线不遗漏 | Inputs: Step2

<!-- Action: 逐项确认DB/环境/灰度/监控/告警/回滚/通知 -->

- [ ] DB迁移已执行
- [ ] 环境变量已配置
- [ ] 灰度发布已确认
- [ ] 监控dashboard已更新
- [ ] 告警规则已配置
- [ ] 回滚已验证
- [ ] 上下游已通知

<!-- Validate: 每步有owner？步骤无遗漏？ -->

## Step 4: Observability

> **[MEDIUM+]** Goal: 出问题能发现 | Inputs: REQUIREMENT.md §4, DESIGN.md §11

<!-- Action: Dashboard+Alert+Runbook是一级交付物 -->

### Dashboard

### Alerts

| 告警                         | 条件                                     | 严重度 | 渠道                                               |
| ---------------------------- | ---------------------------------------- | ------ | -------------------------------------------------- |
| OpenCode plugin load failure | .opencode-plugin/manifest throws on load | medium | warning logged but standalone CLI fallback enabled |

### Runbook

<!-- Validate: 每个关键指标有dashboard+alert+runbook？ -->

## Step 5: Post-Launch Watch

> **[MEDIUM+]** Goal: 确认稳了才算完 | Inputs: Step4

<!-- Action: 观察期+退出标准+异常处理 -->

- **观察期**: 1 week
- **观察指标**: OpenCode launch + slash command invocation; agent list render perf; status --json
  latency
- **退出标准**: no critical bugs; status --json latency under 50ms (NFR-PERF-01); 0 user-reported
  integration issues
- **异常处理**: Disable plugin (revert .opencode-plugin/); CLI continues to work standalone

<!-- Validate: 退出标准量化？异常有应急预案？ -->

## Step 6: Rollback Plan

> **[HIGH]** Goal: 出问题能快速回退 | Inputs: DESIGN.md §11

<!-- Action: 触发条件(量化)+操作步骤(精确到命令)+预计时间 -->

**触发**: OpenCode plugin crash on launch OR critical command regression (status / continue /
approve broken) **操作**: 1. git revert HEAD; rm -rf .opencode-plugin/ 2. npm test; verify 89 tests
pass after rollback **时间**: ≤less than 10min

<!-- Validate: 触发量化？步骤精确？≤30min？ -->

## Step 7: Monitoring & Alerts

> **[HIGH]** Goal: 长期监控不盲飞 | Inputs: Step4

<!-- Action: 指标+基线+告警阈值+严重度。覆盖所有SC -->

| 指标                  | 基线                                     | 告警阈值                    | 严重度 |
| --------------------- | ---------------------------------------- | --------------------------- | ------ |
| test passing rate     | 89/89                                    | below 95% triggers review   | high   |
| status --json latency | under 50ms (estimated; not yet measured) | above 200ms triggers review | medium |

<!-- Validate: 所有SC对应指标？基线+阈值有数据支撑？ -->

## Release

- **Version**: `0.4.0` | **Date**: 2026-07-04 | **Artifacts**: _npm_

## Step 8: System State Update

> **[HIGH]** Goal: 保持全局活文档同步 | Inputs: 所有上游工件

<!-- Action: 更新 ARCHITECTURE.md · OpenAPI spec · DB schema · ERD · docs/c4/ -->
<!-- 离散的 DESIGN.md 是"变更记录"，下面这些全局文档是"系统真源"——半年后新 Agent 从此拼出全貌 -->

- [ ] 若新增/修改 API：更新 `docs/api/` 或 OpenAPI spec
- [ ] 若新增/修改模块：更新 `ARCHITECTURE.md` 和 `docs/c4/`
- [ ] 若新增/修改数据模型：更新 schema registry 或 ERD
- [ ] 若变更影响 CI/CD：更新 `.github/workflows/` 文档
- [ ] 若新增外部依赖：更新 `package.json` + 依赖文档
- [ ] 无活文档变更（仅测试/文档级变动）

> 半年后新 Agent 应从全局文档拼出系统全貌，而非翻阅几百份离散的 DESIGN.md。

---

## Quality Gate

<!-- Evidence-first: 每项部署检查需要可验证证据。PD#5: Dashboard+Alert+Runbook不是上线后清理项 -->

- ⬜ S1 Changelog清晰完整
- ⬜ S1 Breaking有迁移指引
- ⬜ [M+] S2 迁移可一键执行
- ⬜ [M+] S3 部署清单无遗漏
- ⬜ [M+] S4 Dashboard+Alert+Runbook完整 | PD#5
- ⬜ [M+] S5 观察期+退出标准明确
- ⬜ [H] S6 回滚≤30min
- ⬜ [H] S7 监控覆盖所有SC
- ⬜ 上下游已通知
- ⬜ Release已标注

<!-- taiyi:exempt-prism-exempt-force-skip --> 2026-07-04
---

phase: integration skill: taiyi-integration gate: auto produces: INTEGRATION.md upstream: [review,
dev, test] downstream: []
---

<!-- phase:integration skill:taiyi-integration gate:auto est:15min produces:INTEGRATION.md upstream:[review,dev,test] downstream:[] cplx:[ALL]1steps +[M+]4 +[H]2 -->

# INTEGRATION: exempt v0.4.1

> **Release**: 2026-07-04 | **Date**: 2026-07-04 | **Status**: _deployed_

---

## Step 1: Changelog & Breaking Changes

> **[ALL]** Goal: 下游知道变了什么 | Inputs: 所有上游工件

<!-- Action: Added/Changed/Fixed/Deprecated/Removed/Security。每条: 什么变了+对用户影响 -->

- **feat**: upstream check: build/sweep/grow/ship 拒止未完成上游
- **feat**: prism exempt grant/list/revoke（支持过期）
- **feat**: --force-skip + audit-log.json

### Breaking Changes

_无_

<!-- Validate: 每条让读者一眼看懂"对我有什么影响"？Breaking有迁移指引？ -->

## Step 2: Migration

> **[MEDIUM+]** Goal: 迁移一步完成 | Inputs: DESIGN.md §5, §9

<!-- Action: DDL变更/环境变量变更/配置变更 -->

### 数据库

_未提供 DDL 变更_

### 环境变量

- 新增: | 修改: | 删除:

### 配置

| 配置项       | 旧值 | 新值 |
| ------------ | ---- | ---- |
| _无配置变更_ |

<!-- Validate: 迁移可一条命令完成？失败可回滚？ -->

## Step 3: Deployment Checklist

> **[MEDIUM+]** Goal: 上线不遗漏 | Inputs: Step2

<!-- Action: 逐项确认DB/环境/灰度/监控/告警/回滚/通知 -->

- [ ] DB迁移已执行
- [ ] 环境变量已配置
- [ ] 灰度发布已确认
- [ ] 监控dashboard已更新
- [ ] 告警规则已配置
- [ ] 回滚已验证
- [ ] 上下游已通知

<!-- Validate: 每步有owner？步骤无遗漏？ -->

## Step 4: Observability

> **[MEDIUM+]** Goal: 出问题能发现 | Inputs: REQUIREMENT.md §4, DESIGN.md §11

<!-- Action: Dashboard+Alert+Runbook是一级交付物 -->

### Dashboard

### Alerts

| 告警          | 条件              | 严重度 | 渠道             |
| ------------- | ----------------- | ------ | ---------------- |
| _CI 失败告警_ | _vitest 非零退出_ | _high_ | _GitHub Actions_ |

### Runbook

<!-- Validate: 每个关键指标有dashboard+alert+runbook？ -->

## Step 5: Post-Launch Watch

> **[MEDIUM+]** Goal: 确认稳了才算完 | Inputs: Step4

<!-- Action: 观察期+退出标准+异常处理 -->

- **观察期**: 1 day
- **观察指标**:
- **退出标准**:
- **异常处理**:

<!-- Validate: 退出标准量化？异常有应急预案？ -->

## Step 6: Rollback Plan

> **[HIGH]** Goal: 出问题能快速回退 | Inputs: DESIGN.md §11

<!-- Action: 触发条件(量化)+操作步骤(精确到命令)+预计时间 -->

**触发**: _量化条件_ **操作**: 1. _命令_ 2. _命令_ **时间**: ≤10min

<!-- Validate: 触发量化？步骤精确？≤30min？ -->

## Step 7: Monitoring & Alerts

> **[HIGH]** Goal: 长期监控不盲飞 | Inputs: Step4

<!-- Action: 指标+基线+告警阈值+严重度。覆盖所有SC -->

| 指标               | 基线   | 告警阈值 | 严重度 |
| ------------------ | ------ | -------- | ------ |
| _vitest pass rate_ | _100%_ | _<100%_  | _high_ |

<!-- Validate: 所有SC对应指标？基线+阈值有数据支撑？ -->

## Step 8: System State Update

> **[HIGH]** Goal: 保持全局活文档同步 | Inputs: 所有上游工件

<!-- Action: 更新 ARCHITECTURE.md · OpenAPI spec · DB schema · ERD · docs/c4/ -->
<!-- 离散的 DESIGN.md 是"变更记录"，下面这些全局文档是"系统真源"——半年后新 Agent 从此拼出全貌 -->

- [ ] 若新增/修改 API：更新 `docs/api/` 或 OpenAPI spec
- [ ] 若新增/修改模块：更新 `ARCHITECTURE.md` 和 `docs/c4/`
- [ ] 若新增/修改数据模型：更新 schema registry 或 ERD
- [ ] 若变更影响 CI/CD：更新 `.github/workflows/` 文档
- [ ] 若新增外部依赖：更新 `package.json` + 依赖文档
- [ ] 无活文档变更（仅测试/文档级变动）

> 半年后新 Agent 应从全局文档拼出系统全貌，而非翻阅几百份离散的 DESIGN.md。

---

## Quality Gate

<!-- Evidence-first: 每项部署检查需要可验证证据。PD#5: Dashboard+Alert+Runbook不是上线后清理项 -->

- ⬜ S1 Changelog清晰完整
- ⬜ S1 Breaking有迁移指引
- ⬜ [M+] S2 迁移可一键执行
- ⬜ [M+] S3 部署清单无遗漏
- ⬜ [M+] S4 Dashboard+Alert+Runbook完整 | PD#5
- ⬜ [M+] S5 观察期+退出标准明确
- ⬜ [H] S6 回滚≤30min
- ⬜ [H] S7 监控覆盖所有SC
- ⬜ 上下游已通知
- ⬜ Release已标注

<!-- taiyi:c001-pipeline-json-prism-five-taiyi-state-json --> 2026-07-05
---

phase: integration skill: taiyi-integration gate: auto produces: INTEGRATION.md upstream: [review,
dev, test] downstream: []
---

<!-- phase:integration skill:taiyi-integration gate:auto est:15min produces:INTEGRATION.md upstream:[review,dev,test] downstream:[] cplx:[ALL]1steps +[M+]4 +[H]2 -->

# INTEGRATION: C001 v0.4.0

> **Release**: 待定 | **Date**: 待定 | **Status**: deployed

---

## Step 1: Changelog & Breaking Changes

> **[ALL]** Goal: 下游知道变了什么 | Inputs: 所有上游工件

<!-- Action: Added/Changed/Fixed/Deprecated/Removed/Security。每条: 什么变了+对用户影响 -->

- **feat**: taiyi-bridge.ts reads Taiyi state.json as primary source

### Breaking Changes

无

<!-- Validate: 每条让读者一眼看懂"对我有什么影响"？Breaking有迁移指引？ -->

## Step 2: Migration

> **[MEDIUM+]** Goal: 迁移一步完成 | Inputs: DESIGN.md §5, §9

<!-- Action: DDL变更/环境变量变更/配置变更 -->

### 数据库

无 DDL 变更

### 环境变量

- 新增: | 修改: | 删除:

### 配置

| 配置项     | 旧值 | 新值 |
| ---------- | ---- | ---- |
| 无配置变更 |

<!-- Validate: 迁移可一条命令完成？失败可回滚？ -->

## Step 3: Deployment Checklist

> **[MEDIUM+]** Goal: 上线不遗漏 | Inputs: Step2

<!-- Action: 逐项确认DB/环境/灰度/监控/告警/回滚/通知 -->

- [ ] DB迁移已执行
- [ ] 环境变量已配置
- [ ] 灰度发布已确认
- [ ] 监控dashboard已更新
- [ ] 告警规则已配置
- [ ] 回滚已验证
- [ ] 上下游已通知

<!-- Validate: 每步有owner？步骤无遗漏？ -->

## Step 4: Observability

> **[MEDIUM+]** Goal: 出问题能发现 | Inputs: REQUIREMENT.md §4, DESIGN.md §11

<!-- Action: Dashboard+Alert+Runbook是一级交付物 -->

### Dashboard

### Alerts

| 告警        | 条件            | 严重度 | 渠道           |
| ----------- | --------------- | ------ | -------------- |
| CI 失败告警 | vitest 非零退出 | high   | GitHub Actions |

### Runbook

<!-- Validate: 每个关键指标有dashboard+alert+runbook？ -->

## Step 5: Post-Launch Watch

> **[MEDIUM+]** Goal: 确认稳了才算完 | Inputs: Step4

<!-- Action: 观察期+退出标准+异常处理 -->

- **观察期**: 1h
- **观察指标**:
- **退出标准**:
- **异常处理**:

<!-- Validate: 退出标准量化？异常有应急预案？ -->

## Step 6: Rollback Plan

> **[HIGH]** Goal: 出问题能快速回退 | Inputs: DESIGN.md §11

<!-- Action: 触发条件(量化)+操作步骤(精确到命令)+预计时间 -->

**触发**: N/A — 纯文档变更无回滚需求 **操作**: 1. 命令 2. 命令 **时间**: ≤N min

<!-- Validate: 触发量化？步骤精确？≤30min？ -->

## Step 7: Monitoring & Alerts

> **[HIGH]** Goal: 长期监控不盲飞 | Inputs: Step4

<!-- Action: 指标+基线+告警阈值+严重度。覆盖所有SC -->

| 指标             | 基线 | 告警阈值 | 严重度 |
| ---------------- | ---- | -------- | ------ |
| vitest pass rate | 100% | <100%    | high   |

<!-- Validate: 所有SC对应指标？基线+阈值有数据支撑？ -->

## Step 8: System State Update

> **[HIGH]** Goal: 保持全局活文档同步 | Inputs: 所有上游工件

<!-- Action: 更新 ARCHITECTURE.md · OpenAPI spec · DB schema · ERD · docs/c4/ -->
<!-- 离散的 DESIGN.md 是"变更记录"，下面这些全局文档是"系统真源"——半年后新 Agent 从此拼出全貌 -->

- [ ] 若新增/修改 API：更新 `docs/api/` 或 OpenAPI spec
- [ ] 若新增/修改模块：更新 `ARCHITECTURE.md` 和 `docs/c4/`
- [ ] 若新增/修改数据模型：更新 schema registry 或 ERD
- [ ] 若变更影响 CI/CD：更新 `.github/workflows/` 文档
- [ ] 若新增外部依赖：更新 `package.json` + 依赖文档
- [ ] 无活文档变更（仅测试/文档级变动）

> 半年后新 Agent 应从全局文档拼出系统全貌，而非翻阅几百份离散的 DESIGN.md。

---

## Quality Gate

<!-- Evidence-first: 每项部署检查需要可验证证据。PD#5: Dashboard+Alert+Runbook不是上线后清理项 -->

- ⬜ S1 Changelog清晰完整
- ⬜ S1 Breaking有迁移指引
- ⬜ [M+] S2 迁移可一键执行
- ⬜ [M+] S3 部署清单无遗漏
- ⬜ [M+] S4 Dashboard+Alert+Runbook完整 | PD#5
- ⬜ [M+] S5 观察期+退出标准明确
- ⬜ [H] S6 回滚≤30min
- ⬜ [H] S7 监控覆盖所有SC
- ⬜ 上下游已通知
- ⬜ Release已标注


<!-- taiyi:ci-taiyi-ci-platform-prism-ci-sync --> 2026-07-05
# CHANGELOG: 多平台 CI 同步 — taiyi_ci_platform 迁移为 prism ci sync

## Added

- …

## Changed

- …

## Fixed

- …

## Docs / Skills

- [ ] README / AGENTS.md 已同步（若对外行为变化）
- [ ] OpenSpec / 规格已 archive（若适用）

## Rollback

<!-- 如何回滚本次变更 -->


<!-- taiyi:cli-prism-cancel-list-doctor-guide-check-sync-in --> 2026-07-05
# CHANGELOG: CLI 补齐 — prism cancel/list/doctor/guide/check/sync/init

## Added

- …

## Changed

- …

## Fixed

- …

## Docs / Skills

- [ ] README / AGENTS.md 已同步（若对外行为变化）
- [ ] OpenSpec / 规格已 archive（若适用）

## Rollback

<!-- 如何回滚本次变更 -->


<!-- taiyi:prism-commit-ship-land --> 2026-07-05
# CHANGELOG: 交付链 — prism commit/ship/land

## Added

- …

## Changed

- …

## Fixed

- …

## Docs / Skills

- [ ] README / AGENTS.md 已同步（若对外行为变化）
- [ ] OpenSpec / 规格已 archive（若适用）

## Rollback

<!-- 如何回滚本次变更 -->
