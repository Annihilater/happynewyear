#!/bin/bash
# 拉取最新镜像（如果有远程仓库）

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 拉取最新镜像...${NC}"

# 进入deploy目录
cd "$(dirname "$0")"

echo -e "${YELLOW}📥 从DockerHub拉取镜像...${NC}"
echo -e "${CYAN}   镜像: klause/happynewyear:latest${NC}"
echo ""

docker-compose pull

echo ""
echo -e "${GREEN}✅ 镜像拉取成功！${NC}"
echo ""
echo -e "${YELLOW}📋 镜像信息:${NC}"
docker images | grep klause/happynewyear
