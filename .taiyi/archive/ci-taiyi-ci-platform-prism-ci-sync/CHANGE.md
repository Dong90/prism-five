# CHANGE: 多平台 CI 同步 — taiyi_ci_platform 迁移为 prism ci sync

## Motivation
TaiyiForge 的 `taiyi_ci_platform` 支持将 agent skill 同步到 opencode/claude/codex/cursor。需要吸收为 Prism 原生的 `prism ci sync` 命令。

## Scope
- In: 新增 `packages/orchestrator/src/ci.ts` 模块，`syncSkills(platform, profileDir)` 函数
- In: 支持 opencode/claude/codex/cursor 四个平台
- Out: 不涉及 CLI 命令注册（CLI 命令在独立 change 中）

## Risks
无依赖。纯文件复制操作，不修改现有代码。

## Success Criteria
- [x] ci.ts 模块编译通过
- [x] syncSkills('opencode') 将 agent markdown 复制到目标目录
- [x] 已导出到 index.ts
