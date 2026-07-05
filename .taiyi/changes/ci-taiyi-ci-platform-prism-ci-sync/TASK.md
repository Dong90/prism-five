# TASK: prism ci sync — agent skill 多平台同步

## Slices

| # | Slice | Depends | Done when |
|---|-------|---------|-----------|
| 1 | ci.ts: syncSkills(platform, profileDir) | — | npx vitest run ci.test.ts green |

## Checklist per slice

### Slice 1

- [x] RED: 编写测试文件 ci.test.ts，验证 syncSkills('opencode') 返回 string[]
- [x] GREEN: 实现 packages/orchestrator/src/ci.ts，syncSkills 函数
- [x] REFACTOR: 提取 destMap 为模块常量
- [x] npm run build 通过
- [x] npx vitest run 全部通过
- [ ] 更新追溯（REQUIREMENT AC）

## Non-goals (this change)

<!-- 本变更不做的任务 -->
