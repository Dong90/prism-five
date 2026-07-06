---
phase: integration
skill: taiyi-integration
gate: auto
produces: INTEGRATION.md
upstream: [review, dev, test]
downstream: []
---
<!-- phase:integration skill:taiyi-integration gate:auto est:15min produces:INTEGRATION.md upstream:[review,dev,test] downstream:[] cplx:[ALL]1steps +[M+]4 +[H]2 -->
# INTEGRATION: M14 Integration: context / learnings / memory

> **Release**: `0.3.0` | **Date**: 2026-07-06 | **Status**: ready

---

## Step 1: Changelog & Breaking Changes
> **[ALL]** Goal: 下游知道变了什么 | Inputs: 所有上游工件
<!-- Action: Added/Changed/Fixed/Deprecated/Removed/Security。每条: 什么变了+对用户影响 -->

- **feat**: M14: add per-feature context snapshot (context.ts) — CONTEXT.md auto-generated on createFeature/continue
- **feat**: M14: add cross-feature learning accumulation (learnings.ts) — LEARNINGS.md append-only with activity audit
- **feat**: M14: add project memory persistence (memory.ts) — project-memory.json with backup mechanism and Zod validation

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
| 配置项 | 旧值 | 新值 |
|--------|------|------|
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
| 告警 | 条件 | 严重度 | 渠道 |
|------|------|--------|------|
| CI 失败告警 | vitest 非零退出 | high | GitHub Actions |

### Runbook

<!-- Validate: 每个关键指标有dashboard+alert+runbook？ -->

## Step 5: Post-Launch Watch
> **[MEDIUM+]** Goal: 确认稳了才算完 | Inputs: Step4
<!-- Action: 观察期+退出标准+异常处理 -->

- **观察期**: [N天/小时]
- **观察指标**: 
- **退出标准**: 
- **异常处理**: 

<!-- Validate: 退出标准量化？异常有应急预案？ -->

## Step 6: Rollback Plan
> **[HIGH]** Goal: 出问题能快速回退 | Inputs: DESIGN.md §11
<!-- Action: 触发条件(量化)+操作步骤(精确到命令)+预计时间 -->

**触发**: 
**操作**: 1.  2. 
**时间**: 

<!-- Validate: 触发量化？步骤精确？≤30min？ -->

## Step 7: Monitoring & Alerts
> **[HIGH]** Goal: 长期监控不盲飞 | Inputs: Step4
<!-- Action: 指标+基线+告警阈值+严重度。覆盖所有SC -->

| 指标 | 基线 | 告警阈值 | 严重度 |
|------|------|---------|--------|
| vitest pass rate | 100% | <100% | high |

<!-- Validate: 所有SC对应指标？基线+阈值有数据支撑？ -->

## Release
- **Version**: `0.3.0` | **Date**: 2026-07-06 | **Artifacts**: npm

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
- ⬜ [H]  S6 回滚≤30min
- ⬜ 上下游已通知
- ⬜ Release已标注
