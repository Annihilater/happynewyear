/**
 * 宇宙星空背景 - 缓慢移动的星星
 * 模拟静谧的宇宙星空，星星缓慢漂移和闪烁
 */

class Starfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 配置参数
        this.config = {
            starCount: 800,        // 星星数量
            driftSpeed: 0.05,      // 缓慢漂移速度
            twinkleSpeed: 0.01,    // 闪烁速度
        };
        
        this.stars = [];
        this.time = 0;
        
        this.init();
        this.bindEvents();
        this.animate();
    }
    
    init() {
        this.resize();
        this.createStars();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createStars(); // 重新创建星星适应新尺寸
        });
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.config.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                baseX: Math.random() * this.canvas.width, // 基准位置
                baseY: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,            // 大小
                opacity: Math.random() * 0.5 + 0.3,       // 基础不透明度
                twinklePhase: Math.random() * Math.PI * 2, // 闪烁相位
                twinkleSpeed: 0.5 + Math.random() * 1.5,  // 闪烁速度
                driftAngle: Math.random() * Math.PI * 2,  // 漂移方向
                driftRadius: 20 + Math.random() * 30,     // 漂移半径
                color: this.getRandomStarColor(),
            });
        }
    }
    
    getRandomStarColor() {
        const colors = [
            { r: 255, g: 255, b: 255 },  // 白色
            { r: 255, g: 228, b: 196 },  // 暖白
            { r: 176, g: 196, b: 222 },  // 浅蓝
            { r: 230, g: 230, b: 250 },  // 淡紫
            { r: 255, g: 250, b: 240 },  // 花白
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        this.time += 0.01;
        
        for (let star of this.stars) {
            // 缓慢漂移（圆周运动）
            const driftAngle = star.driftAngle + this.time * this.config.driftSpeed;
            star.x = star.baseX + Math.cos(driftAngle) * star.driftRadius;
            star.y = star.baseY + Math.sin(driftAngle) * star.driftRadius;
            
            // 边界处理
            if (star.x < -50) star.baseX += this.canvas.width + 100;
            if (star.x > this.canvas.width + 50) star.baseX -= this.canvas.width + 100;
            if (star.y < -50) star.baseY += this.canvas.height + 100;
            if (star.y > this.canvas.height + 50) star.baseY -= this.canvas.height + 100;
        }
    }
    
    draw() {
        // 完全清除背景（纯黑）
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let star of this.stars) {
            // 闪烁效果
            const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinklePhase);
            const currentOpacity = star.opacity + twinkle * 0.2;
            
            // 绘制发光效果
            const gradient = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.size * 2
            );
            gradient.addColorStop(0, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${currentOpacity})`);
            gradient.addColorStop(0.5, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${currentOpacity * 0.5})`);
            gradient.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // 中心亮点
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${currentOpacity * 1.2})`;
            this.ctx.fill();
        }
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    // 加速效果（用于烟花发射时） - 星空不变，只是占位API
    boost() {
        // 宇宙星空不需要boost效果
    }
}

// 导出到全局
window.Starfield = Starfield;
