#!/bin/bash
#
# sync-skills.sh
# 将 ~/.catpaw/commands 和 ~/.catpaw/skills 同步到 ~/.skills-manager/my-skills，
# 然后 git commit & push 到远程仓库。
#
# 用法：
#   bash ~/Projects/日常临时目录/sync-skills.sh
#   或加入 crontab 定期执行
#

set -euo pipefail

# ── 配置 ──────────────────────────────────────────────
SRC_COMMANDS="$HOME/.catpaw/commands"
SRC_SKILLS="$HOME/.catpaw/skills"
REPO_DIR="$HOME/.skills-manager"
DEST_DIR="$REPO_DIR/my-skills"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# ── 前置检查 ──────────────────────────────────────────
if [ ! -d "$REPO_DIR/.git" ]; then
    echo "❌ 错误：$REPO_DIR 不是一个 git 仓库"
    exit 1
fi

# ── 同步文件 ──────────────────────────────────────────
echo "🔄 开始同步 ($TIMESTAMP)"

# 确保目标子目录存在
mkdir -p "$DEST_DIR/commands"
mkdir -p "$DEST_DIR/skills"

# 使用 rsync 增量同步，删除目标中已不存在的文件
# --exclude .DS_Store 避免同步系统文件
echo "  📂 同步 commands ..."
rsync -av --delete --exclude '.DS_Store' "$SRC_COMMANDS/" "$DEST_DIR/commands/"

echo "  📂 同步 skills ..."
rsync -av --delete --exclude '.DS_Store' "$SRC_SKILLS/" "$DEST_DIR/skills/"

# ── Git 提交并推送 ────────────────────────────────────
cd "$REPO_DIR"

# 添加 my-skills 目录下的所有变更
git add my-skills/

# 检查是否有实际变更需要提交
if git diff --cached --quiet; then
    echo "✅ 没有变更，无需提交"
    exit 0
fi

# 统计变更
CHANGED_FILES=$(git diff --cached --numstat | wc -l | tr -d ' ')
echo "  📝 检测到 $CHANGED_FILES 个文件变更"

git commit -m "sync: 同步 commands & skills ($TIMESTAMP)

自动同步来源：
- $SRC_COMMANDS
- $SRC_SKILLS"

echo "  🚀 推送到远程 ..."
git push origin

echo "✅ 同步完成！"
