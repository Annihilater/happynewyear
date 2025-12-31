#!/bin/bash
# 重启新年倒计时网站

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 重启新年倒计时网站...${NC}"

# 进入deploy目录
cd "$(dirname "$0")"

# 重启服务
docker-compose restart

# 等待
sleep 2

# 检查状态
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ 服务重启成功！${NC}"
    echo -e "${GREEN}🌐 访问地址: http://localhost:8080${NC}"
else
    echo -e "${RED}❌ 服务重启失败${NC}"
    docker-compose logs
    exit 1
fi
