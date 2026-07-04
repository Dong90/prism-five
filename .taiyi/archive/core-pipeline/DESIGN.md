# DESIGN: Core pipeline 包增强 — 函数桩到完整实现

## Options
| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | Zod schema 声明式校验 | 类型推导、错误信息好、与 orchestrator 对齐 | 增加外部依赖、破坏零运行时依赖 | 低 |
| B | 手动校验 + 类型守卫 | 零依赖、轻量、无额外 bundle | 错误信息需手写 | 低 |
| C | 直接 throw Error | 最简单 | 无法区分来源 | 低 |

## Decision
**Chosen:** Option B（手动校验+类型守卫）
**Reason:** 保持零运行时依赖原则，核心包不应产生额外 bundle 开销。手动校验代码量可控。

## Architecture
```
event → incident(event) → IncidentEvent
     → refract(data, fn) → U | RefractError
     → disperse(data, targets) → Promise<DispersionResult>
     → absorb(dispersion) → AbsorptionResult
     → emit(data, sink) → Promise<void>
```

### 各包变更概要
| 包 | 新增导出 | 自定义 Error |
|----|----------|-------------|
| prototyper | (增强 incident) | PrototyperError |
| builder | refract.map | RefractError |
| sweeper | (增强 disperse 异步) | 无 |
| grower | absorb.unique, absorb.reduce | 无 |
| maintainer | (增强 emit 异步) | EmitError |

## Risks
| Risk | Mitigation |
|------|------------|
| 修改接口破坏现有引用 | 保持签名向后兼容（返回值从 T 改为 T/Promise<T> 需评估） |
| grower 依赖 sweeper 类型 | 同步修改 DispersionResult 定义 |

## Open
- [ ] disperse 返回 Promise 是否破坏现有同步调用方（已知只有 grower）
- [ ] emit 返回 Promise 是否破坏现有调用方（已知只有 CLI run 命令）
