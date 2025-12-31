#!/bin/bash
# 重启新年倒计时网站

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 重启新年倒计时网站...${NC}"

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
export CONTAINER_PORT=${CONTAINER_PORT:-80}
export TZ=${TZ:-Asia/Shanghai}

# 重启服务
docker-compose restart

# 等待
sleep 2

# 检查状态
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ 服务重启成功！${NC}"
    echo -e "${GREEN}🌐 访问地址: http://localhost:${APP_PORT}${NC}"
else
    echo -e "${RED}❌ 服务重启失败${NC}"
    docker-compose logs
    exit 1
fi
