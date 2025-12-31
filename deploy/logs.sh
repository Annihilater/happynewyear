#!/bin/bash
# 查看容器日志

set -e

YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📋 查看容器日志...${NC}"

# 进入deploy目录
cd "$(dirname "$0")"

# 实时查看日志（最后100行）
docker-compose logs -f --tail=100
