#!/bin/bash
# 清理容器和镜像

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🧹 清理Docker资源...${NC}"

# 进入deploy目录
cd "$(dirname "$0")"

# 停止并删除容器
echo -e "${YELLOW}1. 停止并删除容器...${NC}"
docker-compose down -v

# 删除镜像
echo -e "${YELLOW}2. 删除镜像...${NC}"
docker rmi klause/happynewyear:latest 2>/dev/null || echo "镜像不存在"

# 清理未使用的资源
echo -e "${YELLOW}3. 清理未使用的Docker资源...${NC}"
docker system prune -f

echo -e "${GREEN}✅ 清理完成！${NC}"
