# REQUIREMENT: 测试基础设施

## User Stories
| ID | As a… | I want… | So that… |
|----|--------|---------|----------|
| US-1 | developer | 运行 npm test 自动跑 vitest | 快速验证代码正确性 |
| US-2 | developer | 每个核心包有单元测试 | 修改后不会意外破坏已有功能 |
| US-3 | developer | 测试覆盖 15 条 AC | 所有需求有自动化验证 |

## Acceptance Criteria

### US-1
- **Given** 项目已安装 vitest
- **When** 运行 npm test
- **Then** vitest 运行并通过

### US-2
- **Given** prototyper 包
- **When** 运行 npm test
- **Then** incident() schema 校验测试通过

- **Given** builder 包
- **When** 运行 npm test
- **Then** refract() 异常包装 + map 测试通过

- **Given** sweeper 包
- **When** 运行 npm test
- **Then** disperse() 异步 + 失败隔离测试通过

- **Given** grower 包
- **When** 运行 npm test
- **Then** absorb.unique + reduce 测试通过

- **Given** maintainer 包
- **When** 运行 npm test
- **Then** emit() async + EmitError 测试通过

## Traceability
| AC | CHANGE ref |
|----|-----------|
| US-1 | SC1 npm test pass |
| US-2 | SC2 每包至少三条测试 |
| US-2 US-3 | SC3 15 条 AC 全覆盖 |
