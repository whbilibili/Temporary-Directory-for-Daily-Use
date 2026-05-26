# 长期记忆 — 击刻 (KeyDiary)

> 跨会话持久化的关键信息，帮助新 Session 快速获取项目上下文

## 项目定位

- 击刻 = "Spotify Wrapped for your keyboard"
- 隐私优先的桌面应用，将键盘使用行为转化为视觉日记
- 目标用户：程序员、作家、重度键盘使用者
- 竞品差异点：不做冷冰冰的统计，做有温度的视觉故事

## 技术选型理由

- Tauri 2.0：轻量（<10MB）、Rust 安全、原生系统能力
- SvelteKit：编译时响应式、零运行时开销、自带路由
- SQLite：单文件、嵌入式、用户可见可备份
- D3.js + Canvas：热力图渲染性能最优解
- CGEventTap：macOS 唯一可靠的全局按键监听方案

## 不可违反的原则

1. 不记录按键序列（内容），只记录单键频次
2. 不联网，零网络请求
3. CPU < 0.5%，内存 < 30MB
4. 用户数据永远可见、可备份、可删除

## 项目结构约定

- `keydiary/app/` = 代码仓库（Tauri + SvelteKit）
- `keydiary/harness/` = 工程文档（不进代码仓库）
- `keydiary/AGENTS.md` = 全局路由索引

## 开发里程碑

- Phase 0: 骨架（✅ 已完成项目初始化）
- Phase 1: 采集 + 热力图（核心验证点）
- Phase 2: 曲线 + 统计
- Phase 3: 分享卡片（可与 Phase 4 并行）
- Phase 4: 成就 + 主题（可与 Phase 3 并行）
