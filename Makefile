# 新年倒计时网站 - Makefile
.PHONY: help deploy start stop restart build push pull logs status clean

# 默认目标
.DEFAULT_GOAL := help

# 帮助信息
help:
	@echo ""
	@echo "  🎆 新年倒计时网站 - Docker部署命令 🎆"
	@echo ""
	@echo "  快速命令："
	@echo "    make deploy    - 一键部署（拉取镜像+启动）"
	@echo "    make start     - 启动服务"
	@echo "    make stop      - 停止服务"
	@echo "    make restart   - 重启服务"
	@echo ""
	@echo "  镜像管理："
	@echo "    make build     - 多平台构建镜像并推送到DockerHub"
	@echo "    make pull      - 从DockerHub拉取镜像"
	@echo ""
	@echo "  监控调试："
	@echo "    make logs      - 查看实时日志"
	@echo "    make status    - 查看服务状态"
	@echo ""
	@echo "  清理："
	@echo "    make clean     - 清理容器和镜像"
	@echo ""

# 一键部署
deploy:
	@cd deploy && ./quick-deploy.sh

# 启动服务
start:
	@cd deploy && ./start.sh

# 停止服务
stop:
	@cd deploy && ./stop.sh

# 重启服务
restart:
	@cd deploy && ./restart.sh

# 构建镜像（多平台）
build:
	@cd deploy && ./build.sh

# 拉取镜像
pull:
	@cd deploy && ./pull.sh

# 查看日志
logs:
	@cd deploy && ./logs.sh

# 查看状态
status:
	@cd deploy && ./status.sh

# 清理资源
clean:
	@cd deploy && ./clean.sh

# 开发模式（本地Python服务器）
dev:
	@echo "🚀 启动开发服务器..."
	@cd src && python3 -m http.server 8080
