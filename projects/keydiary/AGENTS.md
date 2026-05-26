# AGENTS.md — 击刻 (KeyDiary)

> 全局路由索引：帮助 AI Agent 快速定位项目上下文

## 项目概述

击刻 (KeyDiary) 是一款隐私优先的 macOS 桌面应用，将键盘使用行为自动转化为精美的「打字视觉日记」。

- **定位**：Spotify Wrapped for your keyboard
- **技术栈**：Tauri 2.0 (Rust) + SvelteKit + TypeScript + D3.js + SQLite
- **目标平台**：macOS（MVP），后续可扩展 Windows/Linux

## 目录导航

```
keydiary/
├── AGENTS.md                 ← 你在这里（全局路由索引）
├── harness/                  # Harness 工程文档体系
│   ├── feature-list.json     # 任务清单（分期 Task 列表）
│   ├── progress.txt          # 进度记录（交接棒格式）
│   ├── ARCHITECTURE.md       # 架构文档
│   ├── docs/
│   │   ├── caveats.md        # 踩坑档案
│   │   ├── tech-debt.md      # 技术债清单
│   │   └── CHANGELOG.md      # 变更日志
│   └── memory/
│       └── MEMORY.md         # 长期记忆
└── app/                      # 项目代码（Tauri + SvelteKit）
    ├── src/                  # 前端代码（Svelte）
    ├── src-tauri/            # Rust 后端
    │   ├── src/main.rs       # 入口 + Tauri 初始化
    │   └── src/lib.rs        # 核心逻辑
    ├── package.json          # 前端依赖
    └── vite.config.js        # 构建配置
```

## 关键文件速查

| 需要什么 | 去哪找 |
|----------|--------|
| 当前任务和优先级 | `harness/feature-list.json` |
| 上次做到哪里了 | `harness/progress.txt` |
| 系统架构和约束 | `harness/ARCHITECTURE.md` |
| 已知的坑 | `harness/docs/caveats.md` |
| 技术债务 | `harness/docs/tech-debt.md` |
| 变更历史 | `harness/docs/CHANGELOG.md` |
| PRD 原始文档 | `harness/docs/PRD/` |

## 开发命令

```bash
cd app
npm run tauri dev       # 启动开发模式（前端热更新 + Rust 编译）
npm run tauri build     # 生产构建
npm run dev             # 仅启动前端 dev server
```

## 分期开发计划

| Phase | 交付内容 | 状态 |
|-------|----------|------|
| 0 | 项目骨架 + 托盘图标 + SQLite | ✅ 已完成 |
| 1 | 按键采集 + 热力图渲染 | 🔜 待开始 |
| 2 | KPM 曲线 + 今日之最 + 日历 | ⏳ 排队中 |
| 3 | 分享卡片 + 周报 | ⏳ 排队中 |
| 4 | 成就系统 + 多主题 + 设置 | ⏳ 排队中 |

## 维护规则

1. **每个会话结束**：运行 `session-handoff` 更新 progress.txt
2. **每 5 个 Task 完成后**：运行 `doc-sync` 对齐文档
3. **遇到坑**：立即写入 `harness/docs/caveats.md`
4. **产生技术债**：记录到 `harness/docs/tech-debt.md`
