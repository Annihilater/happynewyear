# 🐳 Docker部署文档

## 📦 部署物料说明

```
deploy/
├── nginx.conf      # Nginx配置文件
├── start.sh        # 启动服务
├── stop.sh         # 停止服务
├── restart.sh      # 重启服务
├── build.sh        # 构建镜像
├── pull.sh         # 拉取镜像
├── logs.sh         # 查看日志
├── status.sh       # 查看状态
├── clean.sh        # 清理资源
└── README.md       # 本文档
```

## 🚀 快速开始

### 前置要求
- Docker 20.10+
- Docker Compose 2.0+
- 已登录DockerHub（仅构建推送时需要）

### 一键部署（推荐⭐）

```bash
cd deploy
chmod +x *.sh
./quick-deploy.sh
```

服务将在 **http://localhost:8080** 启动

### 手动部署

#### 方式1：使用远程镜像（推荐）

```bash
cd deploy
./pull.sh    # 从DockerHub拉取
./start.sh   # 启动服务
```

#### 方式2：本地构建+推送

```bash
cd deploy
./build.sh   # 多平台构建并推送到DockerHub
./start.sh   # 启动服务
```

### 3. 查看状态

```bash
./status.sh
```

### 4. 查看日志

```bash
./logs.sh
```

### 5. 重启服务

```bash
./restart.sh
```

### 6. 停止服务

```bash
./stop.sh
```

### 7. 清理资源

```bash
./clean.sh
```

## 🛠️ 脚本详解

### start.sh - 启动服务
- 检查docker-compose是否安装
- 检查服务是否已运行
- 启动或重启容器
- 显示访问地址

### stop.sh - 停止服务
- 停止并移除容器
- 保留镜像和数据

### restart.sh - 重启服务
- 快速重启容器
- 不重新构建镜像

### build.sh - 多平台构建镜像
- **支持平台**：linux/amd64, linux/arm64
- **自动推送**：构建完成后推送到DockerHub
- **buildx构建**：使用Docker Buildx多平台构建
- **镜像名称**：klause/happynewyear:latest
- **适用场景**：首次构建、代码更新后重新发布

### pull.sh - 拉取镜像
- 从远程仓库拉取最新镜像
- 如未配置远程仓库，则本地构建

### logs.sh - 查看日志
- 实时查看容器日志
- 显示最后100行

### status.sh - 查看状态
- 容器运行状态
- 健康检查结果
- 端口映射信息
- 资源使用情况

### clean.sh - 清理资源
- 停止并删除容器
- 删除镜像
- 清理未使用的Docker资源

## 📝 配置说明

### docker-compose.yml
```yaml
services:
  happynewyear:
    image: happynewyear:latest
    ports:
      - "8080:80"        # 端口映射
    restart: unless-stopped
    environment:
      - TZ=Asia/Shanghai # 时区设置
```

### Dockerfile
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
```

### nginx.conf
- Gzip压缩
- 静态资源缓存（7天）
- 健康检查端点：`/health`

## 🔧 自定义端口

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:80"  # 修改8080为你想要的端口
```

## 📊 资源占用

- **镜像大小**: ~15MB (nginx:alpine基础镜像)
- **运行内存**: ~10MB
- **CPU使用**: 极低（静态网站）

## 🌐 生产环境部署

### 1. 修改docker-compose.yml

```yaml
services:
  happynewyear:
    image: your-registry/happynewyear:latest
    ports:
      - "80:80"  # 生产环境使用80端口
    restart: always
```

### 2. 推送镜像到仓库

```bash
docker tag happynewyear:latest your-registry/happynewyear:latest
docker push your-registry/happynewyear:latest
```

### 3. 在服务器上部署

```bash
./pull.sh
./start.sh
```

## ❓ 常见问题

### Q: 端口8080被占用？
A: 修改docker-compose.yml中的端口映射

### Q: 容器无法启动？
A: 运行`./logs.sh`查看错误日志

### Q: 如何更新网站内容？
A: 修改代码后运行`./build.sh && ./restart.sh`

### Q: 如何备份？
A: 网站是纯静态文件，直接备份项目目录即可

## 📄 License

MIT License

---

**🎆 新年快乐！祝你2026年万事如意！**
