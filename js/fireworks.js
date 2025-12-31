/**
 * 烟花特效系统 - 照抄原网站风格
 * 更柔和的粒子效果，更自然的爆炸
 */

class FireworkSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.rockets = [];
        this.mouseTrail = [];
        this.autoLaunch = true;
        this.launchInterval = null;
        
        // 粒子配置
        this.config = {
            particleCount: 120,
            particleSize: 2.5,
            fadeSpeed: 0.012,
            gravity: 0.06,
            explosionForce: 8
        };
        
        // 颜色组合
        this.colorSets = [
            ['#ff6b6b', '#feca57', '#ff9ff3'],
            ['#54a0ff', '#5f27cd', '#00d2d3'],
            ['#ff9f43', '#ee5a24', '#ffeaa7'],
            ['#00cec9', '#81ecec', '#74b9ff'],
            ['#fd79a8', '#e84393', '#fdcb6e'],
            ['#55efc4', '#00b894', '#ffeaa7'],
            ['#a29bfe', '#6c5ce7', '#fd79a8'],
            ['#ffffff', '#dfe6e9', '#b2bec3']
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
    
    // 创建粒子纹理渐变
    createParticleGradient(x, y, radius, color) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(1, 'transparent');
        return gradient;
    }
    
    // 发射火箭
    launch(x = null, targetY = null) {
        const rocket = {
            x: x !== null ? x : Math.random() * this.canvas.width,
            y: this.canvas.height + 10,
            targetY: targetY !== null ? targetY : this.canvas.height * 0.15 + Math.random() * this.canvas.height * 0.3,
            velocity: { x: (Math.random() - 0.5) * 3, y: -12 - Math.random() * 5 },
            colors: this.colorSets[Math.floor(Math.random() * this.colorSets.length)],
            trail: [],
            alive: true
        };
        this.rockets.push(rocket);
    }
    
    // 批量发射
    launchMultiple(count = 3) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.launch(), i * 100);
        }
    }
    
    // 在指定位置爆炸（点击效果）
    explodeAt(x, y) {
        const colors = this.colorSets[Math.floor(Math.random() * this.colorSets.length)];
        this.createExplosion(x, y, colors);
        
        if (window.DeepAudio && window.DeepAudio.enabled) {
            window.DeepAudio.playDeepExplosion();
        }
    }
    
    // 创建爆炸粒子
    createExplosion(x, y, colors) {
        const count = this.config.particleCount + Math.floor(Math.random() * 60);
        
        for (let i = 0; i < count; i++) {
            // 球形分布
            const angle = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const force = this.config.explosionForce * (0.5 + Math.random() * 0.8);
            
            const velocity = {
                x: force * Math.sin(phi) * Math.cos(angle),
                y: force * Math.sin(phi) * Math.sin(angle) - 2 // 稍微向上偏移
            };
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const brightness = 0.7 + Math.random() * 0.3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: velocity.x,
                vy: velocity.y,
                color: color,
                alpha: 1,
                size: this.config.particleSize * (0.5 + Math.random()),
                brightness: brightness,
                decay: this.config.fadeSpeed * (0.8 + Math.random() * 0.4),
                trail: []
            });
        }
        
        // 添加闪光粒子
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: '#ffffff',
                alpha: 1,
                size: 1.5,
                brightness: 1,
                decay: 0.04,
                trail: []
            });
        }
    }
    
    // 更新鼠标拖尾
    updateMouseTrail(mouseX, mouseY) {
        // 添加新粒子
        for (let i = 0; i < 2; i++) {
            this.mouseTrail.push({
                x: mouseX + (Math.random() - 0.5) * 10,
                y: mouseY + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 1,
                alpha: 0.8,
                size: 1 + Math.random() * 2,
                color: this.getRandomTrailColor(),
                decay: 0.02
            });
        }
        
        // 限制拖尾粒子数量
        if (this.mouseTrail.length > 100) {
            this.mouseTrail = this.mouseTrail.slice(-100);
        }
    }
    
    getRandomTrailColor() {
        const colors = ['#ff6b6b', '#feca57', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#fd79a8', '#55efc4'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 开始自动发射
    startAutoLaunch(interval = 800) {
        if (this.launchInterval) return;
        
        this.launchInterval = setInterval(() => {
            if (this.autoLaunch) {
                this.launch();
            }
        }, interval);
        
        // 随机额外发射
        setInterval(() => {
            if (this.autoLaunch && Math.random() > 0.4) {
                this.launch();
            }
        }, 500);
    }
    
    update() {
        // 更新火箭
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            
            // 保存拖尾
            rocket.trail.push({ x: rocket.x, y: rocket.y });
            if (rocket.trail.length > 10) rocket.trail.shift();
            
            // 移动
            rocket.velocity.y += 0.12;
            rocket.x += rocket.velocity.x;
            rocket.y += rocket.velocity.y;
            
            // 爆炸条件
            if (rocket.velocity.y >= -1 || rocket.y <= rocket.targetY) {
                this.createExplosion(rocket.x, rocket.y, rocket.colors);
                
                if (window.DeepAudio && window.DeepAudio.enabled) {
                    window.DeepAudio.playDeepExplosion();
                }
                
                this.rockets.splice(i, 1);
            }
        }
        
        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // 保存拖尾
            if (p.trail.length < 4) {
                p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
            } else {
                p.trail.shift();
                p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
            }
            
            // 物理更新
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.vy += this.config.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            
            if (p.alpha <= 0.01) {
                this.particles.splice(i, 1);
            }
        }
        
        // 更新鼠标拖尾
        for (let i = this.mouseTrail.length - 1; i >= 0; i--) {
            const p = this.mouseTrail[i];
            p.vy += 0.1;
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            
            if (p.alpha <= 0) {
                this.mouseTrail.splice(i, 1);
            }
        }
    }
    
    draw() {
        // 半透明清除，产生拖尾效果
        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.12)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制火箭拖尾
        for (const rocket of this.rockets) {
            for (let i = 0; i < rocket.trail.length; i++) {
                const t = rocket.trail[i];
                const alpha = (i / rocket.trail.length) * 0.6;
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
                this.ctx.fillStyle = rocket.colors[0];
                this.ctx.fill();
                this.ctx.restore();
            }
            
            // 绘制火箭头
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = rocket.colors[0];
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // 绘制爆炸粒子
        for (const p of this.particles) {
            // 绘制拖尾
            for (let i = 0; i < p.trail.length; i++) {
                const t = p.trail[i];
                const alpha = (i / p.trail.length) * t.alpha * 0.3;
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(t.x, t.y, p.size * 0.5, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
                this.ctx.restore();
            }
            
            // 绘制粒子
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha * p.brightness;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // 绘制鼠标拖尾
        for (const p of this.mouseTrail) {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.FireworkSystem = FireworkSystem;
