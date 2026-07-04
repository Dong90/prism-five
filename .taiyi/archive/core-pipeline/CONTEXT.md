# CONTEXT: core-pipeline

> 生成：taiyi-intel-scan · 只读扫描，非设计结论

## Scope 摘要

增强 5 个核心数据管道包（prototyper/builder/sweeper/grower/maintainer）从函数桩到完整实现。

## 相关目录

| 路径 | 关系 | 备注 |
|------|------|------|
| packages/prototyper/src/ | 必读 | 当前仅 `incident()` 单函数 |
| packages/builder/src/ | 必读 | 当前仅 `refract()` 单函数 |
| packages/sweeper/src/ | 必读 | 当前仅 `disperse()` 单函数 |
| packages/grower/src/ | 必读 | 当前仅 `absorb()` 单函数，依赖 `@pentad/sweeper` |
| packages/maintainer/src/ | 必读 | 当前仅 `emit()` 单函数 |
| packages/orchestrator/src/ | 参考 | 验证接口兼容性 |
| .taiyi/archive/ | 参考 | 历史变更记录 |

## 模式清单

- 构建：tsc -b monorepo，各包独立 tsconfig
- 包命名：`@pentad/<name>`，版本 `0.1.0`
- 导出：`src/index.ts` 单入口
- 严格模式：TypeScript strict + noUncheckedIndexedAccess
- 依赖：prototyper 无依赖；builder 无依赖；sweeper 无依赖；grower 依赖 sweeper；maintainer 无依赖
- Zod 版本：orchestrator 用 `zod ^3.23.0`（核心包当前无 zod 依赖）

## 风险区

| 级别 | 位置 | 说明 | 建议 |
|------|------|------|------|
| RISK | packages/grower/src/index.ts:1 | 导入 `@pentad/sweeper` 的 `DispersionResult` | 改类型时需同步 |
| INFO | packages/orchestrator/src/schema.ts | 已有 Zod schema 定义 | 核心包可复用但本 change 不改 orchestrator |

## Read First

1. `packages/prototyper/src/index.ts` — 当前实现，最小单函数
2. `packages/orchestrator/src/schema.ts` — Zod schema 风格参考
3. `packages/sweeper/src/index.ts` — 当前 disperse 实现（grower 的输入类型）

## Handoff

- change：已有 CHANGE.md，scope 清晰
- design：5 包独立设计，注意 grower↔sweeper 类型依赖
