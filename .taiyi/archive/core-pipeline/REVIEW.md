# REVIEW: Core pipeline 包增强

## 第一轮 · Spec 合规

### AC 覆盖
| US | AC | 状态 | 证据 |
|-----|----|------|------|
| US-1 AC1 | 合法事件 → 返回 | ✅ | prototyper/src/index.ts:38-45 |
| US-1 AC2 | 非法 type → TypeError | ✅ | prototyper/src/index.ts:40-43 |
| US-1 AC3 | 无 payload 正常 | ✅ | prototyper/src/index.ts:45-49 |
| US-2 AC1 | refract 正常变换 | ✅ | builder/src/index.ts:10-12 |
| US-2 AC2 | refract 异常包装 | ✅ | builder/src/index.ts:13-18 |
| US-2 AC3 | refract.map | ✅ | builder/src/index.ts:22-32 |
| US-3 AC1 | disperse 多 target | ✅ | sweeper/src/index.ts:33-46 |
| US-3 AC2 | 空 targets → [] | ✅ | sweeper/src/index.ts:35 |
| US-3 AC3 | 异步 target | ✅ | sweeper/src/index.ts:21-31 |
| US-4 AC1 | absorb concat | ✅ | grower/src/index.ts:8-12 |
| US-4 AC2 | absorb.unique | ✅ | grower/src/index.ts:14-28 |
| US-5 AC1 | 同步 sink | ✅ | maintainer/src/index.ts:12-17 |
| US-5 AC2 | 异步 sink Promise | ✅ | maintainer/src/index.ts:17-19 |
| US-5 AC3 | sink 异常 → EmitError | ✅ | maintainer/src/index.ts:20-25 |

## 总结
15 条 AC 全部覆盖，npm run build 通过。准备好进入集成阶段。
