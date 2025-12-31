#!/bin/bash
# 停止新年倒计时网站

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 停止新年倒计时网站...${NC}"

# 进入deploy目录
cd "$(dirname "$0")"

# 停止并移除容器
docker-compose down

echo -e "${GREEN}✅ 服务已停止${NC}"
