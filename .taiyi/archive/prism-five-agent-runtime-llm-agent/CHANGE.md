# CHANGE: Prism-Five Agent Runtime — LLM 调用引擎

## Motivation
Agent SKILL.md 和 Prompt builder 已就绪，但 Agent 还不会自己跑。需要运行时引擎把 Agent 上下文 dispatch 到 LLM 执行。

## Scope
In:
- orchestrator/src/runtime.ts — AgentRuntime 类，加载 Agent → 构建步骤 → 产出执行计划
- cli/src/commands/run.ts — npx prism run 命令，触发当前 Agent 执行
- 每个 Agent 步骤产出结构化 work-item，LLM host 可执行
- Agent 执行结果回写到 pipeline 状态

Out:
- 直接的 LLM API 调用（CLI 不直接调 API，产出执行计划给 LLM host）
- 自动循环执行

## Success Criteria
- [ ] AgentRuntime.dispatch() 产出完整的步骤执行计划
- [ ] npx prism run 可触发当前 Agent 执行
- [ ] 执行结果回写到 pipeline.json
- [ ] npm run build 全项目通过
