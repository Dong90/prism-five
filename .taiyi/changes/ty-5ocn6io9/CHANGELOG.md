# CHANGELOG: 性能基准测试

## Added
- packages/benchmarks: vitest bench 套件 (7 个基准)
- script: `npm run bench`

## Changed
- package.json: 添加 bench script
- tsconfig.json: 添加 packages/benchmarks 引用

## Verification
- [x] `npm run build` passes
- [x] `npm test` passes (42 tests)
- [x] `npm run bench` runs (7 benchmarks)
