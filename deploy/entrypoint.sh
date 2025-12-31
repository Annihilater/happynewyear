#!/bin/sh
# Docker 容器启动脚本
# 根据环境变量生成 site-config.json

set -e

CONFIG_FILE="/usr/share/nginx/html/site-config.json"

# 从环境变量读取配置，如果没有则使用默认值
# 注意：环境变量值可能包含空格，需要正确处理
# 去掉可能的引号（如果.env文件中使用了引号）
# 使用 eval 来正确处理包含空格的值
if [ -n "$SITE_SUBTITLE" ]; then
    SITE_SUBTITLE=$(echo "$SITE_SUBTITLE" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
else
    SITE_SUBTITLE="倒计时"
fi

if [ -n "$SITE_TAGLINE" ]; then
    SITE_TAGLINE=$(echo "$SITE_TAGLINE" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
else
    SITE_TAGLINE="点亮希望，照亮未来"
fi

if [ -n "$SITE_YEAR" ]; then
    SITE_YEAR=$(echo "$SITE_YEAR" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
else
    SITE_YEAR="2026"
fi

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
