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
        this.z = config.z !== undefined ? config.z : (-15 - Math.random() * 85); // Z轴深度：-15到-100
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
        
        // 烟花类型 - 全部使用球形以保持完整效果
        this.type = config.type || 'sphere';
        
        // 颜色
        this.hue = Math.random() * 360;
        this.color = new THREE.Color().setHSL(this.hue / 360, 1, 0.6);
        
        // 参数 - 根据深度调整
        const baseCount = particles.particleCount || 23000;
        this.particleCount = Math.floor(baseCount * this.scale);
        
        // 粒子大小：深度越大（离相机越近）粒子越大
        const sizeMultiplier = 1.5 + (1 - this.depth) * 2.5; // 近处烟花粒子更大，基础增大
        this.particleSize = (particles.particleSize || 0.8) * this.scale * sizeMultiplier;
        
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
        this.particleLife = 400; // 延长生命周期：150 → 400帧（约6.7秒）
        this.time = 0;
        
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
        
        // 完美球形爆炸 - 使用Fibonacci球面分布算法确保均匀
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const angleIncrement = Math.PI * 2 * goldenRatio;
        
        for (let i = 0; i < this.particleCount; i++) {
            // Fibonacci 球面分布 + 随机扰动
            const t = i / this.particleCount;
            const phi = Math.acos(1 - 2 * t) + (Math.random() - 0.5) * 0.2;
            const theta = angleIncrement * i + (Math.random() - 0.5) * 0.3;
            
            // 随机力度，产生多层球壳效果
            // 远处烟花爆炸力度更大，确保能看到完整圆圈
            const forceMultiplier = 1 + this.depth * 1.5; // 远处（depth大）力度更大
            const force = this.explosionForce * forceMultiplier * (0.5 + Math.random() * 0.6);
            
            const vx = force * Math.sin(phi) * Math.cos(theta);
            const vy = force * Math.sin(phi) * Math.sin(theta);
            const vz = force * Math.cos(phi);
            
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
        
        // 使用自定义Shader Material实现水滴形粒子
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute float size;
                attribute float lifetime;
                varying vec3 vColor;
                varying float vLifetime;
                varying vec3 vVelocity;
                
                void main() {
                    vColor = color;
                    vLifetime = lifetime;
                    vVelocity = velocity;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // 根据速度动态调整大小（快速移动的粒子更大）
                    float speedFactor = 1.0 + length(velocity) * 0.05;
                    gl_PointSize = size * speedFactor * (400.0 / -mvPosition.z); // 增大基础尺寸
                    
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vLifetime;
                varying vec3 vVelocity;
                
                void main() {
                    // 中心点坐标 (-0.5 到 0.5)
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    
                    // 计算速度大小，用于拉伸
                    float speed = length(vVelocity);
                    float speedFactor = clamp(speed * 0.3, 0.0, 2.0);
                    
                    // 水滴形状：上部圆润，下部尖锐（拉伸）
                    // Y轴拉伸形成水滴
                    float yStretch = 1.0 + speedFactor * 1.5;
                    vec2 dropCoord = vec2(coord.x, coord.y * yStretch);
                    
                    // 计算到中心的距离
                    float dist = length(dropCoord);
                    
                    // 水滴主体（圆形到椭圆）
                    float dropShape = smoothstep(0.5, 0.0, dist);
                    
                    // 尾部拖尾（向下延伸）
                    float tail = 0.0;
                    if (coord.y > 0.0) {
                        // 尾部逐渐变细
                        float tailWidth = 0.3 * (1.0 - coord.y * 2.0);
                        float tailDist = abs(coord.x) / max(tailWidth, 0.01);
                        tail = smoothstep(1.0, 0.0, tailDist) * smoothstep(1.0, 0.0, coord.y * 2.0);
                    }
                    
                    // 组合形状
                    float shape = max(dropShape, tail * 0.7);
                    
                    // 3D高光效果（模拟立体感）
                    vec2 highlightPos = coord - vec2(-0.15, -0.15); // 高光偏移
                    float highlight = smoothstep(0.25, 0.0, length(highlightPos)) * 0.8;
                    
                    // 核心明亮区域
                    float core = smoothstep(0.3, 0.0, dist) * 1.5;
                    
                    // 外层光晕
                    float glow = smoothstep(0.55, 0.3, dist) * 0.5;
                    
                    // 总亮度
                    float brightness = shape + core + glow + highlight;
                    
                    // 颜色混合（增加亮度和饱和度）
                    vec3 finalColor = vColor * (0.8 + brightness * 0.8);
                    
                    // 添加白色高光
                    finalColor = mix(finalColor, vec3(1.0), highlight * 0.5);
                    
                    // 透明度
                    float alpha = shape * vLifetime * 0.95;
                    
                    if (alpha < 0.01) discard;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // 添加velocity属性用于shader
        const velocityAttr = new THREE.Float32BufferAttribute(velocities, 3);
        const sizeAttr = new THREE.Float32BufferAttribute(sizes, 1);
        const lifetimeAttr = new THREE.Float32BufferAttribute(lifetimes, 1);
        
        geometry.setAttribute('velocity', velocityAttr);
        geometry.setAttribute('size', sizeAttr);
        geometry.setAttribute('lifetime', lifetimeAttr);
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createTrails() {
        // 为每个粒子创建拖尾线段
        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = [];
        const trailColors = [];
        
        // 每个粒子有一个拖尾（起点到终点）
        for (let i = 0; i < this.particleCount; i++) {
            // 拖尾起点（当前位置）
            trailPositions.push(this.x, this.y, this.z);
            // 拖尾终点（稍后会更新）
            trailPositions.push(this.x, this.y, this.z);
            
            // 颜色（从粒子复制）
            const color = this.particles.geometry.attributes.color.array;
            const i3 = i * 3;
            trailColors.push(color[i3], color[i3 + 1], color[i3 + 2]);
            trailColors.push(color[i3], color[i3 + 1], color[i3 + 2]);
        }
        
        trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
        trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));
        
        const trailMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            linewidth: 2 // 注意：WebGL不支持，但保留
        });
        
        this.trails = new THREE.LineSegments(trailGeometry, trailMaterial);
        this.scene.add(this.trails);
        
        // 存储历史位置用于拖尾
        this.particleHistory = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particleHistory.push([
                { x: this.x, y: this.y, z: this.z }
            ]);
        }
    }
    
    updateParticles() {
        if (!this.particles) return;
        
        this.time++;
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.geometry.attributes.velocity.array;
        const sizes = this.particles.geometry.attributes.size.array;
        const lifetimeAttr = this.particles.geometry.attributes.lifetime.array;
        
        // 分阶段物理：
        // 0-80帧：快速爆炸扩散（高阻力）
        // 80-400帧：缓慢自由落体（低阻力，重力作用）
        const explosionPhase = this.time < 80;
        const friction = explosionPhase ? 0.92 : 0.985; // 爆炸阶段高阻力，落体阶段低阻力
        const gravityMultiplier = explosionPhase ? 0.3 : 1.5; // 爆炸阶段轻微重力，落体阶段正常重力
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // 更新位置
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];
            
            // 重力（Y方向向下）
            velocities[i3 + 1] -= this.gravity * gravityMultiplier;
            
            // 空气阻力
            velocities[i3] *= friction;
            velocities[i3 + 1] *= friction;
            velocities[i3 + 2] *= friction;
            
            // 更新velocity属性（shader需要）
            this.velocities[i3] = velocities[i3];
            this.velocities[i3 + 1] = velocities[i3 + 1];
            this.velocities[i3 + 2] = velocities[i3 + 2];
            
            // 淡出：前300帧保持，300-400帧淡出
            if (this.time > 300) {
                this.lifetimes[i] -= this.fadeSpeed * 3; // 最后100帧快速淡出
            } else {
                this.lifetimes[i] -= this.fadeSpeed * 0.3; // 前期缓慢淡出
            }
            if (this.lifetimes[i] < 0) this.lifetimes[i] = 0;
            
            // 更新lifetime属性
            lifetimeAttr[i] = this.lifetimes[i];
            
            // 粒子大小：前期保持，后期缩小
            if (this.time > 200) {
                sizes[i] *= 0.995;
            }
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.velocity.needsUpdate = true;
        this.particles.geometry.attributes.size.needsUpdate = true;
        this.particles.geometry.attributes.lifetime.needsUpdate = true;
        
        // 更新时间uniform
        if (this.particles.material.uniforms) {
            this.particles.material.uniforms.time.value = this.time * 0.01;
        }
        
        this.particleLife--;
    }
    
    cleanup() {
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            if (this.particles.material.dispose) {
                this.particles.material.dispose();
            }
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
        
        // 创建相机 - 调整位置让烟花有远近变化
        this.camera = new THREE.PerspectiveCamera(
            65,  // 视野角度稍微缩小，让远处烟花更集中
            window.innerWidth / window.innerHeight,
            0.1,
            300  // 更远的渲染距离
        );
        // 相机位置：向后退更远，向上看，这样能看到更多烟花
        this.camera.position.set(0, 5, 35);
        this.camera.lookAt(0, 12, -50);
        
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
        // 随机深度 - 权重偏向远处烟花（更容易看全）
        const depth = config.depth !== undefined ? config.depth : Math.pow(Math.random(), 0.6); // 指数分布，偏向大值
        
        // Z轴范围：-15（很近）到 -100（很远）
        // 大部分烟花在 -50 到 -100 之间（远处，能看全）
        const zPos = -15 - depth * 85;
        
        // X轴范围根据深度调整
        const xRange = 30 + depth * 40;
        
        const firework = new Firework3D(this.scene, {
            x: config.x !== undefined ? config.x : (Math.random() - 0.5) * xRange,
            z: config.z !== undefined ? config.z : zPos,
            targetY: config.targetY !== undefined ? config.targetY : 10 + Math.random() * 15,
            depth: depth,
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
            
            // 舒缓模式：等待所有烟花消失后再发射
            // 激烈模式：按时间间隔发射
            const isRelaxedMode = cfg && cfg.currentMode === 'relaxed';
            const canLaunch = isRelaxedMode ? this.fireworks.length === 0 : true;
            
            if (canLaunch && now - this.lastLaunchTime > modeConfig.interval) {
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
