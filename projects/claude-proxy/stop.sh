#!/bin/zsh
# 停止代理

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/proxy.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "代理未在运行"
  exit 0
fi

PID=$(cat "$PID_FILE")
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  rm "$PID_FILE"
  echo "✓ 代理已停止 (PID: $PID)"
else
  echo "代理进程不存在，清理 PID 文件"
  rm "$PID_FILE"
fi
