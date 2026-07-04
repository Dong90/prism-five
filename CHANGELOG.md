# Changelog

<!-- taiyi:core-pipeline --> 2026-07-04

# CHANGELOG: Core pipeline 包增强 — 函数桩到完整实现

## Changed

- prototyper: incident() 添加 schema 校验 + PrototyperError
- builder: refract() 添加 try/catch 异常包装 + refract.map 工具 + RefractError
- sweeper: disperse() 支持异步 target + 失败隔离，返回 Promise
- grower: absorb() 添加 absorb.unique + absorb.reduce
- maintainer: emit() 返回 Promise，支持 async sink + EmitError

## Rollback

- git revert packages/prototyper packages/builder packages/sweeper packages/grower
  packages/maintainer

<!-- taiyi:vitest --> 2026-07-04

# CHANGELOG: 测试基础设施

## Added

- vitest 测试框架配置
- 5 核心包 22 条单元测试

## Changed

- package.json test 脚本更新为 vitest run

## Rollback

- git revert package.json vitest.config.ts packages/_/src/_.test.ts

<!-- taiyi:linter-eslint-prettier --> 2026-07-04

# CHANGELOG: Linter + 代码质量工具

## Added

- ESLint flat config (typescript-eslint)
- Prettier 配置
- npm run lint 脚本

## Changed

- 修复 CLI/orchestrator 中的 lint 错误

<!-- taiyi:ci-cd-pipeline-github-actions --> 2026-07-04

# CHANGELOG: CI/CD pipeline — GitHub Actions

## Added

- .github/workflows/ci.yml with build/test/lint on push & PR
