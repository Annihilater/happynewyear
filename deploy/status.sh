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

# 加载配置文件（优先使用.env，否则使用app.conf）
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
elif [ -f "app.conf" ]; then
    export $(grep -v '^#' app.conf | xargs)
fi

# 设置默认值
export APP_PORT=${APP_PORT:-5861}
export APP_PORT_XLIGHT=${APP_PORT_XLIGHT:-5862}

# 容器状态
echo -e "${YELLOW}🐳 容器状态:${NC}"
docker-compose ps
echo ""

# 健康检查
echo -e "${YELLOW}💓 健康检查:${NC}"
docker inspect happynewyear-web --format='{{.State.Health.Status}}' 2>/dev/null || echo "站点1容器未运行"
if docker-compose ps | grep -q "happynewyear-xlight"; then
    docker inspect happynewyear-xlight --format='{{.State.Health.Status}}' 2>/dev/null || echo "站点2容器未运行"
fi
echo ""

# 端口映射
echo -e "${YELLOW}🌐 端口映射:${NC}"
MAPPED_PORT=$(docker-compose port happynewyear 80 2>/dev/null | cut -d: -f2)
if [ -n "$MAPPED_PORT" ]; then
    echo -e "  站点1: 容器端口 80 → 主机端口 ${MAPPED_PORT}"
    echo -e "        访问地址: http://localhost:${MAPPED_PORT}"
fi

MAPPED_PORT_XLIGHT=$(docker-compose port happynewyear-xlight 80 2>/dev/null | cut -d: -f2)
if [ -n "$MAPPED_PORT_XLIGHT" ]; then
    echo -e "  站点2: 容器端口 80 → 主机端口 ${MAPPED_PORT_XLIGHT}"
    echo -e "        访问地址: http://localhost:${MAPPED_PORT_XLIGHT}"
fi

if [ -z "$MAPPED_PORT" ] && [ -z "$MAPPED_PORT_XLIGHT" ]; then
    echo "  服务未运行"
fi
echo ""

# 资源使用
echo -e "${YELLOW}📈 资源使用:${NC}"
docker stats --no-stream happynewyear-web happynewyear-xlight 2>/dev/null || echo "容器未运行"
