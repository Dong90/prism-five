# CHANGE: Rename to Pentad
## Motivation
当前 prism-five + 五行包名不直观。改为 pentad（五重奏）+ 角色名。
## Scope
In:
- 根 package.json: name → pentad
- 5 包重命名: incidence→prototyper, refraction→builder, dispersion→sweeper, absorption→grower, emission→maintainer
- 包名: @pentad/prototyper 等
- .prism-five/ → .pentad/
- 所有引用更新

Out: 功能逻辑不变
## Success Criteria
- [ ] 5 个包重命名完成
- [ ] 所有 import 更新
- [ ] .pentad/ 目录生效
- [ ] npm run build 全项目通过
