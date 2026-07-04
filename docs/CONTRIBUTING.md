# 贡献指南

## 环境要求

- Node.js >= 18
- npm >= 9

## 快速开始

```bash
# 克隆仓库
git clone <repo-url>
cd prism-five

# 安装依赖
npm install

# 构建所有包
npm run build

# 类型检查
npm run typecheck
```

## 如何添加新包

```bash
mkdir -p packages/my-optics/src
```

创建 `packages/my-optics/package.json`：

```json
{
  "name": "@prism-five/my-optics",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  }
}
```

创建 `packages/my-optics/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

## 代码风格

- 使用 TypeScript strict mode
- 类型优先于接口（除非需要扩展）
- 函数优先于类
- 纯函数优先于有副作用函数
- 无 `any`，无 `@ts-ignore`
