# CHANGE: CLI 补齐 — prism cancel/list/doctor/guide/check/sync/init

## Motivation
Prism CLI 需补齐 TaiyiForge 常用命令，遵循现有 Commander.js 模式。

## Scope
- In: 7 CLI 命令文件 cancel.ts/list.ts/doctor.ts/guide.ts/check.ts/sync.ts/init.ts
- In: index.ts 注册
- Out: orchestrator 层不变

## Risks
无——遵循 approve.ts/new.ts 模式，零依赖。

## Success Criteria
- [ ] 7 命令文件创建，index.ts 注册
- [ ] npm run build 通过
