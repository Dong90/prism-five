# CHANGE: Prism-Five CLI Commands + Agent Runtime
## Motivation
MVP 已有 Pipeline 类和 Agent 定义，缺少用户界面和 Agent 执行引擎。
## Scope
In: 6 CLI commands + Agent loader + Prompt builder
Out: LLM 调用、Agent 执行循环、Queue 调度、Checkpoint
## Risks
SKILL.md 格式变化影响 parser (低风险，基于正则可维护)
## Success Criteria
- [x] npx prism status 可运行并显示当前状态
- [x] npx prism new <slug> 创建新 feature
- [x] npx prism continue 推进角色
- [x] npx prism approve <gate> 通过门禁
- [x] Agent loader 可解析 SKILL.md 提取结构化信息
- [x] 上下文注入生成完整的 Agent prompt
- [x] npm run build 全项目通过
