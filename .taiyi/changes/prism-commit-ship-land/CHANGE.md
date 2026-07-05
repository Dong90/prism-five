# CHANGE: 交付链 — prism commit/ship/land

## Motivation
TaiyiForge 的 /taiyi:commit /taiyi:ship /taiyi:land 三个交付命令需要吸收为 Prism CLI。

## Scope
- In: commit.ts (git add + commit with Prism-Change trailer), ship.ts (git push), land.ts (mark complete)
- In: index.ts 注册
- Out: 不涉及 orchestrator 变更

## Risks
无。遵循现有 Commander.js 模式。

## Success Criteria
- [x] 3 CLI 命令创建 + index.ts 注册
- [x] npm run build 通过
- [x] commit 命令自动追加 Prism-Change trailer
