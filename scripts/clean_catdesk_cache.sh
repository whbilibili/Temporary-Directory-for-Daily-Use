#!/bin/bash
# CatDesk 缓存清理脚本
# 用途：清理 CatDesk 累积的浏览器缓存、Code Cache、应用缓存
# 注意：运行前必须先退出 CatDesk（Cmd+Q），否则可能导致崩溃
# 建议：每 1-2 个月执行一次

set -e

APP_DATA="$HOME/Library/Application Support/catpaw-desk"
BROWSER_PARTITION="$APP_DATA/Partitions/catpaw-browser-view"

# 检查 CatDesk 是否在运行
if pgrep -f "CatDesk" > /dev/null 2>&1; then
    echo "⚠️  CatDesk 正在运行，请先退出（Cmd+Q）再执行此脚本"
    exit 1
fi

echo "🧹 开始清理 CatDesk 缓存..."
echo ""

# 统计清理前大小
before=$(du -sh "$APP_DATA" 2>/dev/null | cut -f1)
echo "清理前总占用: $before"
echo ""

# 1. 清理浏览器 Cache
if [ -d "$BROWSER_PARTITION/Cache/Cache_Data" ]; then
    size=$(du -sh "$BROWSER_PARTITION/Cache/Cache_Data" 2>/dev/null | cut -f1)
    find "$BROWSER_PARTITION/Cache/Cache_Data" -type f -delete 2>/dev/null
    echo "✅ 浏览器 Cache 已清理 ($size)"
fi

# 2. 清理 Code Cache
if [ -d "$BROWSER_PARTITION/Code Cache" ]; then
    size=$(du -sh "$BROWSER_PARTITION/Code Cache" 2>/dev/null | cut -f1)
    find "$BROWSER_PARTITION/Code Cache" -type f -delete 2>/dev/null
    echo "✅ Code Cache 已清理 ($size)"
fi

# 3. 清理主应用 Cache
if [ -d "$APP_DATA/Cache/Cache_Data" ]; then
    size=$(du -sh "$APP_DATA/Cache/Cache_Data" 2>/dev/null | cut -f1)
    find "$APP_DATA/Cache/Cache_Data" -type f -delete 2>/dev/null
    echo "✅ 主应用 Cache 已清理 ($size)"
fi

# 4. 清理 GPU Cache
if [ -d "$BROWSER_PARTITION/GPUCache" ]; then
    size=$(du -sh "$BROWSER_PARTITION/GPUCache" 2>/dev/null | cut -f1)
    find "$BROWSER_PARTITION/GPUCache" -type f -delete 2>/dev/null
    echo "✅ GPU Cache 已清理 ($size)"
fi

if [ -d "$APP_DATA/GPUCache" ]; then
    find "$APP_DATA/GPUCache" -type f -delete 2>/dev/null
fi

# 5. 清理旧日志
LOGS_DIR="$HOME/.catpaw/logs"
if [ -d "$LOGS_DIR" ]; then
    # 清理 .old.log 轮转日志
    find "$LOGS_DIR" -name "*.old.log" -type f -delete 2>/dev/null
    # 清理 7 天前的 log-report
    find "$LOGS_DIR/log-report" -type f -mtime +7 -delete 2>/dev/null
    echo "✅ 旧日志已清理"
fi

# 6. 清理 IDE 项目终端日志
PROJECTS_DIR="$HOME/.catpaw/projects"
if [ -d "$PROJECTS_DIR" ]; then
    count=$(find "$PROJECTS_DIR" -name "*.log" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
        find "$PROJECTS_DIR" -name "*.log" -type f -delete 2>/dev/null
        echo "✅ IDE 终端日志已清理 ($count 个文件)"
    fi
fi

echo ""
after=$(du -sh "$APP_DATA" 2>/dev/null | cut -f1)
echo "清理后总占用: $after"
echo ""
echo "🎉 清理完成！现在可以重新打开 CatDesk 了。"
