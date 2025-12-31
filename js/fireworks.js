/**
 * 烟花特效系统
 * 包含发射、爆炸、粒子效果
 */

// 烟花粒子类
class Particle {
    constructor(x, y, color, velocity, gravity = 0.05, friction = 0.99, fade = 0.015) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.gravity = gravity;
        this.friction = friction;
        this.alpha = 1;
        this.fade = fade;
        this.decay = Math.random() * 0.03 + 0.01;
    }
    
    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.fade;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // 发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
    
    isAlive() {
        return this.alpha > 0.01;
    }
}

// 烟花类
class Firework {
    constructor(x, startY, targetY, color) {
        this.x = x;
        this.y = startY;
        this.targetY = targetY;
        this.color = color;
        this.velocity = { x: 0, y: -12 - Math.random() * 4 };
        this.particles = [];
        this.exploded = false;
        this.trail = [];
        this.trailLength = 5;
    }
    
    update() {
        if (!this.exploded) {
            // 保存拖尾位置
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }
            
            // 上升
            this.velocity.y += 0.2; // 重力减速
            this.y += this.velocity.y;
            this.x += this.velocity.x;
            
            // 到达目标高度或速度减为0时爆炸
            if (this.velocity.y >= -2 || this.y <= this.targetY) {
                this.explode();
            }
        }
        
        // 更新爆炸粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (!this.particles[i].isAlive()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    explode() {
        this.exploded = true;
        const particleCount = 80 + Math.floor(Math.random() * 50);
        const angleStep = (Math.PI * 2) / particleCount;
        
        // 随机选择爆炸形状
        const patterns = ['circle', 'star', 'heart', 'spiral'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = angleStep * i;
            let speed = 2 + Math.random() * 6;
            
            // 根据图案调整速度
            if (pattern === 'star' && i % 5 === 0) {
                speed *= 1.5;
            } else if (pattern === 'heart') {
                speed *= (1 + 0.5 * Math.sin(angle * 2));
            } else if (pattern === 'spiral') {
                speed *= (0.5 + (i / particleCount));
            }
            
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            
            // 使用主色或随机变化色
            let particleColor = this.color;
            if (Math.random() > 0.7) {
                particleColor = this.getRandomColor();
            }
            
            this.particles.push(new Particle(
                this.x,
                this.y,
                particleColor,
                velocity,
                0.04,
                0.98,
                0.012
            ));
        }
        
        // 添加闪光粒子
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.particles.push(new Particle(
                this.x,
                this.y,
                '#ffffff',
                { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
                0.02,
                0.95,
                0.03
            ));
        }
    }
    
    getRandomColor() {
        const colors = [
            '#ff4500', '#ff6b35', '#ffd700', '#ffec8b',
            '#ff69b4', '#ff1493', '#00ffff', '#00ff7f',
            '#7fff00', '#adff2f', '#ff00ff', '#da70d6',
            '#ffffff', '#fffacd'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    draw(ctx) {
        if (!this.exploded) {
            // 绘制上升的拖尾
            for (let i = 0; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 0.5;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            }
            
            // 绘制烟花主体
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.restore();
        }
        
        // 绘制爆炸粒子
        for (let particle of this.particles) {
            particle.draw(ctx);
        }
    }
    
    isFinished() {
        return this.exploded && this.particles.length === 0;
    }
}

// 烟花系统类
class FireworkSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.autoLaunch = true;
        this.launchInterval = null;
        this.soundEnabled = false;
        this.audioElement = null;
        
        // 烟花颜色
        this.colors = [
            '#ff4500', '#ff6347', '#ffa500', '#ffd700',
            '#ff69b4', '#ff1493', '#da70d6', '#ba55d3',
            '#00ffff', '#00ced1', '#7fffd4', '#00ff7f',
            '#adff2f', '#7fff00', '#ffffff', '#f0e68c'
        ];
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    // 发射单个烟花
    launch(x = null, y = null) {
        const launchX = x !== null ? x : Math.random() * this.canvas.width;
        const startY = this.canvas.height;
        const targetY = y !== null ? y : this.canvas.height * 0.2 + Math.random() * this.canvas.height * 0.3;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        this.fireworks.push(new Firework(launchX, startY, targetY, color));
        
        // 播放音效
        this.playSound();
    }
    
    // 批量发射烟花
    launchMultiple(count = 3) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.launch(), i * 200);
        }
    }
    
    // 播放音效
    playSound() {
        if (!this.soundEnabled || !this.audioElement) return;
        
        try {
            // 克隆音频以支持重叠播放
            const sound = this.audioElement.cloneNode();
            sound.volume = 0.3;
            sound.play().catch(() => {});
        } catch (e) {
            // 忽略音频播放错误
        }
    }
    
    // 启用音效
    enableSound(audioElement) {
        this.audioElement = audioElement;
        this.soundEnabled = true;
    }
    
    // 开始自动发射
    startAutoLaunch(interval = 1500) {
        if (this.launchInterval) return;
        
        this.launchInterval = setInterval(() => {
            if (this.autoLaunch && Math.random() > 0.3) {
                this.launch();
            }
        }, interval);
        
        // 额外的随机发射
        setInterval(() => {
            if (this.autoLaunch && Math.random() > 0.6) {
                this.launch();
            }
        }, 800);
    }
    
    // 停止自动发射
    stopAutoLaunch() {
        if (this.launchInterval) {
            clearInterval(this.launchInterval);
            this.launchInterval = null;
        }
    }
    
    update() {
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            this.fireworks[i].update();
            if (this.fireworks[i].isFinished()) {
                this.fireworks.splice(i, 1);
            }
        }
    }
    
    draw() {
        // 使用半透明黑色清除以产生拖尾效果
        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let firework of this.fireworks) {
            firework.draw(this.ctx);
        }
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 导出到全局
window.FireworkSystem = FireworkSystem;
