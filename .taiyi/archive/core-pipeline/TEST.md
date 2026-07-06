# TEST: Core pipeline 包增强 — 函数桩到完整实现

## 五轮声明
- 功能: ✅ 当前 change 覆盖
- 性能: ⏭ 核心包为同步/轻量操作，无需性能测试
- 安全: ⏭ 无用户输入、无 I/O 操作
- 兼容: ✅ build 通过，类型兼容
- 可观测: ⏭ 无日志/监控改动

## Plan
| Level | Scope | Command |
|-------|-------|---------|
| unit | 5 核心包手动验证 | node -e "require('./packages/prototyper')" |
| build | 全项目 | npm run build |
| type | 类型检查 | npm run typecheck |

## Coverage
| AC | 证据 |
|----|-------|
| US-1 AC1 | node -e "const {incident}=require('./packages/prototyper/dist');console.log(incident({type:'a',payload:{}}))" |
| US-1 AC2 | node -e "try{const{incident}=require('./packages/prototyper/dist');incident({type:123})}catch(e){console.log(e.name)}" |
| US-2 AC1 | node -e "const{refract}=require('./packages/builder/dist');console.log(refract(1,x=>x*2))" |
| US-3 AC1 | node -e "const{disperse}=require('./packages/sweeper/dist');disperse({a:1},['x','y']).then(r=>console.log(r.length))" |
| US-4 AC1 | node -e "const{absorb}=require('./packages/grower/dist');console.log(absorb([['a',1],['b',2]]).sources.length)" |
| US-5 AC1 | node -e "const{emit}=require('./packages/maintainer/dist');emit('hi',console.log)" |

## Results
- [x] npm run build — exit 0
- [x] npm run typecheck — exit 0
- [x] 各包导出验证 — 通过
