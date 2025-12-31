#!/bin/bash
# 检查配置脚本 - 用于诊断服务器部署问题

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔍 配置检查工具${NC}"
echo ""

# 进入deploy目录
cd "$(dirname "$0")"

# 1. 检查 .env 文件
echo -e "${YELLOW}[1] 检查 .env 文件:${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env 文件存在${NC}"
    echo ""
    echo "SITE_SUBTITLE 相关配置:"
    grep -E "SITE_SUBTITLE|SITE_TAGLINE" .env | grep -v "^#" || echo "  未找到配置"
else
    echo -e "${RED}❌ .env 文件不存在${NC}"
fi
echo ""

# 2. 加载环境变量并检查
echo -e "${YELLOW}[2] 检查环境变量:${NC}"
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

echo "SITE_SUBTITLE=${SITE_SUBTITLE:-未设置}"
echo "SITE_SUBTITLE_XLIGHT=${SITE_SUBTITLE_XLIGHT:-未设置}"
echo ""

# 3. 检查 docker-compose 配置
echo -e "${YELLOW}[3] 检查 docker-compose 配置:${NC}"
echo "站点1配置:"
docker-compose config 2>/dev/null | grep -A 3 "happynewyear:" | grep "SITE_SUBTITLE" || echo "  无法读取配置"
echo ""
echo "站点2配置:"
docker-compose config 2>/dev/null | grep -A 3 "happynewyear-xlight:" | grep "SITE_SUBTITLE" || echo "  无法读取配置"
echo ""

# 4. 检查容器状态
echo -e "${YELLOW}[4] 检查容器状态:${NC}"
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ 容器正在运行${NC}"
    echo ""
    
    # 检查容器内的环境变量
    echo "站点1 (happynewyear-web) 环境变量:"
    docker exec happynewyear-web env 2>/dev/null | grep "SITE_SUBTITLE" || echo "  无法读取或容器未运行"
    echo ""
    
    echo "站点2 (happynewyear-xlight) 环境变量:"
    docker exec happynewyear-xlight env 2>/dev/null | grep "SITE_SUBTITLE" || echo "  无法读取或容器未运行"
    echo ""
    
    # 检查容器内的配置文件
    echo "站点1 (happynewyear-web) site-config.json:"
    docker exec happynewyear-web cat /usr/share/nginx/html/site-config.json 2>/dev/null || echo "  无法读取配置文件"
    echo ""
    
    echo "站点2 (happynewyear-xlight) site-config.json:"
    docker exec happynewyear-xlight cat /usr/share/nginx/html/site-config.json 2>/dev/null || echo "  无法读取配置文件"
    echo ""
    
    # 检查容器启动日志
    echo "站点1 (happynewyear-web) 启动日志（环境变量检查）:"
    docker logs happynewyear-web 2>&1 | grep -A 3 "环境变量检查" | tail -5 || echo "  未找到环境变量检查日志"
    echo ""
    
    echo "站点2 (happynewyear-xlight) 启动日志（环境变量检查）:"
    docker logs happynewyear-xlight 2>&1 | grep -A 3 "环境变量检查" | tail -5 || echo "  未找到环境变量检查日志"
else
    echo -e "${RED}❌ 容器未运行${NC}"
fi
echo ""

# 5. 检查镜像版本
echo -e "${YELLOW}[5] 检查镜像信息:${NC}"
docker images | grep "happynewyear" || echo "  未找到镜像"
echo ""

echo -e "${CYAN}💡 提示:${NC}"
echo "  如果两个站点的配置相同，请执行以下步骤："
echo "  1. 确保 .env 文件中 SITE_SUBTITLE 和 SITE_SUBTITLE_XLIGHT 配置不同"
echo "  2. 执行: docker-compose down"
echo "  3. 执行: docker-compose up -d"
echo "  4. 检查日志: docker logs happynewyear-web 和 docker logs happynewyear-xlight"
