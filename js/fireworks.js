/**
 * 3D烟花系统 - 优化版
 * 实现由远及近的立体爆炸效果
 */

class Firework {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.cfg = window.FireworkConfig || {};
        
        // 从配置读取参数
        const particles = this.cfg.particles || {};
        const physics = this.cfg.physics || {};
        
        // 基础参数
        this.x = config.x !== undefined ? config.x : Math.random() * canvas.width;
        this.y = canvas.height + 50;
        this.targetY = config.targetY !== undefined ? config.targetY : canvas.height * (0.15 + Math.random() * 0.35);
        
        // 3D深度
        this.depth = config.depth !== undefined ? config.depth : Math.random();
        this.scale = 0.4 + this.depth * 1.0;
        this.speed = 5 + this.depth * 5;
        
        // 状态
        this.phase = 'rising';
        this.particles = [];
        this.trail = [];
        this.time = 0;
        this.done = false;
        
        // 烟花类型
        this.types = ['sphere', 'ring', 'double', 'willow', 'chrysanthemum', 'palm', 'heart', 'star'];
        this.type = config.type || this.types[Math.floor(Math.random() * this.types.length)];
        
        // 配色方案
        this.colorSchemes = [
            { primary: '#ff6b6b', secondary: '#ffd93d', accent: '#ff8e3c' },
            { primary: '#4facfe', secondary: '#00f2fe', accent: '#a8edea' },
            { primary: '#ff9a9e', secondary: '#fecfef', accent: '#ffecd2' },
            { primary: '#a18cd1', secondary: '#fbc2eb', accent: '#f5576c' },
            { primary: '#00ff87', secondary: '#60efff', accent: '#ffd700' },
            { primary: '#ff0080', secondary: '#ff8c00', accent: '#ffe100' },
            { primary: '#ffffff', secondary: '#e0e0e0', accent: '#ffd700' },
            { primary: '#50ff50', secondary: '#90ff90', accent: '#ffffff' },
            { primary: '#ff1493', secondary: '#ff69b4', accent: '#ffb6c1' },
            { primary: '#00ffff', secondary: '#40e0d0', accent: '#7fffd4' },
        ];
        this.colors = this.colorSchemes[Math.floor(Math.random() * this.colorSchemes.length)];
        
        // 参数 - 从配置读取 (原网站默认值)
        const baseCount = particles.particleCount || 23000;
        // 每个烟花使用总粒子数的一小部分，保持性能
        this.particleCount = Math.floor((baseCount / 100) * this.scale * (0.8 + Math.random() * 0.4));
        this.particleSize = (particles.particleSize || 0.8) * this.scale;
        this.fadeSpeed = (particles.fadeSpeed || 0.00482) * (0.8 + Math.random() * 0.4);
        this.explosionForce = (physics.explosionForce || 3.3975) * this.scale * (0.8 + Math.random() * 0.4);
        this.gravity = (physics.gravity || 0.00265) * this.scale;
        this.hoverDuration = (physics.hoverDuration || 1.5) * 60;
        
        // 上升拖尾
        this.trailLength = 12;
    }
    
    update() {
        if (this.done) return false;
        
        this.time++;
        
        if (this.phase === 'rising') {
            this.y -= this.speed;
            
            // 添加拖尾
            this.trail.push({
                x: this.x + (Math.random() - 0.5) * 3,
                y: this.y,
                alpha: 1,
                size: 2.5 * this.scale
            });
            
            while (this.trail.length > this.trailLength) {
                this.trail.shift();
            }
            
            this.trail.forEach((t, i) => {
                t.alpha = (i / this.trail.length) * 0.7;
            });
            
            if (this.y <= this.targetY) {
                this.explode();
            }
        } else if (this.phase === 'exploding') {
            this.updateParticles();
            
            // 检查是否完成
            const allDone = this.particles.every(p => p.alpha <= 0.01);
            if (allDone || this.time > 600) {
                this.done = true;
                this.phase = 'done';
            }
        }
        
        return !this.done;
    }
    
    explode() {
        this.phase = 'exploding';
        this.trail = [];
        this.time = 0;
        
        // 音效
        const audio = this.cfg.audio || {};
        if (audio.soundEnabled && window.DeepAudio && window.DeepAudio.enabled) {
            window.DeepAudio.playDeepExplosion();
        }
        
        // 根据类型创建粒子
        switch (this.type) {
            case 'sphere': this.createSphereExplosion(); break;
            case 'ring': this.createRingExplosion(); break;
            case 'double': this.createDoubleExplosion(); break;
            case 'willow': this.createWillowExplosion(); break;
            case 'chrysanthemum': this.createChrysanthemumExplosion(); break;
            case 'palm': this.createPalmExplosion(); break;
            case 'heart': this.createHeartExplosion(); break;
            case 'star': this.createStarExplosion(); break;
            default: this.createSphereExplosion();
        }
    }
    
    // 球形爆炸
    createSphereExplosion() {
        for (let i = 0; i < this.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const elevation = Math.acos(2 * Math.random() - 1);
            const force = this.explosionForce * (0.5 + Math.random() * 0.5);
            
            this.particles.push(this.createParticle(
                force * Math.sin(elevation) * Math.cos(angle),
                force * Math.sin(elevation) * Math.sin(angle) - force * 0.3,
                force * Math.cos(elevation) * 0.3,
                this.getRandomColor()
            ));
        }
    }
    
    // 环形爆炸
    createRingExplosion() {
        const rings = 2 + Math.floor(Math.random() * 2);
        for (let r = 0; r < rings; r++) {
            const ringParticles = Math.floor(this.particleCount / rings);
            const ringForce = this.explosionForce * (0.7 + r * 0.25);
            
            for (let i = 0; i < ringParticles; i++) {
                const angle = (i / ringParticles) * Math.PI * 2 + Math.random() * 0.1;
                
                this.particles.push(this.createParticle(
                    ringForce * Math.cos(angle),
                    ringForce * Math.sin(angle) * 0.5 - ringForce * 0.2,
                    ringForce * 0.15 * (Math.random() - 0.5),
                    r === 0 ? this.colors.primary : this.colors.secondary
                ));
            }
        }
    }
    
    // 双层爆炸
    createDoubleExplosion() {
        // 内层
        for (let i = 0; i < this.particleCount * 0.4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const force = this.explosionForce * 0.5;
            
            const p = this.createParticle(
                force * Math.cos(angle) * (0.8 + Math.random() * 0.4),
                force * Math.sin(angle) * (0.8 + Math.random() * 0.4) - force * 0.3,
                force * (Math.random() - 0.5) * 0.4,
                this.colors.accent
            );
            p.fadeSpeed = this.fadeSpeed * 1.5;
            this.particles.push(p);
        }
        
        // 外层
        for (let i = 0; i < this.particleCount * 0.6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const force = this.explosionForce * (0.9 + Math.random() * 0.3);
            
            this.particles.push(this.createParticle(
                force * Math.cos(angle),
                force * Math.sin(angle) - force * 0.3,
                force * (Math.random() - 0.5) * 0.4,
                this.getRandomColor()
            ));
        }
    }
    
    // 垂柳型
    createWillowExplosion() {
        for (let i = 0; i < this.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const force = this.explosionForce * (0.6 + Math.random() * 0.5);
            
            const p = this.createParticle(
                force * Math.cos(angle) * 0.7,
                force * Math.sin(angle) * 0.4 - force * 0.15,
                force * (Math.random() - 0.5) * 0.25,
                this.getRandomColor()
            );
            p.gravity = this.gravity * 2.5;
            p.fadeSpeed = this.fadeSpeed * 0.5;
            p.trailLength = 20;
            this.particles.push(p);
        }
    }
    
    // 菊花型
    createChrysanthemumExplosion() {
        const lines = 12 + Math.floor(Math.random() * 8);
        const particlesPerLine = Math.floor(this.particleCount / lines);
        
        for (let l = 0; l < lines; l++) {
            const baseAngle = (l / lines) * Math.PI * 2;
            
            for (let i = 0; i < particlesPerLine; i++) {
                const progress = i / particlesPerLine;
                const force = this.explosionForce * (0.2 + progress * 0.9);
                const spread = 0.08;
                const angle = baseAngle + (Math.random() - 0.5) * spread;
                
                const p = this.createParticle(
                    force * Math.cos(angle),
                    force * Math.sin(angle) * 0.6 - force * 0.15,
                    force * (Math.random() - 0.5) * 0.2,
                    progress < 0.5 ? this.colors.primary : this.colors.secondary
                );
                p.fadeSpeed = this.fadeSpeed * (0.7 + progress * 0.5);
                this.particles.push(p);
            }
        }
    }
    
    // 棕榈型
    createPalmExplosion() {
        const branches = 6 + Math.floor(Math.random() * 4);
        
        for (let b = 0; b < branches; b++) {
            const baseAngle = (b / branches) * Math.PI * 2;
            const branchParticles = Math.floor(this.particleCount / branches);
            
            for (let i = 0; i < branchParticles; i++) {
                const progress = i / branchParticles;
                const force = this.explosionForce * (0.3 + progress * 0.8);
                const spread = progress * 0.4;
                const angle = baseAngle + (Math.random() - 0.5) * spread;
                
                const p = this.createParticle(
                    force * Math.cos(angle),
                    -force * 0.7 + progress * force * 0.4,
                    force * (Math.random() - 0.5) * 0.3,
                    progress < 0.4 ? this.colors.secondary : this.colors.primary
                );
                p.gravity = this.gravity * 1.8;
                this.particles.push(p);
            }
        }
    }
    
    // 心形
    createHeartExplosion() {
        for (let i = 0; i < this.particleCount; i++) {
            const t = (i / this.particleCount) * Math.PI * 2;
            // 心形参数方程
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            
            const scale = this.explosionForce * 0.15;
            const p = this.createParticle(
                hx * scale * (0.9 + Math.random() * 0.2),
                -hy * scale * (0.9 + Math.random() * 0.2),
                (Math.random() - 0.5) * this.explosionForce * 0.2,
                this.colors.primary
            );
            p.fadeSpeed = this.fadeSpeed * 0.7;
            this.particles.push(p);
        }
    }
    
    // 星形
    createStarExplosion() {
        const points = 5;
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (i / this.particleCount) * Math.PI * 2;
            const r = (i % 2 === 0) ? this.explosionForce : this.explosionForce * 0.5;
            
            this.particles.push(this.createParticle(
                r * Math.cos(angle * points) * (0.9 + Math.random() * 0.2),
                r * Math.sin(angle * points) * (0.9 + Math.random() * 0.2) - r * 0.2,
                (Math.random() - 0.5) * this.explosionForce * 0.3,
                i % 2 === 0 ? this.colors.primary : this.colors.accent
            ));
        }
    }
    
    createParticle(vx, vy, vz, color) {
        return {
            x: this.x,
            y: this.y,
            z: 0,
            vx: vx,
            vy: vy,
            vz: vz,
            color: color,
            alpha: 1,
            size: this.particleSize * (1 + Math.random() * 1.5),
            gravity: this.gravity,
            fadeSpeed: this.fadeSpeed,
            trail: [],
            trailLength: 6 + Math.floor(Math.random() * 6),
            friction: 0.985,
            twinkle: Math.random() > 0.75,
            sparkle: Math.random() > 0.9
        };
    }
    
    getRandomColor() {
        const colors = [this.colors.primary, this.colors.secondary, this.colors.accent];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateParticles() {
        this.particles.forEach(p => {
            if (p.alpha <= 0) return;
            
            // 保存拖尾
            if (p.alpha > 0.15) {
                p.trail.push({ x: p.x, y: p.y, alpha: p.alpha * 0.5 });
                while (p.trail.length > p.trailLength) {
                    p.trail.shift();
                }
            }
            
            // 物理更新
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            
            p.vy += p.gravity;
            
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.vz *= p.friction;
            
            // 淡出
            p.alpha -= p.fadeSpeed;
            if (p.alpha < 0) p.alpha = 0;
            
            // 闪烁
            if (p.twinkle && Math.random() > 0.92) {
                p.alpha = Math.min(1, p.alpha + 0.25);
            }
        });
    }
    
    draw(ctx) {
        const depthAlpha = 0.5 + this.depth * 0.5;
        
        if (this.phase === 'rising') {
            // 上升拖尾
            this.trail.forEach((t, i) => {
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 200, 100, ${t.alpha * depthAlpha})`;
                ctx.fill();
            });
            
            // 烟花头
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 6 * this.scale);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${depthAlpha})`);
            gradient.addColorStop(0.4, `rgba(255, 220, 100, ${depthAlpha * 0.8})`);
            gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, 6 * this.scale, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        } else if (this.phase === 'exploding') {
            this.particles.forEach(p => {
                if (p.alpha <= 0.01) return;
                
                const perspectiveScale = 1 + p.z * 0.008;
                const size = p.size * perspectiveScale;
                const alpha = p.alpha * depthAlpha;
                
                // 拖尾
                p.trail.forEach((t, i) => {
                    const trailProgress = i / p.trail.length;
                    const trailSize = size * (0.2 + trailProgress * 0.4);
                    const trailAlpha = t.alpha * trailProgress * 0.4;
                    
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, trailSize, 0, Math.PI * 2);
                    ctx.fillStyle = this.hexToRgba(p.color, trailAlpha * depthAlpha);
                    ctx.fill();
                });
                
                // 光晕
                const glowSize = size * 2.5;
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                gradient.addColorStop(0, this.hexToRgba(p.color, alpha));
                gradient.addColorStop(0.35, this.hexToRgba(p.color, alpha * 0.5));
                gradient.addColorStop(0.7, this.hexToRgba(p.color, alpha * 0.15));
                gradient.addColorStop(1, this.hexToRgba(p.color, 0));
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // 中心亮点
                if (p.sparkle || alpha > 0.5) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
                    ctx.fill();
                }
            });
        }
    }
    
    hexToRgba(hex, alpha) {
        if (hex.startsWith('rgba')) return hex;
        if (hex.startsWith('rgb')) {
            return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }
        
        let r = 255, g = 255, b = 255;
        if (hex.startsWith('#')) {
            const bigint = parseInt(hex.slice(1), 16);
            r = (bigint >> 16) & 255;
            g = (bigint >> 8) & 255;
            b = bigint & 255;
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

/**
 * 烟花系统管理器
 */
class FireworkSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        
        this.fireworks = [];
        this.mouseTrail = [];
        this.autoLaunch = true;
        this.lastLaunchTime = 0;
        this.launchInterval = 2000;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 开始动画循环
        this.running = true;
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    launch(config = {}) {
        if (!this.canvas) return;
        
        const firework = new Firework(this.canvas, {
            x: config.x !== undefined ? config.x : Math.random() * this.canvas.width,
            targetY: config.targetY !== undefined ? config.targetY : this.canvas.height * (0.12 + Math.random() * 0.35),
            depth: config.depth !== undefined ? config.depth : Math.random(),
            type: config.type
        });
        this.fireworks.push(firework);
    }
    
    launchMultiple(count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.launch({ depth: Math.random() });
            }, i * 80 + Math.random() * 150);
        }
    }
    
    explodeAt(x, y) {
        const depth = 0.7 + Math.random() * 0.3;
        const firework = new Firework(this.canvas, {
            x: x,
            targetY: y,
            depth: depth
        });
        firework.y = y;
        firework.explode();
        this.fireworks.push(firework);
    }
    
    updateMouseTrail(x, y) {
        this.mouseTrail.push({
            x: x,
            y: y,
            alpha: 1,
            size: 2 + Math.random() * 2,
            color: `hsl(${Math.random() * 60 + 30}, 100%, 65%)`,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 1.5 + 0.5
        });
        
        while (this.mouseTrail.length > 40) {
            this.mouseTrail.shift();
        }
    }
    
    animate() {
        if (!this.running || !this.ctx) return;
        
        // 半透明清除实现拖尾
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 鼠标拖尾
        this.mouseTrail = this.mouseTrail.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.04;
            p.alpha -= 0.025;
            
            if (p.alpha > 0) {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color.replace('65%)', `${65 * p.alpha}%)`).replace('hsl', 'hsla').replace(')', `, ${p.alpha})`);
                this.ctx.fill();
                return true;
            }
            return false;
        });
        
        // 按深度排序
        this.fireworks.sort((a, b) => a.depth - b.depth);
        
        // 更新和绘制烟花
        this.fireworks = this.fireworks.filter(fw => {
            const alive = fw.update();
            if (alive || fw.phase === 'exploding') {
                fw.draw(this.ctx);
            }
            return alive;
        });
        
        // 自动发射
        if (this.autoLaunch) {
            const now = Date.now();
            const cfg = window.FireworkConfig;
            const modeConfig = cfg ? cfg.modes[cfg.currentMode] : { interval: 2000, burstCount: 1, burstDelay: 0 };
            
            if (now - this.lastLaunchTime > modeConfig.interval) {
                const count = modeConfig.burstCount || 1;
                for (let i = 0; i < count; i++) {
                    setTimeout(() => this.launch(), i * (modeConfig.burstDelay || 0));
                }
                this.lastLaunchTime = now;
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        this.running = false;
    }
}

window.FireworkSystem = FireworkSystem;
