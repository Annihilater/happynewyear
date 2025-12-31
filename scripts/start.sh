#!/bin/bash
# 本地服务器启动（后台运行）

set -e

source "$(dirname "$0")/config.sh"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 启动本地服务器（后台）...${NC}"

cd "$(dirname "$0")/../src"

# 检查是否已运行
if [ -f "/tmp/happynewyear.pid" ]; then
    PID=$(cat /tmp/happynewyear.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  服务器已在运行 (PID: $PID)${NC}"
        echo -e "${GREEN}🌐 访问: http://${DEV_HOST}:${DEV_PORT}${NC}"
        exit 0
    fi
fi

# 后台启动
nohup python3 -m http.server ${DEV_PORT} > /tmp/happynewyear.log 2>&1 &
echo $! > /tmp/happynewyear.pid

echo -e "${GREEN}✅ 服务器已启动${NC}"
echo -e "${GREEN}🌐 访问: http://${DEV_HOST}:${DEV_PORT}${NC}"
echo -e "${YELLOW}📋 日志: tail -f /tmp/happynewyear.log${NC}"
echo -e "${YELLOW}🛑 停止: ./scripts/stop.sh${NC}"
