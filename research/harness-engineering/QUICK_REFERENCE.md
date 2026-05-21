# Harness 工程初始化技能 - 快速参考

## 🚀 一句话总结

快速初始化前后端分离项目的完整 Harness 文档体系，包括任务清单、进度记录、架构文档等。

---

## ⚡ 快速开始（3 步）

### 步骤 1：运行初始化脚本

```bash
python3 ~/.catpaw/skills/harness-project-init/init.py \
  --project-name frontend \
  --project-type frontend \
  --root-dir ./frontend
```

### 步骤 2：编辑生成的文档

```bash
# 编辑任务清单
vim ./frontend/harness/feature-list.json

# 编辑架构文档
vim ./frontend/harness/ARCHITECTURE.md
```

### 步骤 3：开始编码

```bash
# 每个会话结束时运行
session-handoff --harness ./frontend/harness/
```

---

## 📋 常用命令

### 初始化前端工程

```bash
python3 ~/.catpaw/skills/harness-project-init/init.py \
  --project-name frontend \
  --project-type frontend \
  --root-dir ./frontend \
  --tech-stack "React 18 + TypeScript"
```

### 初始化后端工程

```bash
python3 ~/.catpaw/skills/harness-project-init/init.py \
  --project-name backend \
  --project-type backend \
  --root-dir ./backend \
  --tech-stack "Node.js + Express"
```

### 初始化全栈项目

```bash
python3 ~/.catpaw/skills/harness-project-init/init.py \
  --project-name my-app \
  --project-type fullstack \
  --root-dir .
```

---

## 📂 生成的文件清单

| 文件 | 用途 |
|------|------|
| `feature-list.json` | 任务清单（JSON） |
| `progress.txt` | 进度记录（纯文本） |
| `ARCHITECTURE.md` | 架构文档（Markdown） |
| `docs/caveats.md` | 踩坑档案 |
| `docs/tech-debt.md` | 技术债清单 |
| `docs/CHANGELOG.md` | 变更日志 |
| `memory/MEMORY.md` | 长期记忆 |
| `.sync-state.json` | 同步检查点 |
| `.gitignore` | Git 忽略规则 |

---

## 🎯 参数速查

### 必需参数

```
--project-name    项目名称（e.g., frontend）
--project-type    项目类型（frontend / backend / fullstack）
--root-dir        项目根目录（e.g., ./frontend）
```

### 可选参数

```
--tech-stack           技术栈描述（e.g., "React 18 + TypeScript"）
--include-examples     是否包含示例任务（默认：true）
```

---

## 💡 最佳实践速查

### 防止文档污染

在 `code-repo/.gitignore` 中添加：
```gitignore
../harness/
../.sync-state.json
```

### 多工程协作

```
A/
├── .agents/（全局文档）
├── frontend/harness/（前端文档）
└── backend/harness/（后端文档）
```

### 定期维护

```
每个会话结束 → session-handoff
每周一次     → harness-watchdog
每月一次     → 知识蒸馏
```

---

## 🔗 相关技能

- `session-handoff` - 会话交接
- `harness-watchdog` - 健康巡检
- `issue-triage` - 缺陷分诊

---

## 📚 参考文档位置

```
/Users/wanghong/Projects/日常临时目录/research/harness-engineering/
├── HARNESS_DOCS_BLUEPRINT.md      # 完整规划
├── MAINTENANCE_RULES.md            # 维护规则
├── AGENTS_TEMPLATE.md              # 模板
├── ARCHITECTURE_TEMPLATE.md        # 模板
├── PROGRESS_TEMPLATE.md            # 模板
├── CAVEATS_TEMPLATE.md             # 模板
├── FEATURE_LIST_TEMPLATE.md        # 模板
├── TECH_DEBT_TEMPLATE.md           # 模板
├── DAILY_LOG_TEMPLATE.md           # 模板
└── SYNC_STATE_TEMPLATE.md          # 模板
```

---

## ❓ 常见问题速查

**Q：harness 文档放在代码仓库中吗？**  
A：不，放在独立目录，通过 .gitignore 排除。

**Q：多工程怎么协作？**  
A：用全局 AGENTS.md 作导航索引。

**Q：现有项目怎么迁移？**  
A：运行脚本 → 填充任务 → 运行 session-handoff。

---

## 🧪 验证安装

```bash
# 检查技能是否安装
ls -la ~/.catpaw/skills/harness-project-init/

# 测试脚本
python3 ~/.catpaw/skills/harness-project-init/init.py --help
```

---

**技能版本**：1.0.0  
**创建时间**：2026-04-20  
**维护者**：Harness Engineering Team
