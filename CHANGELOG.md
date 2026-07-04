# Changelog

<!-- taiyi:core-pipeline --> 2026-07-04

# CHANGELOG: Core pipeline 包增强 — 函数桩到完整实现

## Changed

- prototyper: incident() 添加 schema 校验 + PrototyperError
- builder: refract() 添加 try/catch 异常包装 + refract.map 工具 + RefractError
- sweeper: disperse() 支持异步 target + 失败隔离，返回 Promise
- grower: absorb() 添加 absorb.unique + absorb.reduce
- maintainer: emit() 返回 Promise，支持 async sink + EmitError

## Rollback

- git revert packages/prototyper packages/builder packages/sweeper
  packages/grower packages/maintainer
