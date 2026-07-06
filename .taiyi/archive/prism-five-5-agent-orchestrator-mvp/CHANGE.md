# CHANGE: Prism-Five 5 Agent Orchestrator MVP

## Motivation

prism-five 已有 5 个 npm 包和完整架构文档，但缺少开发工作流能力。

当前痛点：无法在 5 个角色间自动切换、没有状态管理追踪、没有 Agent 定义、没有门禁、没有契约传递。

参考：TaiyiForge (9 阶段状态机)、Superpowers (Iron Law)、ECC (分层规则)。

## Scope

In: pipeline.json + 6 Agent SKILL.md + orchestrator TS package + shared artifacts
Out: CLI 命令、实际构建执行、checkpoint、queue、三方集成

## Risks

Agent 过多上下文爆炸（独立 SKILL.md，只靠工件传递）、状态和代码不同步（engineTruth 单源）、单功能串行吞吐量低（MVP 先串行）

## Success Criteria

- [x] pipeline.json 完整可流转
- [x] 5 Agent SKILL.md 完整含 constraints/步骤/Gate/异常处理
- [x] Orchestrator 正确路由
- [x] packages/orchestrator 可编译
- [x] Agent 工具清单互不重叠
- [x] CONSTITUTION.md 覆盖核心原则
- [x] npm run build 全项目通过
