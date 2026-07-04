# CONTEXT: Prism-Five Orchestrator MVP

## 扫描边界

| 目录 | 状态 | 说明 |
|------|------|------|
| packages/incidence/src/ | 勿动 | 已有木包 |
| packages/refraction/src/ | 勿动 | 已有火包 |
| packages/dispersion/src/ | 勿动 | 已有土包 |
| packages/absorption/src/ | 勿动 | 已有金包 |
| packages/emission/src/ | 勿动 | 已有水包 |
| packages/orchestrator/ | 新建 | 调度引擎 |
| .prism-five/ | 新建 | Agent 定义 |

## 模式

- monorepo: workspaces 管理，tsc -b 构建
- 5 包单向依赖: incidence→refraction→dispersion→absorption→emission
- 零运行时依赖、TypeScript strict mode
- 新增包对齐 package.json + tsconfig.json 格式

## 遗留坑

- 无测试框架、无 CI
- test/lint 脚本为占位 echo
- 包版本未统一
