#!/bin/bash

# Harness 文档体系初始化脚本
# 用法：bash harness-init.sh <project_name> <project_type>
# 示例：bash harness-init.sh frontend frontend
#      bash harness-init.sh backend backend

set -e

PROJECT_NAME=${1:-"frontend"}
PROJECT_TYPE=${2:-"frontend"}
HARNESS_DIR="${PROJECT_NAME}/harness"
DOCS_DIR="${HARNESS_DIR}/docs"
MEMORY_DIR="${HARNESS_DIR}/memory"

echo "🚀 初始化 Harness 文档体系..."
echo "项目名称: $PROJECT_NAME"
echo "项目类型: $PROJECT_TYPE"
echo ""

# 创建目录结构
echo "📁 创建目录结构..."
mkdir -p "$DOCS_DIR"
mkdir -p "$MEMORY_DIR"

# 创建 feature-list.json
echo "📝 创建 feature-list.json..."
cat > "${HARNESS_DIR}/feature-list.json" << 'EOF'
{
  "version": "1.0",
  "project": "PROJECT_NAME",
  "project_type": "PROJECT_TYPE",
  "created_at": "CREATED_AT",
  "tasks": [
    {
      "id": "TASK-001",
      "title": "项目初始化",
      "description": "搭建项目基础框架",
      "status": "pending",
      "priority": "P0",
      "assignee": "coding-agent",
      "created_at": "CREATED_AT",
      "updated_at": "CREATED_AT",
      "acceptance_criteria": [
        "项目结构完整",
        "依赖安装成功",
        "开发环境可用"
      ],
      "branch": "feature/init",
      "related_docs": [
        "ARCHITECTURE.md#项目结构"
      ]
    }
  ]
}
EOF

# 替换占位符
sed -i '' "s/PROJECT_NAME/$PROJECT_NAME/g" "${HARNESS_DIR}/feature-list.json"
sed -i '' "s/PROJECT_TYPE/$PROJECT_TYPE/g" "${HARNESS_DIR}/feature-list.json"
sed -i '' "s/CREATED_AT/$(date -u +%Y-%m-%dT%H:%M:%SZ)/g" "${HARNESS_DIR}/feature-list.json"

# 创建 progress.txt
echo "📝 创建 progress.txt..."
cat > "${HARNESS_DIR}/progress.txt" << EOF
# ${PROJECT_NAME} 工程进度记录

## $(date +%Y-%m-%d)

### 完成
- [ ] 项目初始化

### 进行中
- [ ] 待定

### 遇到的问题
- 无

### 下一步
- 待定

---
EOF

# 创建 ARCHITECTURE.md
echo "📝 创建 ARCHITECTURE.md..."
cat > "${HARNESS_DIR}/ARCHITECTURE.md" << EOF
# ${PROJECT_NAME} 架构文档

## 项目概述

项目类型：${PROJECT_TYPE}
创建时间：$(date +%Y-%m-%d)

## 模块划分

### 核心模块
- 职责：待定
- 关键文件：src/
- 依赖：待定

## 关键设计决策

### 1. 技术栈选择
- 决策时间：$(date +%Y-%m-%d)
- 原因：待定
- 权衡：待定

## 架构约束

### 禁止
- ❌ 待定

### 推荐
- ✅ 待定

## 技术栈

- 待定

---

**最后更新**：$(date +%Y-%m-%d)
**维护者**：Coding Agent
EOF

# 创建 docs/caveats.md
echo "📝 创建 docs/caveats.md..."
cat > "${DOCS_DIR}/caveats.md" << EOF
# 踩坑档案

> 记录开发过程中遇到的问题、解决方案和经验教训

## 模板

### 问题标题

#### 问题描述
简要描述问题

#### 复现步骤
1. 步骤 1
2. 步骤 2

#### 根本原因
分析根本原因

#### 解决方案
提供解决方案

#### 状态
✅ 已解决 / ⏳ 待解决 / 🔄 进行中

---

**最后更新**：$(date +%Y-%m-%d)
**维护者**：Coding Agent
EOF

# 创建 docs/tech-debt.md
echo "📝 创建 docs/tech-debt.md..."
cat > "${DOCS_DIR}/tech-debt.md" << EOF
# 技术债清单

> 记录需要后续改进的技术问题

## 优先级说明

- **P0**：阻塞上线，必须立即处理
- **P1**：影响稳定性，应该尽快处理
- **P2**：影响体验，可以排期处理
- **P3**：优化建议，可以延后处理

## 技术债列表

| ID | 描述 | 优先级 | 预计工作量 | 状态 |
|----|------|--------|-----------|------|
| TD-001 | 待定 | P2 | 待定 | pending |

---

**最后更新**：$(date +%Y-%m-%d)
**维护者**：Coding Agent
EOF

# 创建 docs/CHANGELOG.md
echo "📝 创建 docs/CHANGELOG.md..."
cat > "${DOCS_DIR}/CHANGELOG.md" << EOF
# 变更日志

> 记录每个版本的功能、bug 修复和已知问题

## [Unreleased]

### Added
- 待定

### Fixed
- 待定

### Changed
- 待定

### Known Issues
- 待定

---

**最后更新**：$(date +%Y-%m-%d)
**维护者**：Coding Agent
EOF

# 创建 .sync-state.json
echo "📝 创建 .sync-state.json..."
cat > "${PROJECT_NAME}/.sync-state.json" << EOF
{
  "last_sync": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "harness_version": "1.0",
  "code_commit": "initial",
  "status": "in_sync",
  "warnings": []
}
EOF

# 创建 memory/MEMORY.md
echo "📝 创建 memory/MEMORY.md..."
cat > "${MEMORY_DIR}/MEMORY.md" << EOF
# 长期记忆

> 蒸馏自每日工作日志的高价值条目

## 架构决策

### 待定

---

**最后更新**：$(date +%Y-%m-%d)
**维护者**：Coding Agent
EOF

# 创建 .gitignore（防止 harness 文档进入公共仓库）
echo "📝 创建 .gitignore..."
if [ -d "${PROJECT_NAME}/code-repo" ]; then
  cat >> "${PROJECT_NAME}/code-repo/.gitignore" << EOF

# Harness 文档（本地分支开发，不入公共仓库）
../harness/
../.sync-state.json
EOF
fi

echo ""
echo "✅ Harness 文档体系初始化完成！"
echo ""
echo "📂 目录结构："
tree -L 3 "$PROJECT_NAME" 2>/dev/null || find "$PROJECT_NAME" -type f | head -20
echo ""
echo "📋 下一步："
echo "1. 编辑 ${HARNESS_DIR}/feature-list.json，添加实际任务"
echo "2. 编辑 ${HARNESS_DIR}/ARCHITECTURE.md，描述项目架构"
echo "3. 开始编码，每个会话结束时运行 session-handoff"
echo ""
