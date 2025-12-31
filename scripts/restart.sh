#!/bin/bash
# 重启本地服务器

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 重启本地服务器...${NC}"

# 停止
$(dirname "$0")/stop.sh

# 等待
sleep 1

# 启动
$(dirname "$0")/start.sh

echo -e "${GREEN}✅ 重启完成${NC}"
