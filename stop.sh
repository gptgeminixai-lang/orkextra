#!/usr/bin/env bash
echo ""
echo "  Stopping ORKXTRA server ..."
if pkill -f "web-player/server.js" 2>/dev/null; then
  echo "  stopped."
else
  echo "  ORKXTRA server was not running."
fi
