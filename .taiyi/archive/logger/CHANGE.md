# CHANGE: 错误处理 + 可观测性

## Motivation
当前错误无统一格式，缺少结构化日志，排查问题困难。

## Scope
- In: orchestrator 结构化 logger、Error 序列化支持
- Out: 外部日志系统集成、metrics

## Success Criteria
- [x] Logger 可导出使用
- [x] npm test 通过
