#!/bin/bash
# 启动新年倒计时网站

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎆 启动新年倒计时网站...${NC}"

# 检查docker-compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose未安装，请先安装docker-compose${NC}"
    exit 1
fi

# 进入deploy目录
cd "$(dirname "$0")"

# 加载配置文件（优先使用.env，否则使用app.conf）
# 使用 set -a 自动导出所有变量，正确处理包含空格的值
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
elif [ -f "app.conf" ]; then
    set -a
    source app.conf
    set +a
fi

# 设置默认值
export APP_PORT=${APP_PORT:-5861}
export APP_PORT_XLIGHT=${APP_PORT_XLIGHT:-5862}
export CONTAINER_PORT=${CONTAINER_PORT:-80}
export TZ=${TZ:-Asia/Shanghai}

# 检查是否已经在运行
if docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  容器已在运行，将停止并重新启动以应用新配置...${NC}"
    docker-compose down
fi

# 启动服务（使用环境变量）
echo -e "${YELLOW}🚀 启动服务...${NC}"
docker-compose up -d

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 3

# 检查状态
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ 服务启动成功！${NC}"
    echo ""
    echo -e "${GREEN}🌐 访问地址:${NC}"
    echo -e "   - 站点1: http://localhost:${APP_PORT}"
    if docker-compose ps | grep -q "happynewyear-xlight.*Up"; then
        echo -e "   - 站点2: http://localhost:${APP_PORT_XLIGHT}"
    fi
    echo -e "${GREEN}🎊 新年快乐！${NC}"
    
    # 显示日志
    echo ""
    echo -e "${YELLOW}📋 容器状态:${NC}"
    docker-compose ps
else
    echo -e "${RED}❌ 服务启动失败${NC}"
    echo -e "${YELLOW}查看日志:${NC}"
    docker-compose logs
    exit 1
fi
