#!/bin/sh
# Docker 容器启动脚本
# 根据环境变量生成 site-config.json

set -e

CONFIG_FILE="/usr/share/nginx/html/site-config.json"

# 从环境变量读取配置，如果没有则使用默认值
SITE_SUBTITLE="${SITE_SUBTITLE:-倒计时}"
SITE_TAGLINE="${SITE_TAGLINE:-点亮希望，照亮未来}"
SITE_YEAR="${SITE_YEAR:-2026}"

# 生成配置文件
cat > "$CONFIG_FILE" <<EOF
{
  "subtitle": "${SITE_SUBTITLE}",
  "tagline": "${SITE_TAGLINE}",
  "year": "${SITE_YEAR}"
}
EOF

echo "✅ 站点配置已生成: $CONFIG_FILE"
echo "   - Subtitle: ${SITE_SUBTITLE}"
echo "   - Tagline: ${SITE_TAGLINE}"
echo "   - Year: ${SITE_YEAR}"

# 执行传入的命令（通常是 nginx）
exec "$@"
