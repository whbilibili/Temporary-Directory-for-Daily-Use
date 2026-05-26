# ARCHITECTURE.md — 击刻 (KeyDiary)

> 系统架构文档：描述技术选型、模块边界、数据流和约束规则

## 1. 系统全景

```
┌──────────────────────────────────────────────────────┐
│                  macOS System Layer                   │
│   CGEventTap ──→ 按键事件流                           │
│   NSWorkspace ──→ 前台应用切换事件                     │
└──────────────┬───────────────────────────────────────┘
               │ raw key events
               ▼
┌──────────────────────────────────────────────────────┐
│              Rust Backend (src-tauri/)                │
│                                                      │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────┐ │
│  │  Collector   │──→│  Aggregator  │──→│  SQLite   │ │
│  │ (CGEventTap) │   │ (60s batch)  │   │  (rusqlite)│ │
│  └─────────────┘   └─────────────┘   └───────────┘ │
│                                              │       │
│  ┌─────────────────────────────────┐         │       │
│  │     Tauri Commands (IPC)        │←────────┘       │
│  │  get_today_heatmap()            │                 │
│  │  get_kpm_timeline()             │                 │
│  │  get_daily_stats()              │                 │
│  │  export_data()                  │                 │
│  └────────────┬────────────────────┘                 │
└───────────────┼──────────────────────────────────────┘
                │ JSON via IPC
                ▼
┌──────────────────────────────────────────────────────┐
│            Web Frontend (src/)                        │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Heatmap  │  │ Timeline │  │  Share Card Gen  │   │
│  │(D3+Canvas)│  │(D3 line) │  │ (OffscreenCanvas)│   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Calendar │  │ Achievem │  │   Settings       │   │
│  │  (Svelte)│  │  (Svelte)│  │   (Svelte)       │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## 2. 技术栈

| 层级 | 选型 | 版本 | 理由 |
|------|------|------|------|
| 桌面框架 | Tauri | 2.0+ | 轻量（<10MB）、Rust 安全性、原生系统能力 |
| 前端框架 | SvelteKit | 5.x | 编译时响应式、零运行时、路由能力 |
| 语言（前端） | TypeScript | 5.x | 类型安全 |
| 可视化 | D3.js + Canvas 2D | 7.x | 热力图/折线图标准选择 |
| 数据库 | SQLite via rusqlite | - | 单文件、嵌入式、零配置 |
| 按键监听 | CGEventTap | macOS native | 系统级、低延迟、无第三方依赖 |
| 构建工具 | Vite | 6.x | 快速 HMR、Tauri 官方集成 |

## 3. 模块边界

### 3.1 Rust 模块划分

```
src-tauri/src/
├── main.rs          # 入口：Tauri Builder 配置
├── lib.rs           # 模块注册
├── collector.rs     # 按键采集：CGEventTap 监听 + 原始事件收集
├── aggregator.rs    # 聚合器：内存中攒批 → 定时写入 DB
├── db.rs            # 数据层：SQLite 建表/CRUD/查询
├── tray.rs          # 托盘：图标 + 菜单 + 状态切换
└── commands.rs      # IPC 命令：暴露给前端的所有接口
```

**模块间通信规则**：
- `collector` → `aggregator`：通过 channel (mpsc) 传递原始事件
- `aggregator` → `db`：定时（60s）批量写入
- `commands` → `db`：只读查询，返回 JSON

### 3.2 前端路由划分

```
src/routes/
├── +layout.svelte      # 全局布局（导航栏 + 主题）
├── +page.svelte        # 首页 = 今日日记
├── history/
│   └── +page.svelte    # 日历 + 历史日记
├── share/
│   └── +page.svelte    # 分享卡片生成
├── achievements/
│   └── +page.svelte    # 成就系统
└── settings/
    └── +page.svelte    # 设置面板
```

## 4. 数据模型

### 4.1 SQLite Schema

```sql
-- 按键频次（按小时聚合）
CREATE TABLE key_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_code INTEGER NOT NULL,       -- 物理键码
    key_label TEXT NOT NULL,          -- 显示名称 (e.g., "A", "Space")
    count INTEGER NOT NULL DEFAULT 1, -- 该小时内按下次数
    hour_bucket TEXT NOT NULL,        -- "2026-05-25T14" 格式
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- KPM 快照（每分钟一条）
CREATE TABLE kpm_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    kpm INTEGER NOT NULL,            -- 当分钟按键数
    app_name TEXT                    -- 当时前台应用
);

-- 成就记录
CREATE TABLE achievements (
    id TEXT PRIMARY KEY,             -- 成就标识
    unlocked_at TEXT,                -- 解锁时间
    progress INTEGER DEFAULT 0       -- 进度值
);

-- 索引
CREATE INDEX idx_key_events_hour ON key_events(hour_bucket);
CREATE INDEX idx_kpm_timestamp ON kpm_snapshots(timestamp);
```

### 4.2 IPC 数据格式（Tauri Command 返回值）

```typescript
// 热力图数据
interface HeatmapData {
  key_code: number;
  key_label: string;
  count: number;
  intensity: number; // 0.0 ~ 1.0 归一化
}

// KPM 时间线
interface KpmPoint {
  timestamp: string; // ISO 8601
  kpm: number;
  app_name?: string;
}

// 每日统计摘要
interface DailySummary {
  date: string;
  total_keystrokes: number;
  peak_kpm: number;
  peak_hour: number;
  top_keys: { label: string; count: number }[];
  active_minutes: number;
}
```

## 5. 架构约束（不可违反）

1. **隐私红线**：永远不记录按键序列（击键内容），只记录单键频次聚合
2. **零网络**：应用不发起任何网络请求，所有数据本地存储
3. **性能预算**：CPU < 0.5%，内存 < 30MB，包体积 < 10MB
4. **数据可见**：SQLite 文件用户可直接访问/备份/删除
5. **渐进增强**：每个 Phase 独立可用，不依赖后续 Phase 的功能
6. **单向数据流**：Collector → Aggregator → DB → Commands → Frontend

## 6. 关键技术决策记录

| 日期 | 决策 | 理由 | 替代方案 |
|------|------|------|----------|
| 2026-05-25 | Tauri 2.0 而非 Electron | 包体积 10MB vs 100MB+，Rust 适合系统级操作 | Electron |
| 2026-05-25 | SvelteKit 而非纯 Svelte | 模板生成为 SvelteKit，自带路由能力，对多页面有利 | Svelte + Vite |
| 2026-05-25 | SQLite 而非 JSON 文件 | 查询能力强，数据量大时不退化 | JSON flat file |
| 2026-05-25 | 60s 批量写入而非实时写入 | 减少磁盘 IO，降低 CPU 占用 | 每次按键即写 |
| 2026-05-25 | Canvas 2D 而非 SVG/WebGL | 性能够用且简单，MVP 不需要 WebGL | SVG (慢), WebGL (复杂) |
