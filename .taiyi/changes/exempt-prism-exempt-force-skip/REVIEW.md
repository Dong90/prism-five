---
phase: review
skill: taiyi-review
gate: human
produces: REVIEW.md
upstream: [test, dev]
downstream: [integration]
---
<!-- phase:review skill:taiyi-review gate:human est:20min produces:REVIEW.md upstream:[test,dev] downstream:[integration] cplx:[ALL]2steps +[M+]2 +[H]2 -->
# REVIEW: exempt review

> **Reviewer**: _AI_ | **Date**: 2026-07-04 | **Verdict**: ****

---

## Verdict

- [ ] **Approve**
- [ ] **Request changes**

---

## Step 1: Review Scope & Findings
> **[ALL]** Goal: 每个问题有位置+置信度+建议 | Inputs: 代码diff + TEST.md
<!-- Action: Prior Learnings: 检查本项目过往session的learnings，有匹配的标注"Prior learning applied"。[severity](confidence:N/10) file:line—desc。9-10=已验证,7-8=高置信,5-6=中(需人工)。critical=必修复 -->

**评审范围**: 
**关注重点**: 

- **** `[minor]` ❌: exempt grant does not call writePipeline

<!-- Validate: 每个finding有具体位置+置信度+修复建议？ -->

## Step 2: Verdict & Action Items
> **[ALL]** Goal: 明确裁决和后续动作 | Inputs: Step1
<!-- Action: approved(过)/commented(建议但可过)/changes_requested(不过)。列出必须修复项 -->

**必须修复** (blocking merge):
- _无_

**建议修复** (可后续):
- _无_

<!-- Validate: Verdict明确？blocking项有owner+deadline？ -->

## Step 3: Code Quality Audit
> **[MEDIUM+]** Goal: 五维评分 | Inputs: 代码diff
<!-- Action: 可读性/可测试性/一致性/复杂度/文档 各0-10 -->

| 维度 | 评分 | 备注 |
|------|------|------|
| functional | 5/10 | all ACs covered |
| architecture | 5/10 | minimal schema change |
| testing | 5/10 | 7 unit tests |
| documentation | 4/10 | scripts documented |
| maintainability | 4/10 | exempt CLI wrapper |

<!-- Validate: 每维有具体改进建议而非仅打分？ -->

## Step 4: Test Coverage Audit
> **[MEDIUM+]** Goal: 对齐TEST.md | Inputs: TEST.md
<!-- Action: 各层通过率+覆盖率+差距 -->

| 层 | 通过/总 | 覆盖率 | 状态 |
|----|--------|--------|------|
| 单元 | _通过/总_ | _覆盖率_ | _待评估（目标：≥90%）_ |
| 集成 | _通过/总_ | _覆盖率_ | _待评估（目标：≥80%）_ |
| E2E | _通过/总_ | _覆盖率_ | _待评估（目标：≥90%）_ |

<!-- Validate: 与TEST.md数据一致？gap有补救计划？ -->

## Step 5: Security Audit
> **[HIGH]** Goal: 安全不出事 | Inputs: 代码diff+DESIGN.md §10
<!-- Action: OWASP Top10+敏感数据+npm audit -->

- [ ] 认证/授权检查完整
- [ ] 敏感数据不打印日志
- [ ] 输入校验完整
- [ ] npm audit无critical/high

<!-- Validate: OWASP Top10全覆盖？跑过审计工具？ -->

> 📎 **SSOT 规则**: 安全评审应交叉验证 [CHANGE.md §Risks](CHANGE.md) + [REQUIREMENT.md §Security](REQUIREMENT.md) + [DESIGN.md §Security Model](DESIGN.md) 的三者一致性，不独立重评。发现不一致即标记为 blocking。

## Step 6: Performance Audit
> **[HIGH]** Goal: 上线不卡 | Inputs: 代码diff
<!-- Action: DB索引/N+1/阻塞IO/缓存/内存泄漏 -->

| 检查项 | 状态 | 备注 |
|--------|------|------|
| _N+1 查询_ | _N/A_ | _无数据库操作_ |

<!-- Validate: 关键路径无性能瓶颈？峰值QPS可撑？ -->


---
## Quality Gate
<!-- Evidence-first: 每个finding基于实际代码审查，非推测。Prior Learnings已检索。 -->

- [ ] S1 所有finding有位置+置信度+建议
- [ ] S1 Critical/High有修复计划
- [ ] S2 Verdict明确+blocking项有owner
- [ ] [M+] S3 五维评分完整
- [ ] [M+] S4 测试对齐TEST.md
- [ ] [H]  S5 OWASP全覆盖
- [ ] [H]  S6 关键路径无瓶颈
- [ ] **Prior Learnings**: 已检索过往session learnings并应用 | learnings-search
