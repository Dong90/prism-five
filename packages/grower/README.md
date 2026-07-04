# @prism-five/absorption

> 金 · 收集 — 从多个上游汇聚数据。

## API

```typescript
import { absorb } from '@prism-five/absorption';

const result = absorb([[ 'analytics', data1 ], [ 'db', data2 ]]);
```

## 职责

- Fan-in：多个数据源 → 统一收集
- 合并、去重、reduce
- 可配置聚合策略
