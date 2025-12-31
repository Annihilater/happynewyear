# 🎆 2026 新年倒计时

一个精美的新年倒计时网页，包含烟花特效、星空背景、弹幕祝福语等功能。

> 参考网站: https://2026.xcodeman.com/

## ✨ 功能特点

- 🌌 **3D星空背景** - 沉浸式太空飞行效果
- 🎇 **烟花特效** - 随机发射，带拖尾和绚丽爆炸效果
- ⏰ **倒计时器** - 实时显示距离2026年的时间
- 💬 **弹幕祝福** - 彩色祝福语飘动展示
- 📝 **愿望输入** - 输入你的新年愿望
- 🔊 **音效系统** - 点击启用后播放烟花音效

## 🚀 快速开始

### 方法一：直接打开

直接用浏览器打开 `index.html` 文件即可。

### 方法二：本地服务器

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 或使用 PHP
php -S localhost:8080
```

然后访问 `http://localhost:8080`

## 📁 项目结构

```
happynewyear/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── main.js         # 主逻辑
│   ├── starfield.js    # 星空背景
│   ├── fireworks.js    # 烟花系统
│   ├── countdown.js    # 倒计时
│   └── danmaku.js      # 弹幕系统
├── DESIGN.md           # 设计文档
└── README.md           # 本文档
```

## 🎮 交互方式

| 操作 | 效果 |
|------|------|
| 点击页面任意位置 | 发射烟花 |
| 点击顶部提示 | 启用音效 |
| 按空格键 | 批量发射烟花 |
| 输入愿望并发送 | 愿望变成弹幕 + 烟花庆祝 |

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式动画
- **Canvas 2D** - 烟花和星空渲染
- **JavaScript (ES6+)** - 交互逻辑

## 📱 兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ 移动端浏览器

## 🎨 自定义

### 修改目标日期

编辑 `js/main.js`：

```javascript
const countdown = new Countdown({
    targetDate: new Date('2026-01-01T00:00:00'),
    // ...
});
```

### 添加祝福语

编辑 `js/danmaku.js` 中的 `wishes` 数组：

```javascript
this.wishes = [
    "你的祝福语",
    // ...
];
```

### 修改颜色主题

编辑 `css/style.css` 中的 CSS 变量：

```css
:root {
    --accent-purple: #a855f7;
    --accent-cyan: #22d3ee;
    // ...
}
```

## 📄 License

MIT License - 随意使用和修改

---

**🎉 祝你新年快乐，万事如意！**
