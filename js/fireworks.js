/**
 * 3D烟花系统 - 使用Three.js WebGL
 * 完全模仿原网站 https://2026.xcodeman.com/
 */

class Firework3D {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.cfg = window.FireworkConfig || {};
        
        // 从配置读取参数
        const particles = this.cfg.particles || {};
        const physics = this.cfg.physics || {};
        
        // 基础参数
        this.x = config.x !== undefined ? config.x : (Math.random() - 0.5) * 50;
        this.z = config.z !== undefined ? config.z : (Math.random() - 0.5) * 50;
        this.targetY = config.targetY !== undefined ? config.targetY : 10 + Math.random() * 15;
        
        // 3D深度
        this.depth = config.depth !== undefined ? config.depth : Math.random();
        this.scale = 0.4 + this.depth * 0.8;
        this.speed = 0.15 + this.depth * 0.15;
        
        // 状态
        this.phase = 'rising';
        this.y = -5;
        this.particles = null;
        this.done = false;
        
        // 烟花类型
        this.types = ['sphere', 'ring', 'willow', 'chrysanthemum'];
        this.type = config.type || this.types[Math.floor(Math.random() * this.types.length)];
        
        // 颜色
        this.hue = Math.random() * 360;
        this.color = new THREE.Color().setHSL(this.hue / 360, 1, 0.6);
        
        // 参数
        const baseCount = particles.particleCount || 23000;
        this.particleCount = Math.floor(baseCount * this.scale);
        this.particleSize = (particles.particleSize || 0.8) * this.scale;
        this.fadeSpeed = particles.fadeSpeed || 0.00482;
        this.explosionForce = (physics.explosionForce || 3.3975) * this.scale;
        this.gravity = (physics.gravity || 0.00265) * this.scale;
        
        // 上升拖尾
        this.createRisingTrail();
    }
    
    createRisingTrail() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            size: 0.15,
            color: 0xffcc66,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const positions = [];
        for (let i = 0; i < 20; i++) {
            positions.push(this.x, this.y - i * 0.2, this.z);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.trail = new THREE.Points(geometry, material);
        this.scene.add(this.trail);
    }
    
    update() {
        if (this.done) return false;
        
        if (this.phase === 'rising') {
            this.y += this.speed;
            
            // 更新拖尾
            if (this.trail) {
                const positions = this.trail.geometry.attributes.position.array;
                for (let i = positions.length - 3; i >= 3; i -= 3) {
                    positions[i] = positions[i - 3];
                    positions[i + 1] = positions[i - 2];
                    positions[i + 2] = positions[i - 1];
                }
                positions[0] = this.x;
                positions[1] = this.y;
                positions[2] = this.z;
                this.trail.geometry.attributes.position.needsUpdate = true;
            }
            
            if (this.y >= this.targetY) {
                this.explode();
            }
        } else if (this.phase === 'exploding') {
            this.updateParticles();
            
            // 检查是否完成
            if (this.particleLife <= 0) {
                this.done = true;
                this.cleanup();
            }
        }
        
        return !this.done;
    }
    
    explode() {
        this.phase = 'exploding';
        this.particleLife = 150;
        
        // 移除拖尾
        if (this.trail) {
            this.scene.remove(this.trail);
            this.trail.geometry.dispose();
            this.trail.material.dispose();
            this.trail = null;
        }
        
        // 音效
        const audio = this.cfg.audio || {};
        if (audio.soundEnabled && window.DeepAudio && window.DeepAudio.enabled) {
            window.DeepAudio.playDeepExplosion();
        }
        
        // 创建粒子系统
        this.createParticles();
    }
    
    createParticles() {
        const geometry = new THREE.BufferGeometry();
        
        const positions = [];
        const velocities = [];
        const colors = [];
        const sizes = [];
        const lifetimes = [];
        
        // 根据类型生成粒子
        for (let i = 0; i < this.particleCount; i++) {
            let vx, vy, vz;
            
            if (this.type === 'sphere') {
                // 球形爆炸
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const force = this.explosionForce * (0.5 + Math.random() * 0.5);
                vx = force * Math.sin(phi) * Math.cos(theta);
                vy = force * Math.sin(phi) * Math.sin(theta);
                vz = force * Math.cos(phi);
            } else if (this.type === 'ring') {
                // 环形爆炸
                const theta = Math.random() * Math.PI * 2;
                const force = this.explosionForce * (0.7 + Math.random() * 0.4);
                vx = force * Math.cos(theta);
                vy = (Math.random() - 0.5) * force * 0.3;
                vz = force * Math.sin(theta);
            } else if (this.type === 'willow') {
                // 垂柳型
                const theta = Math.random() * Math.PI * 2;
                const force = this.explosionForce * (0.5 + Math.random() * 0.5);
                vx = force * Math.cos(theta) * 0.4;
                vy = force * (0.3 + Math.random() * 0.3);
                vz = force * Math.sin(theta) * 0.4;
            } else {
                // 菊花型
                const lines = 16;
                const lineIndex = Math.floor(i / (this.particleCount / lines));
                const theta = (lineIndex / lines) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
                const force = this.explosionForce * (0.3 + Math.random() * 0.8);
                vx = force * Math.cos(theta);
                vy = (Math.random() - 0.5) * force * 0.2;
                vz = force * Math.sin(theta);
            }
            
            positions.push(this.x, this.y, this.z);
            velocities.push(vx, vy, vz);
            
            // 颜色变化
            const hueVar = this.hue + (Math.random() - 0.5) * 60;
            const c = new THREE.Color().setHSL(hueVar / 360, 0.9 + Math.random() * 0.1, 0.5 + Math.random() * 0.2);
            colors.push(c.r, c.g, c.b);
            
            sizes.push(this.particleSize * (0.8 + Math.random() * 0.4));
            lifetimes.push(1.0);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        // 保存速度和生命
        this.velocities = velocities;
        this.lifetimes = lifetimes;
        
        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    updateParticles() {
        if (!this.particles) return;
        
        const positions = this.particles.geometry.attributes.position.array;
        const sizes = this.particles.geometry.attributes.size.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // 更新位置
            positions[i3] += this.velocities[i3];
            positions[i3 + 1] += this.velocities[i3 + 1];
            positions[i3 + 2] += this.velocities[i3 + 2];
            
            // 重力
            this.velocities[i3 + 1] -= this.gravity;
            
            // 空气阻力
            this.velocities[i3] *= 0.98;
            this.velocities[i3 + 1] *= 0.98;
            this.velocities[i3 + 2] *= 0.98;
            
            // 淡出
            this.lifetimes[i] -= this.fadeSpeed;
            if (this.lifetimes[i] < 0) this.lifetimes[i] = 0;
            
            // 粒子大小随生命值缩小
            sizes[i] *= 0.99;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.size.needsUpdate = true;
        this.particles.material.opacity = Math.max(0, this.particleLife / 150);
        
        this.particleLife--;
    }
    
    cleanup() {
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.particles = null;
        }
        if (this.trail) {
            this.scene.remove(this.trail);
            this.trail.geometry.dispose();
            this.trail.material.dispose();
            this.trail = null;
        }
    }
}

/**
 * Three.js烟花系统管理器
 */
class FireworkSystem {
    constructor(canvasId) {
        this.container = document.getElementById(canvasId);
        if (!this.container) {
            console.error('Container not found:', canvasId);
            return;
        }
        
        // 创建Three.js场景
        this.scene = new THREE.Scene();
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 30);
        this.camera.lookAt(0, 5, 0);
        
        // 创建WebGL渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // 烟花列表
        this.fireworks = [];
        this.mouseTrail = [];
        this.autoLaunch = true;
        this.lastLaunchTime = 0;
        
        // 响应式
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 开始渲染循环
        this.running = true;
        this.animate();
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    launch(config = {}) {
        const firework = new Firework3D(this.scene, {
            x: config.x !== undefined ? config.x : (Math.random() - 0.5) * 40,
            z: config.z !== undefined ? config.z : (Math.random() - 0.5) * 40,
            targetY: config.targetY !== undefined ? config.targetY : 8 + Math.random() * 12,
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
        // 将屏幕坐标转换为3D坐标
        const mouse = new THREE.Vector2();
        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = -(y / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // 在射线上选择一个点
        const distance = 15 + Math.random() * 10;
        const point = raycaster.ray.origin.clone().add(raycaster.ray.direction.multiplyScalar(distance));
        
        const firework = new Firework3D(this.scene, {
            x: point.x,
            z: point.z,
            targetY: point.y,
            depth: 0.7 + Math.random() * 0.3
        });
        firework.y = point.y;
        firework.explode();
        this.fireworks.push(firework);
    }
    
    updateMouseTrail(x, y) {
        // Mouse trail不需要在3D场景中实现，保持原有Canvas 2D实现
    }
    
    animate() {
        if (!this.running) return;
        
        // 更新所有烟花
        this.fireworks = this.fireworks.filter(fw => fw.update());
        
        // 自动发射
        if (this.autoLaunch) {
            const now = Date.now();
            const cfg = window.FireworkConfig;
            const modeConfig = cfg ? cfg.modes[cfg.currentMode] : { interval: 4000, burstCount: 1, burstDelay: 0 };
            
            if (now - this.lastLaunchTime > modeConfig.interval) {
                const count = modeConfig.burstCount || 1;
                for (let i = 0; i < count; i++) {
                    setTimeout(() => this.launch(), i * (modeConfig.burstDelay || 0));
                }
                this.lastLaunchTime = now;
            }
        }
        
        // 渲染
        this.renderer.render(this.scene, this.camera);
        
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        this.running = false;
        this.fireworks.forEach(fw => fw.cleanup());
        this.renderer.dispose();
    }
}

window.FireworkSystem = FireworkSystem;
