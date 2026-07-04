# DESIGN: 测试基础设施

## Options
| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | vitest | 与 TypeScript 完美集成、内置 coverage | 需安装 | 低 |
| B | jest | 生态成熟 | 配置复杂、需 ts-jest | 中 |
| C | node:test | 零依赖 | 缺少断言库 | 低 |

## Decision
**Chosen:** Option A (vitest)
**Reason:** 与 TypeScript 直接集成，零配置即可运行。社区主流。

## Architecture
```
vitest.config.ts → 根级配置
packages/*/src/*.test.ts → 就近测试
npm test → vitest run
```

## Risks
| Risk | Mitigation |
|------|------------|
| tsconfig 冲突 | vitest 自动解析 tsconfig |
