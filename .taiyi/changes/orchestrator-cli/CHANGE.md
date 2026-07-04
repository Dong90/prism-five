# CHANGE: Orchestrator + CLI 测试覆盖

## Motivation
orchestrator 和 CLI 包目前无测试。核心包已有测试但引擎层无覆盖。

## Scope
- In: Pipeline 状态机测试、gate 测试、agent loader 测试、schema 测试
- Out: CLI E2E 测试、runtime 集成测试

## Success Criteria
- [x] orchestrator 测试文件存在
- [x] npm test 包含 orchestrator 测试
