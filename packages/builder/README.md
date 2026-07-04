# @prism-five/refraction

> 火 · 数据变换 — 纯函数映射，从一个形状变为另一个形状。

## API

```typescript
import { incident } from '@prism-five/incidence';
import { refract } from '@prism-five/refraction';

const event = incident({ type: 'click', payload: { x: 100, y: 200 } });
const enriched = refract(event, e => ({ ...e, timestamp: Date.now() }));
```

## 职责

- 接收上游数据
- 应用纯函数变换
- 输出变换后的数据
