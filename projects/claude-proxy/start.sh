#!/bin/zsh
# 启动代理（后台运行，日志写入 proxy.log）

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/proxy.pid"
LOG_FILE="$SCRIPT_DIR/proxy.log"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "代理已在运行中 (PID: $PID)"
    exit 0
  fi
fi

nohup /opt/homebrew/bin/node "$SCRIPT_DIR/proxy.js" >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "✓ 代理已启动 (PID: $!)"
echo "  日志: $LOG_FILE"
echo "  停止: ./stop.sh"
