#!/bin/bash
# 停止本地服务器

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 停止本地服务器...${NC}"

if [ -f "/tmp/happynewyear.pid" ]; then
    PID=$(cat /tmp/happynewyear.pid)
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        rm /tmp/happynewyear.pid
        echo -e "${GREEN}✅ 服务器已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  服务器未运行${NC}"
        rm /tmp/happynewyear.pid
    fi
else
    echo -e "${YELLOW}⚠️  服务器未运行${NC}"
fi
