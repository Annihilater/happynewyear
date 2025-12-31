#!/bin/bash
# 多平台构建镜像并推送到DockerHub

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

IMAGE_NAME="klause/happynewyear"
IMAGE_TAG="20251231"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║   🔨 多平台镜像构建 & 推送 🔨        ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# 进入项目根目录
cd "$(dirname "$0")/.."

# 显示构建信息
echo -e "${YELLOW}📦 镜像名称: ${FULL_IMAGE}${NC}"
echo -e "${YELLOW}📁 构建上下文: $(pwd)${NC}"
echo -e "${YELLOW}🖥️  目标平台: linux/amd64, linux/arm64${NC}"
echo ""

# 创建并使用buildx builder（支持多平台）
echo -e "${YELLOW}🔧 设置buildx builder...${NC}"
if ! docker buildx inspect multiarch-builder > /dev/null 2>&1; then
    docker buildx create --name multiarch-builder --use
else
    docker buildx use multiarch-builder
fi

# 启动builder
docker buildx inspect --bootstrap

# 多平台构建并推送
echo ""
echo -e "${YELLOW}🚀 开始多平台构建...${NC}"
echo -e "${CYAN}   这可能需要几分钟，请耐心等待...${NC}"
echo ""

docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag ${FULL_IMAGE} \
    --push \
    --progress=plain \
    .

echo ""
echo -e "${GREEN}✅ 镜像构建并推送成功！${NC}"
echo ""

# 显示镜像信息
echo -e "${YELLOW}📋 镜像信息:${NC}"
echo -e "   名称: ${FULL_IMAGE}"
echo -e "   平台: linux/amd64, linux/arm64"
echo -e "   仓库: https://hub.docker.com/r/${IMAGE_NAME}"
echo ""

# 拉取到本地（可选）
echo -e "${YELLOW}📥 是否拉取到本地测试? (y/n)${NC}"
read -r -p "> " response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📥 拉取镜像到本地...${NC}"
    docker pull ${FULL_IMAGE}
    echo -e "${GREEN}✅ 拉取完成！${NC}"
    
    # 显示本地镜像
    echo ""
    echo -e "${YELLOW}📋 本地镜像:${NC}"
    docker images | grep happynewyear
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎊 构建完成！镜像已推送 🎊        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🌐 DockerHub: ${GREEN}https://hub.docker.com/r/${IMAGE_NAME}${NC}"
echo -e "${CYAN}🚀 部署命令: ${YELLOW}cd deploy && ./start.sh${NC}"
echo ""
