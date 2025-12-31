/**
 * 星空背景效果 - 3D飞行穿梭效果
 * 模拟太空飞行，星星从中心向四周发散
 */

class Starfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 配置参数
        this.config = {
            starCount: 1000,      // 星星数量
            speed: 3,             // 飞行速度
            maxDepth: 1500,       // 最大深度
            starColor: '#ffffff', // 星星颜色
            trailLength: 0.5,     // 拖尾长度
        };
        
        this.stars = [];
        this.centerX = 0;
        this.centerY = 0;
        
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
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
        });
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.config.starCount; i++) {
            this.stars.push(this.createStar());
        }
    }
    
    createStar() {
        return {
            x: (Math.random() - 0.5) * this.canvas.width * 2,
            y: (Math.random() - 0.5) * this.canvas.height * 2,
            z: Math.random() * this.config.maxDepth,
            prevZ: 0,
            color: this.getRandomStarColor(),
        };
    }
    
    getRandomStarColor() {
        const colors = [
            '#ffffff',  // 白色
            '#ffe4c4',  // 暖白
            '#b0c4de',  // 浅蓝
            '#e6e6fa',  // 淡紫
            '#87ceeb',  // 天蓝
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        for (let star of this.stars) {
            // 保存前一帧的z值用于计算拖尾
            star.prevZ = star.z;
            
            // 向前移动（z减小）
            star.z -= this.config.speed;
            
            // 如果星星飞出屏幕，重置到远处
            if (star.z <= 0) {
                star.x = (Math.random() - 0.5) * this.canvas.width * 2;
                star.y = (Math.random() - 0.5) * this.canvas.height * 2;
                star.z = this.config.maxDepth;
                star.prevZ = this.config.maxDepth;
                star.color = this.getRandomStarColor();
            }
        }
    }
    
    draw() {
        // 清除画布，使用带透明度的黑色实现拖尾效果
        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let star of this.stars) {
            // 透视投影计算屏幕坐标
            const k = 128 / star.z;
            const x = star.x * k + this.centerX;
            const y = star.y * k + this.centerY;
            
            // 计算前一帧的位置（用于拖尾）
            const prevK = 128 / star.prevZ;
            const prevX = star.x * prevK + this.centerX;
            const prevY = star.y * prevK + this.centerY;
            
            // 根据深度计算大小和亮度
            const size = (1 - star.z / this.config.maxDepth) * 3;
            const opacity = (1 - star.z / this.config.maxDepth) * 0.8 + 0.2;
            
            // 只绘制在屏幕范围内的星星
            if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
                // 绘制拖尾线条
                this.ctx.beginPath();
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.strokeStyle = star.color;
                this.ctx.globalAlpha = opacity * 0.5;
                this.ctx.lineWidth = size * 0.5;
                this.ctx.stroke();
                
                // 绘制星星本体
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = star.color;
                this.ctx.globalAlpha = opacity;
                this.ctx.fill();
            }
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    // 设置速度
    setSpeed(speed) {
        this.config.speed = speed;
    }
    
    // 加速效果（用于烟花发射时）
    boost() {
        const originalSpeed = this.config.speed;
        this.config.speed = 15;
        setTimeout(() => {
            this.config.speed = originalSpeed;
        }, 300);
    }
}

// 导出到全局
window.Starfield = Starfield;
