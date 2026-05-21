# 项目概述（示例）

本文件由「架构师」角色维护，用于在新会话中快速恢复上下文。**Code Agent 模式**会在每次新开会话时自动把本文件与 `.cursor/code-agent.md` 注入到对话上下文中（需先在配置中开启）。

## 仓库目的

演示 Cursor `sessionStart` Hook + 可开关的 Code Agent 自动加载。

## 目录结构（摘要）

| 路径 | 说明 |
|------|------|
| `.cursor/hooks.json` | 注册 `sessionStart` |
| `.cursor/hooks/session-start.mjs` | 读取配置并注入 `additional_context` |
| `.cursor/code-agent.md` | Code Agent 系统提示词 |
| `.cursor/code-agent-config.json` | **开关**：`enabled` true/false |
| `Agent.md` | 本文件：架构/进度/约定 |

## 功能清单（示例）

- [x] Hook 在会话开始时执行
- [x] 可通过配置关闭自动注入
- [ ] 按你真实项目替换本清单与进度表

## 进度表（示例）

| 阶段 | 状态 | 备注 |
|------|------|------|
| 脚手架 | 完成 | 当前目录即示例项目 |
| 接入真实业务 | 未开始 | 复制结构到你的仓库即可 |

## 环境初始化（示例）

```bash
# 安装依赖（若你在此项目中使用 Node 脚本切换开关）
npm install   # 可选：仅 package.json 里的 scripts 需要 node，一般已有全局 node 即可
```

开启自动加载：

```bash
npm run code-agent:on
```

关闭：

```bash
npm run code-agent:off
```
