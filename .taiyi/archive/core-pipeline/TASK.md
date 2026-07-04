# TASK: Core pipeline 包增强 — 函数桩到完整实现

## Slices
| # | Slice | Depends | Done |
|---|-------|---------|------|
| 1 | prototyper — incident schema 校验 + PrototyperError | — | build + 手动运行验证 |
| 2 | builder — refract try/catch + map 工具 + RefractError | — | build + 手动运行验证 |
| 3 | sweeper — disperse 异步 + 失败隔离 | — | build + 手动运行验证 |
| 4 | grower — absorb.unique + absorb.reduce | — | build + 手动运行验证 |
| 5 | maintainer — emit Promise + async + EmitError | — | build + 手动运行验证 |

## Checklist per slice
- [ ] W1/S1 — npm run build 通过
- [ ] W1/S2 — npm run build 通过
- [ ] W1/S3 — npm run build 通过
- [ ] W1/S4 — npm run build 通过
- [ ] W1/S5 — npm run build 通过
- [ ] 各包独立 tsconfig 可编译

## Non-goals
- 不涉及测试框架配置（后续 change 覆盖）
- 不涉及 orchestrator 改动
- 不涉及 CLI 改动
