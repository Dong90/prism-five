# REQUIREMENT: Core pipeline 包增强 — 函数桩到完整实现

## User Stories
| ID | As a… | I want… | So that… |
|----|--------|---------|----------|
| US-1 | pipeline user | incident() 校验输入事件 schema | 非法数据被及早拒绝而非穿透管道 |
| US-2 | pipeline user | refract() 在变换抛异常时捕获并包装 | 管道不被单次故障中断 |
| US-3 | pipeline user | disperse() 支持异步 target 并隔离失败 | 广播不会因一个接收方故障而全局失败 |
| US-4 | pipeline user | absorb() 支持 concat/unique/reduce 策略 | 灵活处理多源数据 |
| US-5 | pipeline user | emit() 支持 async sink 并捕获输出错误 | I/O 错误不影响管道状态 |

## Acceptance Criteria

### US-1
- **Given** 合法事件 type string payload object
- **When** 调用 incident(event)
- **Then** 返回类型化事件对象

- **Given** 非法事件 type number
- **When** 调用 incident(event)
- **Then** 抛出 TypeError 包含 type must be a string

- **Given** 事件无 payload 字段
- **When** 调用 incident(event)
- **Then** 正常返回 payload undefined

### US-2
- **Given** data 1 fn 为 double
- **When** 调用 refract(data fn)
- **Then** 返回 2

- **Given** data null fn 访问不存在的属性
- **When** 调用 refract(data fn)
- **Then** 抛出 RefractError

- **Given** 数组 1 2 3 fn 为 double
- **When** 调用 refract.map(arr fn)
- **Then** 返回 2 4 6

### US-3
- **Given** 对象数据 targets a b
- **When** 调用 disperse(data targets)
- **Then** 返回两个条目

- **Given** 任意数据 targets 为空
- **When** 调用 disperse(data [])
- **Then** 返回空数组

- **Given** 异步 target 函数
- **When** 调用 disperse(data asyncFn)
- **Then** 等待 resolve 后返回结果

### US-4
- **Given** 分发结果包含两个来源
- **When** 调用 absorb(results)
- **Then** 返回 sources data 两个字段

- **Given** 含重复数据的结果
- **When** 调用 absorb.unique(results)
- **Then** 返回去重后数据

- **Given** 空数组
- **When** 调用 absorb([])
- **Then** 返回 sources 空 data 空

### US-5
- **Given** 字符串数据同步 sink
- **When** 调用 emit(data sink)
- **Then** sink 被调用一次传入该字符串

- **Given** 字符串数据异步 sink
- **When** 调用 emit(data sink)
- **Then** 返回 Promise resolve 后 sink 已执行

- **Given** 抛出异常的 sink
- **When** 调用 emit(data sink)
- **Then** 抛出 EmitError 包含原始错误

## Traceability
| AC | CHANGE ref |
|----|-----------|
| US-1 AC1 AC2 AC3 | 非法输入抛出明确错误 |
| US-2 AC1 AC2 AC3 | 非法输入抛出明确错误 |
| US-3 AC1 AC2 AC3 | 每包至少三个导出 |
| US-4 AC1 AC2 AC3 | 每包至少三个导出 |
| US-5 AC1 AC2 AC3 | 每包至少三个导出 |

## Out of Scope
- 本 change 不涉及测试框架配置
- 不涉及 orchestrator 或 CLI 的改动
- 不涉及文档生成
