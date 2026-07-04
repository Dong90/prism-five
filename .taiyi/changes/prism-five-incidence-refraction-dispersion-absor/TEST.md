# TEST: 还原项目名 prism-five + 包名重命名

## Test Plan

| ID | 范围 | 命令 | 预期 |
|----|------|------|------|
| T01 | 全项目构建 | `npm run build` | exit 0 |
| T02 | 单元测试回归 | `npm test` | 42 tests pass |
| T03 | Lint + 格式 | `npm run lint` | exit 0 |
| T04 | 项目名验证 | `node -e "console.log(require('./package.json').name)"` | prism-five |
| T05 | 核心包目录 | `ls packages/incidence packages/refraction packages/dispersion packages/absorption packages/emission` | 目录全部存在 |
| T06 | 包名一致性 | 各包 package.json name 字段 | `@prism-five/*` |
| T07 | 源码无残留 | `grep -r '@pentad/' packages/ --include='*.ts'` | 零匹配 |
| T08 | lock 文件纯净 | `grep -c '@pentad/' package-lock.json` | 0 |

## 五轮声明

- 功能: ✅ 42 条测试全部通过，回归验证通过
- 性能: ⏭ 纯重命名，不涉及算法/IO/性能变化
- 安全: ⏭ 无用户输入、无权鉴、无网络操作
- 兼容: ✅ build + test + lint 全部通过
- 可观测: ⏭ 不涉及日志/监控改动

## 验证结果

| 验证项 | 命令 | 结果 |
|--------|------|------|
| build | `npm run build` | exit 0 |
| unit tests | `npm test` | 42 passed, 9 files |
| lint | `npm run lint` | exit 0, Prettier OK |
| 项目名 | `node -e "console.log(require('./package.json').name)"` | prism-five |
| 核心包目录 | `ls packages/incidence packages/refraction packages/dispersion packages/absorption packages/emission` | 全部存在 |
| 包名 | 5 核心包 package.json name 字段 | @prism-five/incidence 等 |
| 无残留 @pentad | `grep -r '@pentad/' packages/ --include='*.ts'` | 零匹配 |
| package-lock 无 @pentad | `grep -c '@pentad/' package-lock.json` | 0 |

## 6 维衰退检测

| T | 维度 | 结论 |
|---|------|------|
| T1 | 意图 — rename 是否准确到位 | ✅ 无衰退 |
| T2 | 脆性 — 测试是否因 rename 变脆弱 | ✅ 42 条测试无一需要修改 |
| T3 | 重复 — 是否引入重复 | ✅ 纯重命名，0 新增代码 |
| T4 | Mock — 是否依赖 mock | ✅ 不涉及 |
| T5 | 假象 — 测试是否自欺欺人 | ✅ 42 条测试全部用真实模块路径 |
| T6 | 架构 — rename 后依赖拓扑是否正确 | ✅ build 通过证明依赖图完整 |

6 维衰退命中：0，全部通过。

## 回归确认

- [x] `npm run build` exit 0
- [x] `npm test` 42 tests pass (9 test files)
- [x] `npm run lint` exit 0
- [x] 无 `@pentad/` 残留引用
