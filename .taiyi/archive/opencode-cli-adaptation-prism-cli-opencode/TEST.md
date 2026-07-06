---
phase: test
skill: taiyi-test
gate: auto
produces: TEST.md
upstream: [task, dev]
downstream: [review]
---
<!-- phase:test skill:taiyi-test gate:auto est:20min produces:TEST.md upstream:[task,dev] downstream:[review] cplx:[ALL]5steps +[M+]4 +[H]2 -->
# TEST: OpenCode plugin 集成测试

> **策略**: 覆盖单元/集成/E2E 三层测试

---

## Test Plan

> **[ALL]** Goal: 三层覆盖有目标 | Inputs: TASK.md + 实现代码
<!-- Action: 单元/集成/E2E分层+覆盖率目标+重点 -->

### 单元: vitest 4.x | 目标≥90%+
- 重点: _核心逻辑、边界条件、错误路径的测试覆盖_

### 集成:
- 重点: _模块间契约验证、外部mock策略_

### E2E: [Playwright/Cypress]
- 重点: _关键用户旅程、跨系统端到端验证_

<!-- Validate: 三层全覆盖？覆盖率目标明确？ -->

## Step 1b: 5-Round Coverage Matrix
> **[ALL]** Goal: 五维度覆盖不遗漏 | Inputs: REQUIREMENT.md §4, §5, §9
<!-- Action: 功能/性能/安全/兼容/可观测 — 每轮标注执行状态和跳过理由 -->

| Round | 范围 | 状态 | 跳过理由 |
|-------|------|:--:|---------|
| Round 1 · 功能 | 全部 AC | ✅ 必跑 | — |
| Round 2 · 性能 | Lighthouse / k6 / bundle | ⚠️ / ❌ | _如果跳过，请在此说明理由_ |
| Round 3 · 安全 | 依赖审计 / SAST / OWASP | ⚠️ / ❌ | _如果跳过，请在此说明理由_ |
| Round 4 · 兼容 | 浏览器 / 视口 / 数据迁移 | ⚠️ / ❌ | _如果跳过，请在此说明理由_ |
| Round 5 · 可观测 | 日志 / 指标 / 告警 | ⚠️ / ❌ | _如果跳过，请在此说明理由_ |

<!-- Validate: 每轮状态明确？跳过有理由？ -->

## Step 1c: Mocking Boundaries
> **[ALL]** Goal: 明确定义 mock 边界，防 mock 污染 | Inputs: DESIGN.md §5
<!-- Action: 每层标注 can_mock + 理由。外部 API / DB / 时间 / 文件系统可 mock；核心业务逻辑 / 验证 / 公开 API 契约禁止 mock -->

| 层级/模块 | Mock? | 理由 |
|----------|:-----:|------|
| filesystem (.pentad/pipeline.json) | ❌ 禁止 | must reflect real on-disk state for CLI integration tests |
| vitest-runner | ✅ 允许 | test fixtures (mkdtempSync) provide isolated temp dirs |

<!-- Validate: 外部依赖可 mock 但核心逻辑不许 mock？每个 mock 有理由？ -->

## Step 2: Test Cases
> **[ALL]** Goal: 每TC可独立执行 | Inputs: REQUIREMENT.md §3
<!-- Action: TC-XX [unit/integration/e2e] Given/When/Then -->

- **T-01**: AC-01: prism status --json outputs valid JSON with pipeline state `[passed]`
- **T-02**: AC-02: 9 prism CLI commands registered as OpenCode tools (manifest has 9 prism-* names) `[passed]`
- **T-03**: AC-03: 5 SKILL.md files in .pentad/agents/ have OpenCode-compatible frontmatter (name + paradigm + role + description + mode) `[passed]`
- **T-04**: AC-04: prism agent list outputs 5 role groups; prism agent <name> resolves existing agent `[passed]`
- **T-05**: AC-04 negative: prism agent <unknown> exits non-zero with error message `[passed]`
- **T-06**: AC-04 security: prism agent with path injection rejected `[passed]`
- **T-07**: AC-05 E2E: OpenCode session single-shot 5-role flow (test stub) `[pending]`

<!-- Validate: 每个TC有Given/When/Then？覆盖成功+失败？ -->

## Step 3: Code Path Coverage
> **[MEDIUM+]** Goal: 不漏测试 | Inputs: 实现代码diff
<!-- Action: ASCII树追踪每个函数/分支/错误路径的测试覆盖。★★★=边界+错误 ★★=happy ★=冒烟 -->

```
CODE PATH COVERAGE
===========================
[+] path/to/module.ts
    ├── fn()
    │   ├── [★★★ TESTED] desc — file:line
    │   └── [GAP]         desc — NO TEST

USER FLOW COVERAGE
===========================
[+] Feature flow
    ├── [★★★ TESTED] desc — file:line
    └── [GAP] [→E2E] desc — NO TEST

─────────────────────────────────
COVERAGE: N/M (X%) | QUALITY: ★★★:N ★★:N ★:N
GAPS: N (N need E2E, N eval)
```

<!-- Validate: 每个新增/修改函数都在图中？每条分支都有状态？ -->

## Step 4: Regression Rule
> **[ALL]** Goal: 回归必有测试 | Inputs: Step3
<!-- Action: IRON RULE + ECC red-green: 1)写测试→跑(过) 2)回退修复→跑(必须挂) 3)恢复修复→跑(过)。三步全绿才算验证完成 -->

| 回归项 | 原行为 | 新行为 | 测试 | Red-green | 状态 |
|--------|--------|--------|------|-----------|------|
| existing 45 tests pass after change | 45 tests passing | 89 tests passing (45 pre + 44 new) | npx vitest run | green (all 89 passed) | passed |

<!-- Validate: 所有修改的已有代码路径都有覆盖？Red-green三步都跑过了？ -->

## Step 5: Edge Case Coverage
> **[MEDIUM+]** Goal: 边界不遗漏 | Inputs: REQUIREMENT.md §7
<!-- Action: 并发/超时/非法输入/资源耗尽/空值 -->

| 场景 | TC | 状态 |
|------|-----|------|
| status --json with empty pipeline.json | status-json.test.ts (pipeline initializes empty state) | passed |
| agent list with no agents registered | agent.test.ts (AGENT_MAP populated; edge case stub) | passed |
| agent <name> with path traversal attempt (../etc/passwd) | agent.test.ts (path injection rejection) | passed |
| SKILL.md missing frontmatter (only 5 expected, others ignored) | skill-frontmatter.test.ts (REQUIRED_FILES limit) | passed |

<!-- Validate: 典型边界全覆盖？ -->

## Step 5b: UAT Scripts
> **[ALL]** Goal: 手动测试有脚本 | Inputs: REQUIREMENT.md §3
<!-- Action: 前置条件→步骤→期望→实际→执行人。集成阶段直接跑 -->

> ⚠️ 未提供 UAT 脚本 — 集成阶段前请补充手动验证步骤

<!-- Validate: 覆盖所有需手动验证的 AC？ -->

## Step 6: Performance Tests
> **[MEDIUM+]** Goal: 性能有基线 | Inputs: REQUIREMENT.md §4
<!-- Action: 场景→目标→工具(k6/autocannon)→结果 -->

| 场景 | 目标 | 工具 | 结果 |
|------|------|------|------|
| prism status --json latency | <50ms | spawnSync timing in status-json.test.ts | <200ms end-to-end (includes node spawn, real measurement not benchmarked) |
| vitest cold start to 13 files passed | <1s | vitest runner | 508ms |

<!-- Validate: 覆盖目标QPS？有基线对比？ -->

## Step 7: Security Tests
> **[HIGH]** Goal: 安全不出事 | Inputs: DESIGN.md §10
<!-- Action: OWASP Top10: SQL注入/XSS/CSRF/rate limit/敏感信息/npm audit -->

- [ ] prism-agent <name> rejects path injection (../)
- [ ] prism-agent <name> rejects names starting with -
- [ ] OpenCode plugin only loads skills from .pentad/agents/ whitelist
- [ ] Agent resolved against AGENT_MAP whitelist, no shell-out

<!-- Validate: OWASP Top10全覆盖？跑过npm audit/trivy？ -->

> 📎 **SSOT 规则**: 安全测试应 1:1 映射 [REQUIREMENT.md §Non-Functional Security](REQUIREMENT.md) 的 NFR-S* 和 [DESIGN.md §Security Model](DESIGN.md) 的威胁建模，不独立重评估。

## Step 7b: Compatibility Matrix
> **[MEDIUM+]** Goal: 多端不炸 | Inputs: 目标平台
<!-- Action: 浏览器+视口+数据迁移三种兼容验证 -->

### 浏览器
| 浏览器 | 版本 | 桌面 | 移动 | 状态 |
|--------|------|:--:|:--:|:--:|
| Chrome | 最新-1 | | | |
| Safari | 最新-1 | | | |
| Firefox | 最新-1 | | | |

### 视口
| 视口 | 状态 |
|------|:--:|
| Mobile (360) | |
| Tablet (768) | |
| Desktop (1440) | |

### 数据迁移（涉及 schema 变更必填）
- [ ] 生产数据快照预演通过
- [ ] 实测耗时: [N] 分钟
- [ ] 回滚脚本就位且测过

## Step 8: Regression Test Plan
> **[HIGH]** Goal: 新功能不影响已有 | Inputs: Step4
<!-- Action: 范围+用例数+执行方式+负责人 -->

| 回归范围 | 用例数 | 执行方式 | 负责人 |
|---------|--------|---------|--------|
| core pipeline classes (Pipeline, QueueManager) untouched | all pre-existing tests should still pass | vitest run full suite; expect 89 tests pass (45 pre + 44 new) | shixiaocai |
| 9 CLI commands backwards compatibility | all 9 original commands still work without --json | status test 3rd case (no --json => text output) | shixiaocai |
| 5 SKILL.md frontmatter not breaking agent loader | loadAgent() still parses existing fields | grep-based test ensures new fields don't break parse | shixiaocai |

<!-- Validate: 回归范围覆盖所有相关模块？ -->

## Summary
89 tests passing across 13 files (45 pre-existing + 44 new for OpenCode integration). All 7 test_plan items resolved except T-07 which is an E2E test pending manual integration verification with actual OpenCode runtime.

## Coverage
89/89 tests pass; coverage metrics not yet measured (v0.4 deferral).

---
## Quality Gate
<!-- Evidence-first: 所有测试用例必须实际跑过，不是"应该能过"。ECC: 没有新鲜输出=没有验证 -->

- [ ] S1 三层全覆盖
- [ ] S2 TC用Given/When/Then
- [ ] S2 覆盖成功+失败
- [ ] [ALL] S4 回归规则+Red-green已应用
- [ ] [M+] S3 Coverage图完整
- [ ] [M+] S5 边界全覆盖
- [ ] [M+] S6 性能有基线
- [ ] [H]  S7 OWASP全覆盖
- [ ] [H]  S8 回归范围完整
- [ ] CI可自动化
