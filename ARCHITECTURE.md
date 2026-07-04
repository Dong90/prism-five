# Prism-Five 架构

## 核心概念

Prism-Five 将数据流转建模为光穿过五棱镜的过程——数据从进入棱镜到射出，经过五次折射与变换。

## 五棱镜拓扑

```
[输入] → incidence → refraction → dispersion → absorption → emission → [输出]
  木          火           土            金           水
```

每个棱镜是一个独立的 npm 包，拥有清晰且单一的职责：

| # | 棱镜 | 五行 | 核心接口 | 职责描述 |
|---|------|------|----------|----------|
| 1 | incidence | 木 | `incident<T>(event)` | 事件的初始接收与类型化。数据入口，负责 normalization 与 schema 校验。 |
| 2 | refraction | 火 | `refract<T,U>(data, fn)` | 数据变换。纯函数映射，从一个形状变为另一个形状。Fire-and-transform。 |
| 3 | dispersion | 土 | `disperse<T>(data, targets)` | 分发。将同一份数据副本同步派发至多个下游。Fan-out。 |
| 4 | absorption | 金 | `absorb<T>(source)` | 收集与聚合。从多个上游汇聚数据，合并、去重、reduce。Fan-in。 |
| 5 | emission | 水 | `emit<T>(data, sink)` | 最终输出。将处理后的数据发送到外部系统（console、file、socket、API）。 |

## 包依赖图

```
incidence  ←  无依赖 (入口)
refraction ←  @prism-five/incidence
dispersion ←  @prism-five/refraction
absorption ←  @prism-five/dispersion
emission   ←  @prism-five/absorption
```

沿管道单向流动。没有环形依赖。

## 组合示例

```typescript
import { incident } from '@prism-five/incidence';
import { refract } from '@prism-five/refraction';
import { disperse } from '@prism-five/dispersion';
import { absorb } from '@prism-five/absorption';
import { emit } from '@prism-five/emission';

// Raw event in
const ev = incident({ type: 'user_signup', payload: { email: 'a@b.com' } });

// Transform shape
const enriched = refract(ev, e => ({ ...e, timestamp: Date.now() }));

// Fan-out to analytics + DB
const [analytics, db] = disperse(enriched, ['analytics', 'db']);

// Collect results
const result = absorb([analytics, db]);

// Output
emit(result, console.log);
```

## 设计原则

- **单一职责**：每个棱镜只做一件事
- **类型安全**：全程 TypeScript strict mode
- **零运行时依赖**：核心包不依赖第三方库
- **可组合**：每个棱镜可独立使用，也可串联
- **可测试**：纯函数优先，副作用隔离
