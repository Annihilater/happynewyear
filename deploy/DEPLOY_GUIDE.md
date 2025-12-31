# 🚀 完整部署指南

## 📋 目录

1. [本地开发部署](#本地开发部署)
2. [Docker构建推送](#docker构建推送)
3. [生产环境部署](#生产环境部署)
4. [CI/CD自动部署](#cicd自动部署)
5. [故障排查](#故障排查)

---

## 本地开发部署

### 场景1：快速预览（无需Docker）

```bash
# 直接用浏览器打开
open index.html

# 或启动Python服务器
python3 -m http.server 8080
```

### 场景2：Docker本地测试

```bash
cd deploy
./quick-deploy.sh
```

---

## Docker构建推送

### 准备工作

1. **登录DockerHub**
```bash
docker login
# 输入用户名: klause
# 输入密码/Token
```

2. **确认M1芯片支持**
```bash
docker buildx ls
# 确保有 linux/arm64 支持
```

### 构建并推送

```bash
cd deploy
./build.sh
```

**build.sh做了什么**：
1. ✅ 检查Docker登录状态
2. ✅ 创建/使用buildx builder
3. ✅ 构建 linux/amd64 和 linux/arm64 两个平台
4. ✅ 自动推送到 klause/happynewyear:latest
5. ✅ 询问是否拉取到本地测试

### 手动构建（高级）

```bash
# 进入项目根目录
cd /path/to/happynewyear

# 创建builder
docker buildx create --name multiarch-builder --use

# 构建并推送
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag klause/happynewyear:latest \
    --tag klause/happynewyear:v1.0 \
    --push \
    .
```

---

## 生产环境部署

### 服务器要求

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 7+)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: ≥ 512MB
- **磁盘**: ≥ 1GB

### 部署步骤

#### 1. 安装Docker（如未安装）

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo systemctl enable docker

# 重新登录使组权限生效
```

#### 2. 克隆或上传项目

```bash
# 方式1: Git克隆
git clone https://github.com/yourusername/happynewyear.git
cd happynewyear/deploy

# 方式2: 只需要deploy目录
scp -r deploy/ user@server:/opt/happynewyear/
cd /opt/happynewyear/deploy
```

#### 3. 修改配置（可选）

```bash
# 修改端口
vim docker-compose.yml
# 将 8080:80 改为 80:80（生产环境）

# 修改时区
# environment:
#   - TZ=Asia/Shanghai
```

#### 4. 启动服务

```bash
chmod +x *.sh
./pull.sh        # 拉取镜像
./start.sh       # 启动服务
./status.sh      # 检查状态
```

#### 5. 配置防火墙（如需要）

```bash
# Ubuntu
sudo ufw allow 8080/tcp

# CentOS
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

#### 6. 配置反向代理（可选）

**Nginx反向代理**：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Caddy反向代理**：

```caddy
your-domain.com {
    reverse_proxy localhost:8080
}
```

---

## CI/CD自动部署

### GitHub Actions

已配置自动构建工作流：`.github/workflows/docker-publish.yml`

#### 触发条件
- 推送到 main/master 分支
- 创建版本标签 (v*)
- 手动触发

#### 配置Secrets

在GitHub仓库设置中添加：

1. `DOCKERHUB_USERNAME` - DockerHub用户名
2. `DOCKERHUB_TOKEN` - DockerHub访问令牌

#### 手动触发

```bash
# GitHub网站
Actions → Build and Push Docker Image → Run workflow
```

---

## 故障排查

### 问题1: 端口被占用

```bash
# 查看端口占用
lsof -i :8080

# 修改端口
vim deploy/docker-compose.yml
# ports: - "8081:80"
```

### 问题2: 容器启动失败

```bash
# 查看日志
cd deploy
./logs.sh

# 查看详细状态
./status.sh

# 检查健康状态
docker inspect happynewyear-web --format='{{.State.Health.Status}}'
```

### 问题3: 镜像拉取失败

```bash
# 手动拉取
docker pull klause/happynewyear:latest

# 检查网络
ping hub.docker.com

# 使用国内镜像源
# 编辑 /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

### 问题4: 权限问题

```bash
# 添加当前用户到docker组
sudo usermod -aG docker $USER

# 重新登录
newgrp docker
```

### 问题5: M1芯片兼容性

```bash
# 安装Rosetta（如需要）
softwareupdate --install-rosetta

# 检查buildx支持
docker buildx ls

# 重新创建builder
docker buildx create --name multiarch-builder --use --bootstrap
```

---

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| **镜像大小** | 101MB (nginx:alpine) |
| **启动时间** | < 3秒 |
| **内存占用** | ~10MB |
| **CPU使用** | < 1% |
| **并发支持** | 1000+ |

---

## 🔐 安全建议

1. **生产环境使用HTTPS**
   - 配置SSL证书
   - 使用Let's Encrypt免费证书

2. **限制访问来源**
   - 使用防火墙规则
   - Nginx配置IP白名单

3. **定期更新镜像**
   - 监控基础镜像更新
   - 定期重新构建

4. **日志管理**
   - 配置日志轮转
   - 集中日志收集

---

## 📞 支持

遇到问题？

1. 查看 [deploy/README.md](README.md)
2. 运行 `make help` 查看命令
3. 查看日志 `make logs`

---

**🎆 祝你部署顺利，新年快乐！🎆**
