# Harness 工程初始化技能 - 完整总结

## 📦 技能信息

| 项目 | 内容 |
|------|------|
| **技能名称** | harness-project-init |
| **技能路径** | `~/.catpaw/skills/harness-project-init/` |
| **版本** | 1.0.0 |
| **创建时间** | 2026-04-20 |
| **维护者** | Harness Engineering Team |

---

## 🎯 功能概述

这个技能帮助你快速初始化一个 Harness 工程项目，包括：

- ✅ **全局文档体系**（AGENTS.md、API-CONTRACT.md 等）
- ✅ **工程级文档**（feature-list.json、progress.txt、ARCHITECTURE.md 等）
- ✅ **会话文档**（每日日志、长期记忆）
- ✅ **同步检查点**（防止文档-代码脱节）
- ✅ **维护规则和检查清单**

---

## 📂 技能文件结构

```
~/.catpaw/skills/harness-project-init/
├── SKILL.md              # 技能定义和文档
├── init.py               # Python 初始化脚本（推荐）
├── init.sh               # Bash 初始化脚本
└── README.md             # 使用说明
```

---

## 🚀 使用方式

### 方式 1：Python 脚本（推荐）

```bash
python3 ~/.catpaw/skills/harness-project-init/init.py \
  --project-name frontend \
  --project-type frontend \
  --root-dir ./frontend \
  --tech-stack "React 18 + TypeScript"
```

### 方式 2：Bash 脚本

```bash
bash ~/.catpaw/skills/harness-project-init/init.sh \
  frontend frontend ./frontend "React 18 + TypeScript" true
```

### 方式 3：在 CatDesk 中使用

在 CatDesk 中输入以下任何一个短语：
- "初始化 harness"
- "搭建 harness"
- "harness 项目初始化"
- "创建 harness 工程"
- "harness 脚手架"
- "harness 骨架"

---

## 📋 参数说明

### 必需参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `--project-name` | string | 项目名称 | frontend |
| `--project-type` | enum | 项目类型 | frontend / backend / fullstack |
| `--root-dir` | string | 项目根目录 | ./frontend |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--tech-stack` | string | "" | 技术栈描述 |
| `--include-examples` | boolean | true | 是否包含示例任务 |

---

## 📂 生成的文档结构

### 工程级文档（B/harness/）

```
harness/
├── feature-list.json         # 任务清单（JSON 格式）
├── progress.txt              # 进度记录（纯文本）
├── ARCHITECTURE.md           # 架构文档（Markdown）
├── docs/
│   ├── caveats.md            # 踩坑档案
│   ├── tech-debt.md          # 技术债清单
│   └── CHANGELOG.md          # 变更日志
├── memory/
│   └── MEMORY.md             # 长期记忆
└── .gitignore                # Git 忽略规则
```

### 同步检查点

```
.sync-state.json             # 同步检查点（JSON 格式）
```

---

## 📊 生成的文档内容

### 1. feature-list.json

结构化的任务清单，包含：
- 任务 ID、标题、描述
- 状态（pending / in_progress / completed）
- 优先级（P0 / P1 / P2 / P3）
- 预计工作时间和实际工作时间
- 验收标准
- 依赖关系和阻塞因素

**示例**：
```json
{
  "version": "1.0",
  "project": "frontend",
  "project_type": "frontend",
  "tasks": [
    {
      "id": "TASK-001",
      "title": "项目初始化",
      "status": "pending",
      "priority": "P0",
      "estimated_hours": 2,
      "acceptance_criteria": [
        "项目结构完整",
        "依赖安装成功"
      ]
    }
  ]
}
```

### 2. progress.txt

简洁的进度记录，包含：
- 每日完成的任务
- 进行中的任务
- 遇到的问题
- 下一步计划
- 统计数据（代码行数、提交次数、测试覆盖率）

### 3. ARCHITECTURE.md

架构文档，包含：
- 项目概述和技术栈
- 模块划分
- 关键设计决策
- 架构约束（禁止项和推荐项）
- 性能和安全考虑

### 4. docs/caveats.md

踩坑档案，记录：
- 问题描述和现象
- 复现步骤
- 根本原因分析
- 解决方案
- 问题状态

### 5. docs/tech-debt.md

技术债清单，包含：
- 技术债描述
- 优先级（P0 / P1 / P2 / P3）
- 预计工作量
- 相关任务和文档

### 6. docs/CHANGELOG.md

变更日志，记录：
- 每个版本的功能
- Bug 修复
- 已知问题

### 7. memory/MEMORY.md

长期记忆，蒸馏自每日日志的高价值条目：
- 架构决策
- 最佳实践
- 常见问题

### 8. .sync-state.json

同步检查点，记录：
- 最后同步时间
- Harness 文档版本
- 代码最新提交
- 同步检查结果
- 工程统计数据
- 警告信息

---

## 💡 使用示例

### 示例 1：初始化前端工程

```bash
python3 ~/.catpaw/skills/harness-project-init/init.py \
  --project-name frontend \
  --project-type frontend \
  --root-dir ./frontend \
  --tech-stack "React 18 + TypeScript + Redux"
```

**输出**：
```
✅ Harness 文档体系初始化完成！

📂 目录结构：
  frontend/
  ├── harness/
  │   ├── feature-list.json
  │   ├── progress.txt
  │   ├── ARCHITECTURE.md
  │   ├── docs/
  │   │   ├── caveats.md
  │   │   ├── tech-debt.md
  │   │   └── CHANGELOG.md
  │   ├── memory/
  │   │   └── MEMORY.md
  │   └── .gitignore
  └── .sync-state.json

📋 下一步：
  1. 编辑 frontend/harness/feature-list.json，添加实际任务
  2. 编辑 frontend/harness/ARCHITECTURE.md，描述项目架构
  3. 开始编码，每个会话结束时运行 session-handoff
```

### 示例 2：初始化后端工程

```bash
python3 ~/.catpaw/skills/harness-project-init/init.py \
  --project-name backend \
  --project-type backend \
  --root-dir ./backend \
  --tech-stack "Node.js + Express + PostgreSQL"
```

### 示例 3：初始化全栈项目

```bash
python3 ~/.catpaw/skills/harness-project-init/init.py \
  --project-name my-app \
  --project-type fullstack \
  --root-dir .
```

---

## 🏗️ 最佳实践

### 1. 项目初始化顺序

```
1. 创建项目根目录
2. 运行 harness-project-init 初始化文档体系
3. 创建代码仓库（git init）
4. 配置 .gitignore（防止 harness 文档进入公共仓库）
5. 开始编码
```

### 2. 多工程协作结构

```
A/（项目根目录）
├── .agents/（全局 harness 文档）
│   ├── AGENTS.md
│   ├── PLANS.md
│   └── docs/
│       ├── API-CONTRACT.md
│       ├── DEPLOYMENT.md
│       └── SECURITY.md
├── frontend/（前端工程）
│   ├── harness/（前端 harness 文档）
│   └── code-repo/（前端代码仓库）
└── backend/（后端工程）
    ├── harness/（后端 harness 文档）
    └── code-repo/（后端代码仓库）
```

### 3. 防止文档污染

在 `code-repo/.gitignore` 中添加：
```gitignore
../harness/
../.sync-state.json
```

### 4. 定期维护

- **每个会话结束**：运行 `session-handoff`
- **每周一次**：运行 `harness-watchdog` 进行健康巡检
- **每月一次**：执行知识蒸馏（memory/YYYY-MM-DD.md → memory/MEMORY.md）

---

## 🔗 相关技能

| 技能 | 用途 |
|------|------|
| `session-handoff` | 会话结束时的交接棒 |
| `harness-watchdog` | 定期健康巡检 |
| `issue-triage` | 缺陷分诊 |

---

## 📚 参考文档

所有参考文档都保存在 `/Users/wanghong/Projects/日常临时目录/research/harness-engineering/` 目录下：

| 文档 | 说明 |
|------|------|
| `HARNESS_DOCS_BLUEPRINT.md` | 完整的文档体系规划 |
| `MAINTENANCE_RULES.md` | 维护规则和检查清单 |
| `AGENTS_TEMPLATE.md` | AGENTS.md 模板 |
| `ARCHITECTURE_TEMPLATE.md` | ARCHITECTURE.md 模板 |
| `PROGRESS_TEMPLATE.md` | progress.txt 模板 |
| `CAVEATS_TEMPLATE.md` | docs/caveats.md 模板 |
| `FEATURE_LIST_TEMPLATE.md` | feature-list.json 模板 |
| `TECH_DEBT_TEMPLATE.md` | docs/tech-debt.md 模板 |
| `DAILY_LOG_TEMPLATE.md` | memory/YYYY-MM-DD.md 模板 |
| `SYNC_STATE_TEMPLATE.md` | .sync-state.json 模板 |

---

## ❓ 常见问题

### Q1：harness 文档应该放在代码仓库中吗？

**A**：不应该。harness 文档是本地分支开发的工作记录，不应该进入公共仓库。建议：
- 将 harness 文档放在项目根目录下的独立目录
- 在代码仓库的 .gitignore 中排除 harness 文档
- 使用 .sync-state.json 防止文档-代码脱节

### Q2：如何处理多个工程的协作？

**A**：使用全局 AGENTS.md 作为导航索引：
- 全局 AGENTS.md 指向所有工程的 harness 文档
- 每个工程有独立的 feature-list.json 和 progress.txt
- 通过 API-CONTRACT.md 定义前后端接口

### Q3：如何迁移现有项目到 harness？

**A**：
1. 运行 `harness-project-init` 生成文档体系
2. 手动填充 feature-list.json（根据现有代码）
3. 更新 progress.txt（记录已完成的工作）
4. 运行 `session-handoff` 生成同步检查点

### Q4：如何自定义生成的文档？

**A**：
1. 运行 `harness-project-init` 生成初始文档
2. 手动编辑各个文档文件
3. 根据项目需求调整内容

---

## 🧪 测试验证

技能已通过以下测试：

✅ **Python 脚本测试**
```bash
python3 init.py \
  --project-name test-frontend \
  --project-type frontend \
  --root-dir ./test-frontend \
  --tech-stack "React 18 + TypeScript"
```

**结果**：
- ✅ 所有目录创建成功
- ✅ 所有文档文件生成成功
- ✅ JSON 文件格式正确
- ✅ Markdown 文件内容完整
- ✅ 同步检查点生成成功

---

## 📝 更新日志

### v1.0.0 (2026-04-20)

- ✅ 初始版本发布
- ✅ 支持前端、后端、全栈项目初始化
- ✅ 提供 Python 和 Bash 两种脚本
- ✅ 生成完整的 Harness 文档体系
- ✅ 包含同步检查点和维护规则

---

## 📞 支持

如有问题或建议，请联系：
- **维护者**：Harness Engineering Team
- **创建时间**：2026-04-20
- **版本**：1.0.0

---

**祝你使用愉快！** 🎉
