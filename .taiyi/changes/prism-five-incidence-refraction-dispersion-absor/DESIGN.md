# DESIGN: 还原项目名为 prism-five，包名还原为 incidence/refraction/dispersion/absorption/emission（五行金木水火土）

## Context

纯重命名变更。修改范围：9 个 package.json、25 处源码 import、根 tsconfig.json、README.md。不涉及功能逻辑改动。

**禁动清单**：ARCHITECTURE.md（已正确）、.taiyi/ 工件、功能逻辑。

## Options

| Option | Summary | Pros | Cons | Cost |
|--------|---------|------|------|------|
| A | 逐文件手动 rename | 精确控制 | 容易遗漏 import、费时 | 中 |
| B | shell 脚本批量 rename | 速度快、可重复、不易遗漏 | 脚本本身需审查、极端边缘情况（如注释中 @pentad 被误改） | 低 |
| C | 两阶段：先改包名 + import，再挪目录 | 两步各可独立验证 | 中间状态不可用、commit 数量翻倍 | 低 |

## Decision

**Chosen:** Option B — shell 脚本批量 rename。
**Reason:** 25 处 import 分布在 14 个文件中，手动改必然遗漏且无法重放。脚本可精确控制替换范围（只改源文件和 package.json，不改 node_modules 和 dist），且可反复运行验证是否全部替换。

## Architecture

```
执行流程：
  1. git checkout -b restore-prism-five
  2. 更新根 package.json name: pentad → prism-five
  3. git mv 核心包目录
  4. 更新 9 个 package.json 的 name 字段
  5. 更新 5 个核心包 description 字段（五行标注）
  6. 更新 package.json 中的 workspace dependency 引用
  7. 更新 tsconfig.json 的 path references
  8. 批量替换源码中 @pentad/ → @prism-five/
  9. 更新 README.md
  10. npm install（再生 package-lock.json）
  11. npm run build && npm test && npm run lint
```

### 目录映射

| 当前目录 | 目标目录 | npm 包名 |
|---------|---------|---------|
| packages/prototyper | packages/incidence | @prism-five/incidence |
| packages/builder | packages/refraction | @prism-five/refraction |
| packages/sweeper | packages/dispersion | @prism-five/dispersion |
| packages/grower | packages/absorption | @prism-five/absorption |
| packages/maintainer | packages/emission | @prism-five/emission |

### 辅助包

| 当前 | 目标 |
|------|------|
| @pentad/orchestrator | @prism-five/orchestrator |
| @pentad/cli | @prism-five/cli |
| @pentad/benchmarks | @prism-five/benchmarks |
| @pentad/e2e | @prism-five/e2e |

## Risks

| Risk | Mitigation |
|------|------------|
| 遗漏 import 更新 | 改完后 `grep -r '@pentad/' packages/ --include='*.ts' --include='*.json'` 校验零匹配 |
| git mv 后 git blame 追踪丢失 | `git mv` 保留历史；`git blame -C` 可追踪 rename |
| package-lock.json 冲突 | `rm package-lock.json && npm install` 再生 |

## Open

无。纯 rename，决策清晰。

## 架构沉淀建议

无建议——纯命名还原，不涉及新抽象或架构变动。
