#!/bin/sh
# Docker 容器启动脚本
# 根据环境变量生成 site-config.json

set -e

CONFIG_FILE="/usr/share/nginx/html/site-config.json"

# 从环境变量读取配置，如果没有则使用默认值
# 注意：环境变量值可能包含空格，需要正确处理
# 去掉可能的引号（如果.env文件中使用了引号）
SITE_SUBTITLE=$(echo "${SITE_SUBTITLE:-倒计时}" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
SITE_TAGLINE=$(echo "${SITE_TAGLINE:-点亮希望，照亮未来}" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
SITE_YEAR=$(echo "${SITE_YEAR:-2026}" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")

# 调试信息：显示接收到的环境变量
echo "🔧 环境变量检查:"
echo "   SITE_SUBTITLE='${SITE_SUBTITLE}'"
echo "   SITE_TAGLINE='${SITE_TAGLINE}'"
echo "   SITE_YEAR='${SITE_YEAR}'"

# 生成配置文件（使用单引号避免JSON转义问题）
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
