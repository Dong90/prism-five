# CHANGELOG: 测试基础设施

## Added
- vitest 测试框架配置
- 5 核心包 22 条单元测试

## Changed
- package.json test 脚本更新为 vitest run

## Rollback
- git revert package.json vitest.config.ts packages/*/src/*.test.ts
