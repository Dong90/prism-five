# 包命名规范

## 范围名

所有包位于 `@prism-five` 范围下。

```
@prism-five/incidence
@prism-five/refraction
@prism-five/dispersion
@prism-five/absorption
@prism-five/emission
```

## 导出约定

每个包从 `src/index.ts` 导出公共 API：

```typescript
// ✅ 正确：命名导出
export { incident } from './incident.js';
export { IncidentEvent } from './types.js';

// ❌ 错误：默认导出
export default function incident() { ... }
```

## 文件命名

- 源文件：`kebab-case.ts`
- 类型文件：`types.ts`
- 测试文件：`*.test.ts`
