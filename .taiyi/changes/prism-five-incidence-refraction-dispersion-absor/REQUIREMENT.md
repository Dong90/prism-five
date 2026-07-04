# REQUIREMENT: 还原项目名为 prism-five，包名还原为 incidence/refraction/dispersion/absorption/emission（五行金木水火土）

## User Stories

| ID | As a… | I want… | So that… |
|----|--------|---------|----------|
| US-1 | developer | 项目名统一为 prism-five | 与 ARCHITECTURE.md 和三棱镜隐喻一致 |
| US-2 | developer | 5 个核心包目录名为 incidence/refraction/dispersion/absorption/emission | 包目录反映域语言而非功能描述 |
| US-3 | developer | 包名为 @prism-five/incidence 等 | npm 包名与架构文档一致 |
| US-4 | developer | 五行金木水火土显式标注在包描述中 | 中文读者能关联五行与光学意象 |
| US-5 | developer | 源码无残留 @pentad/ 引用 | 全仓库命名体系统一 |
| US-6 | developer | rename 后 build + test 全部通过 | 重命名不破坏任何功能 |

## Acceptance Criteria

### US-1: 项目名统一
- **Given** 根 package.json
- **When** 读取 name 字段
- **Then** 值为 `prism-five`

### US-2: 核心包目录名
- **Given** packages/ 目录
- **When** 列出 core 包目录
- **Then** 为 `incidence` `refraction` `dispersion` `absorption` `emission`

### US-3: 包名
- **Given** 各包 package.json
- **When** 检查 name 字段
- **Then** 分别为 `@prism-five/incidence` `@prism-five/refraction` `@prism-five/dispersion` `@prism-five/absorption` `@prism-five/emission`

### US-4: 五行标注
- **Given** 各核心包 package.json
- **When** 检查 description 字段
- **Then** 包含对应五行（木火土金水）

### US-5: 无残留引用
- **Given** packages/ 下所有源文件
- **When** grep 搜索 `@pentad/`
- **Then** 无匹配

### US-6: build + test
- **Given** rename 完成
- **When** 运行 `npm run build`
- **Then** exit 0
- **When** 运行 `npm test`
- **Then** 42 tests pass, exit 0
- **When** 运行 `npm run lint`
- **Then** exit 0

## Traceability

| AC | CHANGE ref |
|----|-----------|
| US-1 US-2 US-3 US-4 | SC1: npm run build exit 0 |
| US-5 | SC2: npm test 42 tests pass |
| US-6 | SC3: npm run lint pass<br>SC4: package.json name = prism-five<br>SC6: 无 @pentad/ 残留 |

## Out of Scope
- 不改 ARCHITECTURE.md（已正确使用 prism-five）
- 不改功能代码
- 不改 .taiyi/ 工件
