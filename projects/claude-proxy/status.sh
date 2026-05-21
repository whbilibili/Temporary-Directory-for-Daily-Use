#!/bin/zsh
# 查看代理状态

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/proxy.pid"
LOG_FILE="$SCRIPT_DIR/proxy.log"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "✓ 代理运行中 (PID: $PID)"
    echo ""
    echo "最近日志："
    tail -20 "$LOG_FILE" 2>/dev/null || echo "（暂无日志）"
  else
    echo "✗ 代理未运行（PID 文件残留）"
  fi
else
  echo "✗ 代理未运行"
fi
