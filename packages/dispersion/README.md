# @prism-five/dispersion

> 土 · 分发 — 将同一份数据同步派发至多个下游。

## API

```typescript
import { disperse } from '@prism-five/dispersion';

const [analytics, db] = disperse(data, ['analytics', 'db']);
```

## 职责

- Fan-out：一份数据 → 多个目标
- 保证每个目标收到数据副本
- 支持自定义分发策略
