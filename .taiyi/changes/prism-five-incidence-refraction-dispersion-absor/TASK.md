# TASK: 还原项目名为 prism-five，包名还原为 incidence/refraction/dispersion/absorption/emission

## Slices

| # | Slice | Depends | Action | Verify |
|---|-------|---------|--------|--------|
| T01 | 根 + README + tsconfig 更新 | — | 改 root package.json name、README.md 项目名、tsconfig.json path refs | `node -e "console.log(require('./package.json').name)"` 输出 prism-five |
| T02 | 核心包目录重命名 + package.json | — | `git mv` 5 个目录 + 更新 5 个 package.json name + description | `ls packages/incidence/package.json` 存在且 name 正确 |
| T03 | 辅助包 package.json 更新 | — | 更新 orchestrator/cli/benchmarks/e2e 的 name + deps | 各包 name 为 `@prism-five/*` |
| T04 | 源码 import 批量替换 | T02 T03 | 所有 .ts 文件中 `@pentad/` → `@prism-five/` | `grep -r '@pentad/' packages/ --include='*.ts'` 零匹配 |
| T05 | Build + Test + Lint 验证 | T01 T04 | npm install → npm run build → npm test → npm run lint | build exit 0, 42 tests pass, lint pass |

## Wave Plan

```
Wave1: T01[T] + T02[T] + T03[T]  (并行，互不依赖)
Wave2: T04[T]  (等待 T02+T03)
Wave3: T05[T]  (等待 T01+T04)
```

## Checklist per slice

### T01: 根 + README + tsconfig
- [ ] 根 package.json name: pentad → prism-five
- [ ] README.md 标题 pentad → Prism-Five
- [ ] tsconfig.json path: prototyper → incidence 等
- [ ] Verify: `node -e "console.log(require('./package.json').name)"` 输出 prism-five

### T02: 核心包目录重命名
- [ ] `git mv packages/prototyper packages/incidence`
- [ ] `git mv packages/builder packages/refraction`
- [ ] `git mv packages/sweeper packages/dispersion`
- [ ] `git mv packages/grower packages/absorption`
- [ ] `git mv packages/maintainer packages/emission`
- [ ] 更新 5 个 package.json name + description（含五行标注）
- [ ] Verify: `ls packages/incidence/package.json` 存在且 name 正确

### T03: 辅助包 package.json
- [ ] @pentad/orchestrator → @prism-five/orchestrator
- [ ] @pentad/cli → @prism-five/cli
- [ ] @pentad/benchmarks → @prism-five/benchmarks
- [ ] @pentad/e2e → @prism-five/e2e
- [ ] 更新 orchestrator 的 workspace deps: @pentad/* → @prism-five/*
- [ ] Verify: 各包 `name` 正确

### T04: 源码 import 替换
- [ ] `sed -i '' 's/@pentad\//@prism-five\//g' packages/*/src/**/*.ts`
- [ ] Verify: `grep -r '@pentad/' packages/ --include='*.ts'` 零匹配

### T05: Build + Test + Lint
- [ ] `rm -rf packages/*/dist`
- [ ] `npm install`（再生 package-lock.json）
- [ ] `npm run build` exit 0
- [ ] `npm test` 42 tests pass
- [ ] `npm run lint` exit 0

## 执行注意事项

- T02 必须用 `git mv` 而非 `mv`，以保留文件历史
- T04 只改 `/*.ts` 文件，**不碰** node_modules/、dist/、.taiyi/
- T05 前先 `rm -rf packages/*/dist` 清理构建产物，再 `npm install && npm run build`
