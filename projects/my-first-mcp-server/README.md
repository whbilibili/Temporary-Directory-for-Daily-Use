# My First MCP Server

一个练习用的 MCP Server，提供文件扩展名统计功能。

## 提供的工具

**count_files_by_extension** — 统计指定目录下某种扩展名的文件数量。

**list_files_by_extension** — 列出指定目录下某种扩展名的所有文件路径。

## 快速开始

```bash
# 安装依赖
npm install

# 编译
npm run build

# 启动（stdio 模式，通常由 MCP 客户端自动启动）
npm start
```

## 在 CatDesk 中使用

打开 CatDesk 设置 → MCP Servers，添加如下配置：

```json
{
  "mcpServers": {
    "my-first-mcp-server": {
      "command": "node",
      "args": ["/Users/wanghong/Projects/日常临时目录/projects/my-first-mcp-server/dist/index.js"]
    }
  }
}
```

添加后即可在对话中使用，例如询问："我电脑里有多少 .dmg 文件？"

## 项目结构

```
my-first-mcp-server/
├── src/
│   └── index.ts          # Server 源码
├── dist/
│   └── index.js          # 编译产物
├── package.json
├── tsconfig.json
└── README.md
```
