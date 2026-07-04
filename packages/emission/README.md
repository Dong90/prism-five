# @prism-five/emission

> 水 · 输出 — 将处理后的数据发送到外部系统。

## API

```typescript
import { emit } from '@prism-five/emission';

emit(data, console.log);
emit(data, fs.writeFileSync);
emit(data, apiClient.post);
```

## 职责

- 最终输出阶段
- 可插拔 sink（console、file、socket、API）
- 支持同步/异步 sink
