# 新年倒计时网站 - Docker镜像
FROM nginx:alpine

# 维护者信息
LABEL maintainer="happynewyear"
LABEL description="2026新年倒计时网站 - 3D烟花特效"

# 复制网站文件到nginx默认目录
COPY src/ /usr/share/nginx/html/
COPY image/ /usr/share/nginx/html/image/
COPY docs/ /usr/share/nginx/html/docs/

# 复制nginx配置
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# 复制启动脚本
COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动脚本（会生成 site-config.json）
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
