# CHANGE: CI/CD pipeline — GitHub Actions

## Motivation
项目无 CI，PR 无自动检查。需要在 push/PR 时自动跑 build、test、lint。

## Scope
- In: .github/workflows/ci.yml — test/lint/build on push & PR
- Out: 发布流水线、部署

## Success Criteria
- [x] CI workflow 文件存在
- [x] 含 build、test、lint 三步
