#!/bin/bash
# 一键部署脚本

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║   🎆 新年倒计时网站 - 快速部署 🎆   ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# 进入deploy目录
cd "$(dirname "$0")"

# 加载配置文件（优先使用.env，否则使用app.conf）
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
elif [ -f "app.conf" ]; then
    export $(grep -v '^#' app.conf | xargs)
fi

# 设置默认值
export APP_PORT=${APP_PORT:-8021}
export CONTAINER_PORT=${CONTAINER_PORT:-80}
export TZ=${TZ:-Asia/Shanghai}

# 步骤1: 拉取镜像
echo -e "${YELLOW}[1/3] 📥 拉取Docker镜像...${NC}"
./pull.sh
echo ""

# 步骤2: 启动服务
echo -e "${YELLOW}[2/3] 🚀 启动服务...${NC}"
./start.sh
echo ""

# 步骤3: 检查状态
echo -e "${YELLOW}[3/3] ✅ 检查服务状态...${NC}"
sleep 2
./status.sh
echo ""

echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎊 部署完成！新年快乐！🎊         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🌐 访问地址: ${GREEN}http://localhost:${APP_PORT}${NC}"
echo -e "${CYAN}📋 查看日志: ${YELLOW}./deploy/logs.sh${NC}"
echo -e "${CYAN}🛑 停止服务: ${YELLOW}./deploy/stop.sh${NC}"
echo ""
