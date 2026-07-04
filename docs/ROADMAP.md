# Roadmap

## v0.1 — 骨架

- [x] monorepo 结构 (npm workspaces)
- [x] 5 包骨架 (incidence, refraction, dispersion, absorption, emission)
- [x] 共享 TypeScript 配置
- [x] README / ARCHITECTURE / CONTRIBUTING 文档
- [x] CI 基础 (typecheck + lint + test)

## v0.2 — 核心实现

- [ ] incidence: `incident<T>()` 类型安全事件入口
- [ ] refraction: `refract<T,U>()` 纯函数变换
- [ ] dispersion: `disperse<T>()` 多目标分发
- [ ] absorption: `absorb<T>()` 多源聚合
- [ ] emission: `emit<T>()` 可插拔输出

## v0.3 — 生态

- [ ] `examples/yoga-landing/` — 端到端串联示例
- [ ] 每个包 80%+ 测试覆盖率
- [ ] 发布到 npm
