#!/usr/bin/env bash
cd "$(dirname "$0")"
echo ""
echo "  ORKXTRA  -  http://127.0.0.1:4173/"
echo "  (Press Ctrl+C to stop)"
echo ""
exec node web-player/server.js --port=4173
