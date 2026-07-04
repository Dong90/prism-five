# CHANGE: 测试基础设施

## Motivation

当前 `npm test` 输出 "No tests configured yet"。核心包已增强，但无自动测试保证回归。

## Scope

- In: vitest 配置、5 核心包单元测试、package.json test 脚本更新
- Out: orchestrator/CLI 测试（后续 change）、E2E 测试、CI 配置

## Success Criteria

- [x] `npm test` 运行 vitest 并 pass
- [x] 5 个核心包各有 ≥3 条测试
- [x] 15 条 REQUIREMENT AC 全部覆盖
