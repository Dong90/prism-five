# @prism-five/incidence

> 木 · 数据入口 — 事件的初始接收与类型化。

## API

```typescript
import { incident } from '@prism-five/incidence';

const event = incident({ type: 'user_signup', payload: { email: 'a@b.com' } });
```

## 职责

- 接收原始事件
- 类型校验与 normalization
- 为下游棱镜提供标准化输入
