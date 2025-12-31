# 🎆 2026 新年倒计时

一个精美的新年倒计时网页，具有**真实3D烟花特效、动态星空、深度音效**等功能。

## 🎯 参考来源

- **原网站**：<https://2026.xcodeman.com/>
- **核心烟花源码**：<https://codepen.io/sabosugi/pen/ByzBXQW>
- **本地源码备份**：`docs/source_code/`

## ✨ 核心特性

### 🎆 烟花系统

- **Three.js WebGL渲染** - 真实3D透视效果
- **UnrealBloomPass后期处理** - 专业级光晕发光
- **23000粒子爆炸** - GPU硬件加速
- **Mono/Dual/Tri颜色系统** - 单色/双色/三色随机
- **悬停+下落物理** - 1.5秒悬停后自由落体
- **径向渐变Sprite** - 圆形发光粒子
- **全屏拖尾效果** - 半透明黑色Quad实现优雅拖尾

### 🌌 星空背景

- **3000个背景星星** - 静态点缀
- **缓慢漂移+闪烁** - 宁静宇宙氛围
- **场景雾效** - FogExp2增加深度感

### 🔊 深度音效系统

- **三层声音合成**：
  - Sub-Bass低频隆隆声（50Hz→20Hz，5秒）
  - 白噪声爆裂声（低通滤波150Hz→30Hz）
  - 短促咔嗒声（三角波200Hz→50Hz）
- **Web Audio API生成** - 非预录音频
- **动态压缩器** - 防止爆音

### ⏰ 其他功能

- **倒计时器** - 实时显示距离2026年的天时分秒
- **弹幕祝福** - 彩色祝福语动态飘过
- **愿望输入** - 输入愿望触发烟花
- **双语支持** - 中文/English切换
- **模式切换** - 舒缓/激烈模式
- **定时切换** - 设定时间自动切换模式

## 🚀 快速开始

### 方法一：Docker部署（推荐⭐）

**镜像地址**：`klause/happynewyear:latest`  
**支持架构**：linux/amd64, linux/arm64 (Apple Silicon M1/M2)

```bash
# 一键部署（从DockerHub拉取）
cd deploy
./quick-deploy.sh

# 或手动部署
./pull.sh       # 拉取镜像
./start.sh      # 启动服务
./status.sh     # 查看状态
```

访问：**<http://localhost:8021>**

**管理命令**：

```bash
./stop.sh       # 停止服务
./restart.sh    # 重启服务
./logs.sh       # 查看日志
./clean.sh      # 清理资源
```

**开发者构建**（修改代码后）：

```bash
./build.sh      # 多平台构建并推送到DockerHub
```

**使用Makefile（更简单）**：

```bash
make deploy     # 一键部署
make start      # 启动
make stop       # 停止
make logs       # 日志
make status     # 状态
make build      # 构建推送
make help       # 查看所有命令
```

### 方法二：直接打开

直接用浏览器打开 `src/index.html` 文件即可。

### 方法三：本地服务器

```bash
# 使用 Python（默认端口8021）
cd src && python3 -m http.server 8021

# 或使用 Makefile（自动读取配置）
make dev

# 或使用 Node.js
cd src && npx serve

# 或使用 PHP
cd src && php -S localhost:8021
```

然后访问 `http://localhost:8021`

## 📁 项目结构

```bash
happynewyear/
├── src/                    # 📁 前端源代码
│   ├── index.html          #    主页面
│   ├── css/                #    样式文件
│   │   └── style.css
│   └── js/                 #    JavaScript模块
│       ├── main.js         #    主控制器（ES6 Module）
│       ├── fireworks.js    #    Three.js烟花系统
│       ├── starfield.js    #    Canvas星空背景
│       ├── audio.js        #    Web Audio深度音效
│       ├── config.js       #    配置管理+LocalStorage
│       ├── countdown.js    #    倒计时逻辑
│       └── danmaku.js      #    弹幕系统
├── deploy/                 # 🐳 Docker部署物料
│   ├── docker-compose.yml  #    Docker编排文件
│   ├── nginx.conf          #    Nginx配置
│   ├── quick-deploy.sh     #    一键部署
│   ├── build.sh            #    多平台构建+推送
│   ├── start.sh            #    启动服务
│   ├── stop.sh             #    停止服务
│   ├── restart.sh          #    重启服务
│   ├── pull.sh             #    拉取镜像
│   ├── logs.sh             #    查看日志
│   ├── status.sh           #    查看状态
│   ├── clean.sh            #    清理资源
│   ├── README.md           #    部署文档
│   └── DEPLOY_GUIDE.md     #    完整部署指南
├── docs/                   # 📚 文档和参考
│   └── source_code/        #    CodePen原始源码
│       ├── index.html
│       ├── main.js
│       └── style.css
├── image/                  # 🖼️ 截图和参考图片
├── .github/                # 🤖 GitHub Actions
│   └── workflows/
│       └── docker-publish.yml
├── Dockerfile              # 🐳 Docker镜像构建
├── .dockerignore           # Docker忽略文件
├── Makefile                # 📝 Make命令集
├── .cursorrules            # 🤖 AI助手规则
├── DESIGN.md               # 📐 设计文档
└── README.md               # 📖 项目说明
```

## 🎮 交互方式

### 鼠标操作

| 操作 | 效果 |
|------|------|
| 点击遮罩层 | 启用音效并开始烟花 |
| 点击页面任意位置 | 在点击位置爆炸烟花 |
| 点击右上角🔇/🔊 | 切换音效开关 |
| 点击右上角⚙️ | 打开设置面板 |
| 输入愿望并发送 | 愿望变成弹幕 + 烟花庆祝 |

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| **空格** | 手动发射烟花 |
| **M** | 切换音效开关 |
| **1** | 切换到舒缓模式 |
| **2** | 切换到激烈模式 |
| **ESC** | 开启/关闭设置面板 |

## 🛠️ 技术栈

### 核心技术

- **Three.js r160** - WebGL 3D渲染引擎
- **EffectComposer** - 后期处理渲染管线
- **UnrealBloomPass** - 虚幻引擎级光晕效果
- **RenderPass** - 场景渲染通道
- **Canvas 2D** - 星空背景 + Sprite纹理生成
- **Web Audio API** - 实时音频合成
- **ES6 Modules** - 现代化模块系统

### 前端技术

- **HTML5** - 语义化页面结构
- **CSS3** - 响应式布局 + 动画
- **JavaScript (ES6+)** - 异步交互逻辑
- **LocalStorage** - 客户端数据持久化

### 关键库和版本

```javascript
// Three.js生态
"three": "https://unpkg.com/three@0.160.0/build/three.module.js"
"three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"

// 使用的插件
- EffectComposer.js
- RenderPass.js  
- UnrealBloomPass.js
```

## 📱 兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ 移动端浏览器

## 🎨 自定义

### 修改目标日期

编辑 `src/js/main.js`：

```javascript
const countdown = new Countdown({
    targetDate: new Date('2026-01-01T00:00:00'),
    // ...
});
```

### 添加祝福语

编辑 `src/js/danmaku.js` 中的 `wishes` 数组：

```javascript
this.wishes = [
    "你的祝福语",
    // ...
];
```

### 修改颜色主题

编辑 `src/css/style.css` 中的 CSS 变量：

```css
:root {
    --accent-purple: #a855f7;
    --accent-cyan: #22d3ee;
    // ...
}
```

## 🎛️ 配置参数（原网站默认值）

### 粒子参数

- `particleCount`: 23000 - 每个烟花的粒子数量
- `particleSize`: 0.8 - 粒子基础大小
- `fadeSpeed`: 0.00482 - 淡出速度

### 物理参数

- `explosionForce`: 3.3975 - 爆炸力度
- `hoverDuration`: 1.5 - 悬停时间（秒）
- `gravity`: 0.00265 - 重力强度
- `friction`: 0.95494 - 悬停期摩擦系数

### 后期处理参数

- `bloomStrength`: 1.495 - 光晕强度
- `bloomRadius`: 0.5 - 光晕半径
- `trailOpacity`: 0.39707 - 拖尾不透明度

### 模式配置

- **舒缓模式**：interval=4000ms, burstCount=1
- **激烈模式**：interval=800ms, burstCount=3, burstDelay=150ms

## 📦 依赖资源

### CDN资源

```html
<!-- Three.js v0.160.0 -->
https://unpkg.com/three@0.160.0/build/three.module.js

<!-- Three.js Addons -->
https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js
https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js
https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js

<!-- Google Fonts -->
https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap
```

### 本地资源

- `js/audio.js` - 深度音效系统
- `js/config.js` - 配置管理
- `js/fireworks.js` - Three.js烟花系统
- `js/starfield.js` - Canvas星空背景
- `js/countdown.js` - 倒计时逻辑
- `js/danmaku.js` - 弹幕系统
- `js/main.js` - 主控制器

## 🎓 学习资源

- [Three.js官方文档](https://threejs.org/docs/)
- [UnrealBloomPass示例](https://threejs.org/examples/?q=bloom#webgl_postprocessing_unreal_bloom)
- [Web Audio API教程](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [CodePen原始源码](https://codepen.io/sabosugi/pen/ByzBXQW)

## 📄 License

MIT License - 随意使用和修改

---

**🎉 祝你新年快乐，万事如意！**

*基于 CodePen sabosugi/ByzBXQW 烟花效果*
