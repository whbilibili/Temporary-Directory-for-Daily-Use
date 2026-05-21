# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 目录性质

这是一个**多项目工作空间**，而非单一代码库。各子目录相互独立，各有自己的技术栈和构建方式。

## 目录结构

| 目录 | 用途 | 特点 |
|------|------|------|
| `inbox/` | 新内容第一落点 | 待整理，建议每周清理 |
| `notes/` | 碎片化笔记 | 命名格式：`YYYY-MM-DD-主题.md` |
| `research/` | 技术调研产出 | 经过整理的深度文档 |
| `projects/` | 小项目 | 每个项目独立子目录 |
| `scripts/` | 工具脚本 | 单文件，用完即走 |
| `experiments/` | 原型验证 | 允许凌乱，允许失败 |

## 项目构建命令

### my-first-mcp-server（MCP Server）
```bash
cd projects/my-first-mcp-server
npm run build      # TypeScript 编译
npm start          # 启动服务
```

### cursor-code-agent-hook（Cursor Hooks）
```bash
cd projects/cursor-code-agent-hook
npm run code-agent:on      # 开启 Code Agent
npm run code-agent:off     # 关闭 Code Agent
npm run code-agent:status  # 查看状态
```

### nl2sql（自然语言转 SQL）
```bash
cd projects/nl2sql
# 使用小美搭档内置 Python
~/Library/Application\ Support/xiaomei-cowork/Python311/python/bin/python3 nl2sql.py
```

## Python 环境

**必须使用小美搭档内置 Python**，禁止使用系统 python/pip：

```bash
# 运行脚本
~/Library/Application\ Support/xiaomei-cowork/Python311/python/bin/python3 script.py

# 安装库
~/Library/Application\ Support/xiaomei-cowork/Python311/python/bin/pip3 install <package> -q
```

内置 Python 已预装常用库：requests, pandas, numpy, openpyxl, PyYAML, python-dotenv, beautifulsoup4, lxml, Pillow, httpx, rich, chardet, openai, anthropic, tiktoken, pypdf, pdfplumber, reportlab, python-docx, python-pptx

## 命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 笔记文件 | `YYYY-MM-DD-主题.md` | `2026-04-17-rag调研.md` |
| 脚本文件 | `动词_对象.py/sh` | `download_qwen.py` |
| 实验目录 | `主题关键词/` | `产研流程技能组合包实验/` |
| 项目目录 | `kebab-case/` | `cursor-code-agent-hook/` |

## 开发环境

- **系统**: macOS (Darwin 25.3.0)
- **Shell**: zsh + Oh My Zsh
- **Node.js**: v25.7.0 (`/opt/homebrew/bin/node`)
- **Git**: 2.50.1

## 工作习惯

1. **新内容** → 先放 `inbox/`，不纠结分类
2. **定期整理** → 清理 `inbox/`，归档到对应目录
3. **验证想法** → 放 `experiments/`，跑通后升级为 `projects/`
4. **整理文档** → 碎片想法先放 `notes/`，整理成文后移到 `research/`
