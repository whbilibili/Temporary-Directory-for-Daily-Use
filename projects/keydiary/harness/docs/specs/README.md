# 击刻 (KeyDiary) — 功能规格文档索引

> 本目录包含从 PRD 派生的结构化功能规格（Functional Specifications），供 AI Coding Agent 和开发者直接执行实现。

---

## 文档结构

| 文档 | 阶段 | 核心交付 | 功能条目数 |
|------|------|----------|-----------|
| [00-项目骨架与技术选型.spec.md](./00-项目骨架与技术选型.spec.md) | Phase 0 | Tauri 骨架 + 托盘 + SQLite | 5 条 (FS-0.1 ~ 0.5) |
| [01-按键采集与热力图.spec.md](./01-按键采集与热力图.spec.md) | Phase 1 | 按键采集 + 热力图 + 实时统计 | 8 条 (FS-1.1 ~ 1.8) |
| [02-曲线与统计.spec.md](./02-曲线与统计.spec.md) | Phase 2 | KPM 曲线 + 统计卡片 + 日历导航 | 6 条 (FS-2.1 ~ 2.6) |
| [03-分享卡片与周报.spec.md](./03-分享卡片与周报.spec.md) | Phase 3 | 分享卡片 + 周报 + PNG 导出 | 6 条 (FS-3.1 ~ 3.6) |
| [04-成就主题设置.spec.md](./04-成就主题设置.spec.md) | Phase 4 | 成就系统 + 多主题 + 高级设置 | 10 条 (FS-4.1 ~ 4.10) |

**总计**：35 条功能规格

---

## 依赖关系

```
Phase 0 (骨架)
    |
    v
Phase 1 (采集 + 热力图) <-- 核心验证点
    |
    v
Phase 2 (曲线 + 统计 + 日历)
    |
    +------------------+
    |                  |
    v                  v
Phase 3 (分享卡片)   Phase 4 (成就 + 主题 + 设置)
    |                  |
    +--------+---------+
             |
             v
         正式发布
```

Phase 3 和 Phase 4 互不依赖，可并行开发。

---

## 快速参考：全部 Tauri Commands

### Phase 0

| Command | 用途 |
|---------|------|
| `get_app_status` | 前后端通信验证 |

### Phase 1

| Command | 用途 |
|---------|------|
| `check_accessibility_permission` | 检测权限状态 |
| `open_accessibility_settings` | 跳转系统设置 |
| `get_today_heatmap` | 获取今日热力图数据 |
| `get_today_total` | 获取今日总击键数 |
| `get_collector_status` | 获取采集器状态 |

### Phase 2

| Command | 用途 |
|---------|------|
| `get_kpm_timeline` | 获取 KPM 时间曲线数据 |
| `get_daily_highlights` | 获取今日之最统计 |
| `get_app_distribution` | 获取应用分布数据 |

### Phase 3

| Command | 用途 |
|---------|------|
| `save_card_image` | 保存卡片图片 |
| `copy_image_to_clipboard` | 复制图片到剪贴板 |
| `get_weekly_report` | 获取周报数据 |
| `list_available_weeks` | 列出有数据的周 |

### Phase 4

| Command | 用途 |
|---------|------|
| `get_settings` | 获取全部设置 |
| `update_setting` | 更新单个设置 |
| `get_installed_apps` | 获取已安装应用列表 |
| `export_data` | 导出数据 |

### Tauri Events

| Event | 方向 | 用途 |
|-------|------|------|
| `kpm_update` | Rust -> Frontend | 实时 KPM 推送（每秒） |
| `achievement_unlocked` | Rust -> Frontend | 成就解锁通知 |

---

## 数据库 Schema 总览

| 表名 | 所属 Phase | 用途 |
|------|-----------|------|
| `key_events` | Phase 1 | 按键频率数据（5 分钟桶聚合） |
| `daily_summary` | Phase 1 | 每日汇总 |
| `app_usage` | Phase 2 | 应用维度击键数据 |
| `weekly_reports` | Phase 3 | 周报 JSON 存储 |
| `achievements` | Phase 4 | 成就状态与进度 |
| `settings` | Phase 4 | 用户设置 (KV) |

---

## 与 PRD 的关系

本目录的 spec 文档从 `docs/PRD/` 中的产品需求文档派生而来：

- PRD 定义"做什么"和"为什么"
- Spec 定义"具体怎么做"和"怎么验收"

当 PRD 更新时，应同步更新对应的 spec 文档。

---

*生成时间：2026-05-26*
