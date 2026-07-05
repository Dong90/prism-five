# Changelog Archive

> 自动归档：CHANGELOG.md 超出 200 行时较早的条目移至此处。

## Archived at 2026-07-05

<!-- taiyi:e2e --> 2026-07-04
# CHANGELOG: E2E 集成测试

## Added

- packages/e2e: 全流程集成测试 (incident → refract → disperse → absorb → emit)
- 新增 9 个 E2E 测试用例，覆盖正常流程、错误处理、refract.map、absorb.unique、absorb.reduce

## Changed

- tsconfig.json: 添加 packages/e2e 引用
- vitest.config.ts: 包含 e2e 测试路径

## Verification

- [x] `npm run build` passes
- [x] `npm test` passes (42 tests, 9 files)
- [x] `npm run lint` passes
