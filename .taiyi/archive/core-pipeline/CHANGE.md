# CHANGE: Core pipeline 包增强 — 函数桩到完整实现

## Motivation

5 个核心包 (prototyper/builder/sweeper/grower/maintainer) 目前是单函数桩：
- 无输入校验、无错误处理、无边界情况处理
- 生产使用会静默吞掉错误或返回无意义结果
- 外部无法依赖这些包做可靠的数据管道

## Scope

- In:
  - prototyper: incident() — schema 校验、type narrowing、非法 payload 报错
  - builder: refract() — 变换异常捕获、类型安全的 map 工具函数
  - sweeper: disperse() — target 合法性校验、异步 target 支持、单 target 失败隔离
  - grower: absorb() — concat/unique/reduce 三种合并策略、空结果处理
  - maintainer: emit() — async sink 支持、sink 错误捕获、返回 Promise 结果
- Out:
  - 本 change 不涉及测试（将在测试 change 覆盖）
  - 不涉及 orchestrator/CLI 改动
  - 不涉及文档生成

## Risks

- 修改公共接口可能破坏 orchestrator 中已有引用（需确认引用模式）
- Zod 版本差异：orchestrator 用 zod ^3.23.0，需对齐

## Success Criteria

- [x] `npm run build` exit 0
- [x] 5 个包每个至少 3 个导出（函数 + 类型 + 工具）
- [x] 非法输入抛出明确错误（非静默吞掉）
- [x] 各包独立可用（不依赖 orchestrator）
