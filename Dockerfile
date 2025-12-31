# 新年倒计时网站 - Docker镜像
FROM nginx:alpine

# 维护者信息
LABEL maintainer="happynewyear"
LABEL description="2026新年倒计时网站 - 3D烟花特效"

# 复制网站文件到nginx默认目录
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY image/ /usr/share/nginx/html/image/
COPY docs/ /usr/share/nginx/html/docs/

# 复制nginx配置
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
