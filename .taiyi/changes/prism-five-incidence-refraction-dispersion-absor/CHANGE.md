# CHANGE: 还原项目名为 prism-five，包名还原为 incidence/refraction/dispersion/absorption/emission（五行金木水火土）

## Motivation

项目在之前的重构中从 `prism-five` 重命名为 `pentad`，5 个核心包从光学意象（incidence/refraction/dispersion/absorption/emission）改为功能描述（prototyper/builder/sweeper/grower/maintainer）。结果是：
- ARCHITECTURE.md 仍用 prism-five 命名，但 package.json 是 pentad，代码是 @pentad/*——**三处不一致**
- 金木水火土的五行映射丢失了原文脉（木=incidence 事件入口、火=refraction 变换、土=dispersion 分发广播等）
- 目录名与包名命名体系混乱，新 contributor 难以定位

**还原后**：项目名 prism-five，包名兼顾五行 + 光学意象，全仓库命名体系统一。

## Scope

- In:
  - 根 package.json: name `pentad` → `prism-five`
  - 5 个核心包目录重命名 + package.json name + 描述
  - 4 个辅助包 package.json name 更新
  - 25 处源码 import `@pentad/*` → `@prism-five/*`
  - tsconfig.json path references 更新
  - README.md 更新
  - 各包 package.json 的 workspace dependencies 同步
  - package-lock.json 重新生成
- Out:
  - ARCHITECTURE.md（已正确使用 prism-five 命名）
  - 功能代码任何改动（纯重命名，不改逻辑）
  - 测试行为（已有 42 条测试应在重命名后全部通过）
  - .taiyi/ 内部工件

## Risks

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 目录重命名后 git history loss | 中 | 低 | 使用 `git mv` 保留历史 |
| package-lock.json 冲突 | 低 | 中 | `npm install` 重新生成 |
| 遗漏某处 import 未更新 | 中 | 高 | `npm run build` + `npm test` 捕获 |

## Success Criteria

- [x] `npm run build` exit 0
- [x] `npm test` 42 tests pass
- [x] `npm run lint` pass
- [x] `node -e "require('./package.json').name"` 输出 `prism-five`
- [x] 5 个核心包目录名对应 incidence/refraction/dispersion/absorption/emission
- [x] 无源码文件残留 `@pentad/` import
