#!/bin/bash
# 查看服务状态

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📊 服务状态检查${NC}"
echo ""

# 进入deploy目录
cd "$(dirname "$0")"

# 容器状态
echo -e "${YELLOW}🐳 容器状态:${NC}"
docker-compose ps
echo ""

# 健康检查
echo -e "${YELLOW}💓 健康检查:${NC}"
docker inspect happynewyear-web --format='{{.State.Health.Status}}' 2>/dev/null || echo "容器未运行"
echo ""

# 端口映射
echo -e "${YELLOW}🌐 端口映射:${NC}"
docker-compose port happynewyear 80 2>/dev/null || echo "服务未运行"
echo ""

# 资源使用
echo -e "${YELLOW}📈 资源使用:${NC}"
docker stats --no-stream happynewyear-web 2>/dev/null || echo "容器未运行"
