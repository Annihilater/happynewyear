#!/bin/bash
# 本地开发启动脚本

set -e

# 加载配置
source "$(dirname "$0")/config.sh"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║   🎆 新年倒计时 - 开发服务器 🎆     ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# 进入src目录
cd "$(dirname "$0")/../src"

echo -e "${YELLOW}📁 工作目录: $(pwd)${NC}"
echo -e "${YELLOW}🌐 端口: ${DEV_PORT}${NC}"
echo -e "${YELLOW}🔗 地址: http://${DEV_HOST}:${DEV_PORT}${NC}"
echo ""

# 检查端口是否被占用
if lsof -Pi :${DEV_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  端口 ${DEV_PORT} 已被占用${NC}"
    echo -e "${YELLOW}🔧 尝试使用其他端口...${NC}"
    export DEV_PORT=$((DEV_PORT + 1))
    echo -e "${GREEN}✅ 使用端口: ${DEV_PORT}${NC}"
fi

# 自动打开浏览器
if [ "$AUTO_OPEN" = "true" ]; then
    echo -e "${GREEN}🚀 启动浏览器...${NC}"
    sleep 2
    open "http://${DEV_HOST}:${DEV_PORT}" 2>/dev/null || \
    xdg-open "http://${DEV_HOST}:${DEV_PORT}" 2>/dev/null || \
    echo -e "${YELLOW}💡 请手动打开: http://${DEV_HOST}:${DEV_PORT}${NC}"
fi &

echo ""
echo -e "${GREEN}✅ 开发服务器已启动${NC}"
echo -e "${CYAN}🎨 修改代码后刷新浏览器即可看到效果${NC}"
echo -e "${YELLOW}🛑 按 Ctrl+C 停止服务${NC}"
echo ""

# 启动Python HTTP服务器
python3 -m http.server ${DEV_PORT}
