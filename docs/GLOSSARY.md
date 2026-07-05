# prism-five Agent 完整目录

> 最终版本：132 → 92 agent（两轮精简后）
> 补充 COMMAND-DESIGN.md §6

---

## 1. 两轮精简

| 轮次 | 动作 | 变化 |
|:--:|------|:--:|
| 第一轮 | 删 8 个重复 + 补 27 个通用 + 标 16 个平台/51 个标签 | 132 → 122 |
| 第二轮 | 合并 12 组冗余 + 补 5 个关键 + 重定位 2 个 | 122 → **92** |

## 2. 最终分布

| 角色 | 数量 | 变化 |
|------|:--:|------|
| Prototyper | **12** | +1 problem-framer, -1 pattern合并 |
| Builder | **20** | +2 auth+ci-cd, -2 perf+pattern合并 |
| Sweeper | **20** | -1 security合并, -1 deprecation合并 |
| Grower | **16** | -6 社媒合并为1, -2 experiment合并, +1 quality-monitor移出 |
| Maintainer | **16** | -5 debug/deploy/verify合并, +1 secrets, -1 orchestrator删, +1 quality移入 |
| 跨角色 | **8** | -4 PM→2, -3 queue→1, -2 session→1, +1 audit-reporter |
| **总计** | **92** | |

---

## 3. 完整 Agent 清单

### Prototyper（12 个）

| # | agent | 职责 |
|---|-------|------|
| 1 | `prism-rapid-prototyper` | 3 天内跑出可运行 MVP 原型，集成 analytics day1 |
| 2 | `prism-problem-framer` | 原始想法→问题定义、边界、非目标、成功标准 |
| 3 | `prism-market-intelligence` | 竞品分析+趋势研究+差异化策略（合并 trend-researcher + competitive-analyst） |
| 4 | `prism-ux-researcher` | 用户研究：访谈脚本、问卷设计、可用性测试、persona验证 |
| 5 | `prism-ux-architect` | 信息架构：站点地图、导航结构、页面层级、用户流程 |
| 6 | `prism-ui-designer` | 视觉设计：配色、排版、组件、设计Token；含出图+包容性 |
| 7 | `prism-visual-storyteller` | 视觉叙事：故事板、用户旅程图、品牌瞬间、微乐趣 |
| 8 | `prism-stakeholder-interviewer` | 干系人访谈：结构化脚本、发现综合、需求优先级 |
| 9 | `prism-tech-feasibility` | 技术可行性评估：架构/人力/时间线，含轻量 spike |
| 10 | `prism-risk-assessor` | 事前风险评估：法律、安全、依赖、时间线 |
| 11 | `prism-feedback-synthesizer` | 综合用户反馈：工单、App Store、社媒评论 |
| 12 | `prism-pattern-analyzer` | 代码库审计：可复用模式+模块依赖图+数据流（跨 Prototyper/Builder） |

### Builder（20 个）

| # | agent | 职责 |
|---|-------|------|
| 1 | `prism-frontend-developer` | React/Vue/Svelte 前端开发：组件、状态、路由、样式、a11y |
| 2 | `prism-backend-architect` | 后端系统设计：API路由、数据schema、缓存、微服务 |
| 3 | `prism-data-engineer` | ETL/ELT管道：数据湖、流处理、dbt、数据质量 |
| 4 | `prism-ai-engineer` | LLM/ML集成：prompt工程、模型调用、RAG、embedding |
| 5 | `prism-senior-developer` | 复杂逻辑实现：跨模块编排、事务、并发、代码审查 |
| 6 | `prism-tech-writer` | API文档/JSDoc/OpenAPI/README：开发者文档全链路 |
| 7 | `prism-planner` | 任务拆分：PRD→TASK slice、依赖分析、工时估算 |
| 8 | `prism-executor` | 实施代理：TDD红→绿→重构循环，含证据收集+重试 |
| 9 | `prism-tool-evaluator` | 技术选型：依赖库对比、npm下载量、活跃度、许可 |
| 10 | `prism-workflow-optimizer` | 开发工作流：lint规则、pre-commit hooks、CI配置 |
| 11 | `prism-performance-engineer` | 性能设计与测量：bundle分析、p95延迟、缓存策略（合并optimization-architect+benchmarker） |
| 12 | `prism-db-schema-designer` | 数据库设计：表结构、索引、迁移方案、ER图 |
| 13 | `prism-api-contract-designer` | API契约设计：OpenAPI/GraphQL/gRPC schema |
| 14 | `prism-dependency-auditor` | 依赖审计：license兼容、供应链安全、bundle影响 |
| 15 | `prism-feature-flag-engineer` | 功能开关：flag命名空间、灰度策略、secrets管理 |
| 16 | `prism-state-machine-designer` | 工作流建模：状态/转换/事件/副作用 |
| 17 | `prism-resilience-designer` | 容错设计：重试策略、熔断器、优雅降级、幂等性 |
| 18 | `prism-auth-engineer` | 认证授权：OAuth2/OIDC/JWT/RBAC/ABAC、MFA |
| 19 | `prism-ci-cd-designer` | CI/CD管线：build矩阵、test并行化、artifact发布 |
| 20 | `prism-pattern-analyzer` | （同 Prototyper #12，跨角色复用） |

| 【平台专属】 | 适用场景 |
|------------|---------|
| `prism-mobile-app-builder` | iOS/Android 移动端 |
| `prism-metal-engineer` | macOS Metal GPU |
| `prism-visionos-engineer` | visionOS 空间计算 |
| `prism-xr-immersive` | XR/VR/AR |
| `prism-xr-cockpit` | XR 驾驶舱 |
| `prism-xr-interface-architect` | XR 空间UI |
| `prism-terminal-integration` | CLI/TUI 项目 |

### Sweeper（20 个）

| # | agent | 职责 |
|---|-------|------|
| 1 | `prism-reviewer` | 全维度代码审查：正确性、安全、性能、可维护性，含文档验证+真伪检验+测试分析 |
| 2 | `prism-security-engineer` | 安全审查：STRIDE建模+OWASP+SAST/DAST/SCA扫描（合并security-engineer+security-auditor） |
| 3 | `prism-compliance-checker` | 合规审计：PCI-DSS/HIPAA/SOC2/GDPR |
| 4 | `prism-accessibility-auditor` | WCAG 2.1 AA 无障碍审查 |
| 5 | `prism-integration-checker` | 跨模块集成校验：API契约一致性、数据流完整性 |
| 6 | `prism-lifecycle-manager` | 功能生命周期：弃用标记+版本sunset+迁移指南（合并deprecator+version-sunset） |
| 7 | `prism-debugger` | 根因调试：symptom→cause→fix，含检查点管理+修复建议 |
| 8 | `prism-regression-test-generator` | 基于代码diff自动生成回归测试用例 |
| 9 | `prism-load-test-engineer` | 负载/压力测试：并发模型、吞吐量、瓶颈识别 |
| 10 | `prism-api-contract-checker` | API契约一致性验证：请求/响应、状态码、认证 |
| 11 | `prism-dependency-updater` | 依赖更新审查：breaking changes、安全公告、迁移 |
| 12 | `prism-license-compliance` | License合规审计：直接+传递依赖 vs 项目策略 |
| 13 | `prism-e2e-generator` | 端到端测试场景生成：从用户流程/AC自动生成E2E用例 |
| 14 | `prism-chaos-engineer` | 混沌工程：故障注入、网络分区、资源耗尽验证 |
| 15 | `prism-data-consolidation` | 数据去重合并 `【→ data-engineer-g】` |
| 16 | `prism-financial-tracker` | 成本审计 `【→ cost-optimizer】` |
| 17 | `prism-eval-auditor` | AI评估审计 `【AI专属】` |
| 18 | `prism-agent-trust` | AI agent可信度 `【AI专属】` |
| 19 | `prism-ui-auditor` | UI一致性审计 `【UI专属】` |
| 20 | `prism-physical-compat` | 物理设备兼容 `【平台专属】` |

### Grower（16 个 + 1 社媒）

| # | agent | 职责 |
|---|-------|------|
| 1 | `prism-analytics-reporter` | 核心数据报告：DAU/MAU、留存、漏斗、用户分群（含usage-tracker+report-distributor） |
| 2 | `prism-retention-analyst` | 留存分析：cohort曲线、流失预测、回流策略 |
| 3 | `prism-funnel-optimizer` | 转化漏斗优化：drop-off分析、hypothesis生成（含growth-hacker+nudge-engine） |
| 4 | `prism-adoption-tracker` | 新功能采用追踪：发现率、激活率、TTV |
| 5 | `prism-metrics-designer` | 产品指标设计：事件schema、tracking plan、指标字典 |
| 6 | `prism-experiment-engineer` | A/B实验全周期：设计+追踪+显著性检验（合并tracker+designer+stats-tester） |
| 7 | `prism-evolver` | 数据驱动演化：验证通过→生成PR→Builder队列 |
| 8 | `prism-discovery-engine` | 需求发现：未满足搜索、高流失页、差评聚类 |
| 9 | `prism-feedback-engineer` | 反馈管线：收集→分析→信号提取（合并synthesizer+collector+support-analytics） |
| 10 | `prism-data-engineer-g` | 增长数据管道：ETL、数据质量、血统追踪（含lineage-tracker+dq-scorer） |
| 11 | `prism-sprint-prioritizer` | 需求优先级：RICE/ICE评估、backlog grooming |
| 12 | `prism-revenue-analyst` | 收入分析：定价实验、收入归因、付费意愿 |
| 13 | `prism-churn-preventer` | 流失预防：行为信号检测、干预策略、win-back |
| 14 | `prism-sales-extractor` | 销售数据 `【B2B专属】` |
| 15 | `prism-developer-advocate` | 开发者关系 `【可选】` |
| 16 | `prism-brand-guardian` | 品牌资产 `【营销专属】` |
| — | `prism-social-distributor --platform <name>` | 多平台社媒分发，替代 7 个独立社媒agent |

### Maintainer（16 个）

| # | agent | 职责 |
|---|-------|------|
| 1 | `prism-infra-maintainer` | 基础设施：99.9% uptime、IaC、多区域、备份管理（含backup-manager） |
| 2 | `prism-devops-automator` | DevOps自动化：CI/CD管线、blue-green/canary部署、secrets管理（含canary-controller） |
| 3 | `prism-deployment-engineer` | 部署执行：merge→tag→deploy→monitor→rollback（合并executor-m+rollback-engine） |
| 4 | `prism-release-verifier` | 发布验证：pre-flight+post-deploy全量检查（合并verifier+integration-checker-m） |
| 5 | `prism-incident-responder` | 事故响应：根因调试→修复→会话管理（合并debugger-m+session-m+fixer-m） |
| 6 | `prism-incident-coordinator` | 事故协调：跨团队沟通、升级路径、委派、时间线（含support-responder） |
| 7 | `prism-health-check-designer` | 健康检查：liveness/readiness probe、SLO/SLI、合成监控 |
| 8 | `prism-capacity-planner` | 容量预测：增长趋势预估资源、防过/欠配置 |
| 9 | `prism-dr-tester` | 灾难恢复演练：tabletop+live drill、RPO/RTO验证 |
| 10 | `prism-secrets-manager` | 密钥生命周期：TLS证书、API key轮换、secret分发 |
| 11 | `prism-cost-optimizer` | 成本优化：预留实例、spot、CDN策略（含financial-tracker） |
| 12 | `prism-monitor-setup` | 监控初始化：Prometheus、Grafana、alert rules |
| 13 | `prism-quality-monitor` | 代码质量监控：crash率、启动时间、ANR率（从Grower移入） |
| 14 | `prism-postmortem-writer` | 事故复盘：root cause→5-why→action items（含runbook+learnings） |
| 15 | `prism-doc-writer` | 正式文档：README更新、API文档、迁移指南、架构同步 |
| 16 | `prism-halt-controller` | P0全停控制器：halt all changes |

### 跨角色（8 个）

| # | agent | 职责 |
|---|-------|------|
| 1 | `prism-orchestrator` | 顶层编排：读真源→preflight→gate→dispatch |
| 2 | `prism-pm` | 项目管理：单feature优先级、资源分配、里程碑、风险 |
| 3 | `prism-program-manager` | 项目集管理：多feature协调、释放日历、跨团队 |
| 4 | `prism-queue-manager` | 队列管理：create+prioritize+dequeue（合并intake-new+queue-mgr+next-mgr） |
| 5 | `prism-session-manager` | 会话管理：pause/resume HANDOFF（合并pause-mgr+resume-mgr） |
| 6 | `prism-lifecycle-manager` | 状态转换：cancel+promote |
| 7 | `prism-audit-reporter` | 审计报告：跨feature审计日志、合规报告 |
| 8 | `prism-onboard` | 入门引导：新成员onboarding、工具链安装 |

---

## 4. 合并对照表（第二轮）

| 合并前 | → 合并后 |
|--------|---------|
| trend-researcher + competitive-analyst | `market-intelligence` |
| optimization-architect + performance-benchmarker | `performance-engineer` |
| pattern-mapper(Proto) + pattern-finder(Builder) | `pattern-analyzer`（跨角色共用） |
| security-engineer + security-auditor | `security-engineer` |
| deprecator + version-sunset | `lifecycle-manager` |
| experiment-tracker + experiment-designer + stats-tester | `experiment-engineer` |
| feedback-synthesizer-g + feedback-collector + support-analytics | `feedback-engineer` |
| usage-tracker + report-distributor → analytics-reporter | `analytics-reporter`（扩） |
| growth-hacker + nudge-engine → funnel-optimizer | `funnel-optimizer`（扩） |
| debugger-m + debug-session-m + code-fixer-m | `incident-responder` |
| executor-m + rollback-engine | `deployment-engineer` |
| verifier + integration-checker-m | `release-verifier` |
| canary-controller → devops-automator | `devops-automator`（扩） |
| backup-manager → infra-maintainer | `infra-maintainer`（扩） |
| runbook-generator + learnings-curator → postmortem-writer | `postmortem-writer`（扩） |
| 7社媒 agent | `social-distributor --platform <name>` |
| pm-senior + project-shepherd + studio-ops + studio-producer | `pm` + `program-manager` |
| intake-new + queue-mgr + next-mgr | `queue-manager` |
| pause-mgr + resume-mgr | `session-manager` |
| quality-monitor | Grower → Maintainer |
| orchestrator-agent(Maintainer) | 删（跨角色orchestrator已覆盖） |

## 5. 新增 agent（第二轮）

| agent | 角色 |
|-------|------|
| `prism-problem-framer` | Prototyper |
| `prism-auth-engineer` | Builder |
| `prism-ci-cd-designer` | Builder |
| `prism-e2e-generator` | Sweeper |
| `prism-chaos-engineer` | Sweeper |
| `prism-revenue-analyst` | Grower |
| `prism-churn-preventer` | Grower |
| `prism-secrets-manager` | Maintainer |
| `prism-audit-reporter` | 跨角色 |
