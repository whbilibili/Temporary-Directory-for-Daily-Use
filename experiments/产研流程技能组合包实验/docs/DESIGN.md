# 产研流程技能组合包实验 — 系统设计

## 目的

验证多个 AI Agent 技能（Skill）能否通过标准化的状态文件（harness）串联成完整的产研流程，覆盖从需求拆解到上线交付的全链路，并找出技能间的上下文传递断点。

## 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    技能编排层（Agent）                    │
│  识别当前阶段 → 路由到对应技能 → 读取/写入 harness 文件  │
└──────────────────────┬──────────────────────────────────┘
                       │ 共享状态文件
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   feature-list.json  issues.json  progress.txt
          │            │            │
          ▼            ▼            ▼
┌─────────────────────────────────────────────────────────┐
│                      执行层（Skills）                     │
│                                                         │
│  需求阶段          设计阶段          开发阶段             │
│  ├ spec-driven     ├ frontend-arch   ├ harness-creator  │
│  └ fullstack-bc    └ backend-arch    └ code-reviewer    │
│                                                         │
│  测试阶段          交付阶段                              │
│  ├ issue-triage    ├ session-handoff                    │
│  └ webapp-testing  └ fsd                                │
└─────────────────────────────────────────────────────────┘
```

> 图例说明：bc = boundary-contract；arch = architect；harness 文件是技能间唯一的状态传递媒介

## 模块详述

### 需求阶段

- **职责**: 将模糊需求转化为结构化的功能清单和前后端边界契约
- **关键技能**: `spec-driven-development`, `fullstack-boundary-contract`
- **输出产物**: `docs/product-specs/` 下的需求文档，`feature-list.json` 初始版本
- **依赖**: 无（起点）

### 设计阶段

- **职责**: 基于需求产出前后端架构蓝图和 harness 三件套
- **关键技能**: `frontend-architect`, `backend-architect`
- **输出产物**: `CLAUDE.md`（更新）、`feature-list.json`（完整版）、`init.sh`
- **依赖**: 需求阶段产物

### 开发阶段

- **职责**: 按 feature-list.json 逐条实现功能，每次只处理一个 in_progress
- **关键技能**: `harness-creator`, `code-reviewer`
- **输出产物**: 代码变更，`progress.txt` 更新
- **依赖**: 设计阶段产物

### 测试阶段

- **职责**: 发现并记录缺陷，推进到 analyzed_and_ready 状态
- **关键技能**: `issue-triage`, `webapp-testing`
- **输出产物**: `issues.json` 条目
- **依赖**: 开发阶段产物

### 交付阶段

- **职责**: 会话交接、上线准备、状态归档
- **关键技能**: `session-handoff`, `fsd`
- **输出产物**: `progress.txt`（归档）、CHANGELOG 条目
- **依赖**: 所有前序阶段

## 数据流

### 主链路

```
需求输入
  → spec-driven → product-specs/PRD.md
  → fullstack-bc → feature-list.json (初始)
  → backend-architect → feature-list.json (完整) + CLAUDE.md
  → Coding Agent → 代码 + progress.txt
  → issue-triage → issues.json
  → session-handoff → progress.txt (归档) + CHANGELOG
```

### 辅助链路

缺陷修复链路：`issues.json[analyzed_and_ready]` → `backend-architect（二次唤醒）` → 排期修复任务 → 回到开发阶段

## 技术选型

| 关注点 | 选择 | 理由 |
|--------|------|------|
| 状态持久化 | JSON 文件（harness） | 跨会话可读，Agent 无需记忆 |
| 文档格式 | Markdown | 人机均可读，版本控制友好 |
| 技能路由 | 关键词触发 | 与现有 Skill 描述机制一致 |
| 实验记录 | 日期前缀 Markdown | 便于时序回溯 |

## 关注点映射（Where to Look）

| 我想了解... | 去看... |
|------------|--------|
| 实验目标和验收标准 | `docs/product-specs/` |
| 技能调用链路图 | `docs/design-docs/` |
| 当前执行计划 | `docs/exec-plans/active/` |
| 已完成的实验记录 | `docs/exec-plans/completed/` |
| 外部技能文档 | `docs/references/` |
| 项目整体地图 | `CLAUDE.md` |

## 决策日志

| 日期 | 决策 | 背景 | 替代方案 |
|------|------|------|---------|
| 2026-04-20 | 使用 harness 文件作为唯一状态传递媒介 | 技能间无法共享上下文记忆 | 通过 prompt 传递状态（不可靠） |
| 2026-04-20 | 实验目录放在 experiments/ 而非 projects/ | 尚不确定能否成功，允许失败 | 直接放 projects/（过于正式） |
