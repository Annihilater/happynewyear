/**
 * 3D烟花系统 - 基于CodePen源码
 * 来源：https://codepen.io/sabosugi/pen/ByzBXQW
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- 生成圆形Sprite纹理 ---
function getSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
}

const particleSprite = getSprite();

// --- 烟花类 ---
class Firework {
    constructor(scene, camera, config = {}) {
        this.scene = scene;
        this.camera = camera;
        this.isDead = false;
        this.phase = 'rocket';
        this.timer = 0;
        
        // 读取配置
        const cfg = window.FireworkConfig || {};
        const particles = cfg.particles || {};
        const physics = cfg.physics || {};
        
        this.particleCount = particles.particleCount || 23000;
        this.particleSize = particles.particleSize || 0.8;
        this.fadeSpeed = particles.fadeSpeed || 0.00482;
        this.explosionForce = physics.explosionForce || 3.3975;
        this.hoverDuration = physics.hoverDuration || 1.5;
        this.gravity = physics.gravity || 0.00265;
        this.friction = 0.95494;
        
        // 颜色系统（Mono/Dual/Tri）
        const rand = Math.random();
        const baseHue = Math.random();
        this.colors = [];
        
        if (rand < 0.33) {
            // 单色
            this.colors.push(new THREE.Color().setHSL(baseHue, 1.0, 0.6));
        } else if (rand < 0.66) {
            // 双色互补
            this.colors.push(new THREE.Color().setHSL(baseHue, 1.0, 0.6));
            this.colors.push(new THREE.Color().setHSL((baseHue + 0.5) % 1.0, 1.0, 0.5));
        } else {
            // 三色
            this.colors.push(new THREE.Color().setHSL(baseHue, 1.0, 0.6));
            this.colors.push(new THREE.Color().setHSL((baseHue + 0.33) % 1.0, 1.0, 0.6));
            this.colors.push(new THREE.Color().setHSL((baseHue + 0.66) % 1.0, 1.0, 0.6));
        }
        
        // 位置和速度
        const startX = config.x !== undefined ? config.x : (Math.random() - 0.5) * 150;
        const startZ = config.z !== undefined ? config.z : (Math.random() - 0.5) * 50;
        
        this.pos = new THREE.Vector3(startX, -80, startZ);
        this.vel = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            1.0 * (0.9 + Math.random() * 0.3),
            (Math.random() - 0.5) * 0.5
        );
        this.targetY = -10 + Math.random() * 30;
        
        // 创建火箭
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos.toArray(), 3));
        this.rocketMesh = new THREE.Points(geo, new THREE.PointsMaterial({
            size: 2.0,
            color: this.colors[0],
            map: particleSprite,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        }));
        scene.add(this.rocketMesh);
    }
    
    update(dt) {
        if (this.phase === 'rocket') {
            this.pos.add(this.vel);
            this.vel.y *= 0.99;
            this.rocketMesh.geometry.attributes.position.setXYZ(0, this.pos.x, this.pos.y, this.pos.z);
            this.rocketMesh.geometry.attributes.position.needsUpdate = true;
            
            if (this.vel.y < 0.2 || this.pos.y >= this.targetY) {
                this.explode();
            }
        } else {
            this.timer += dt;
            const positions = this.sparkSystem.geometry.attributes.position.array;
            const colors = this.sparkSystem.geometry.attributes.color.array;
            let aliveCount = 0;
            
            const isHovering = this.timer < this.hoverDuration;
            const gravityFactor = THREE.MathUtils.smoothstep(
                this.timer, 
                this.hoverDuration, 
                this.hoverDuration + 0.5
            );
            
            for (let i = 0; i < this.currentParticleCount; i++) {
                if (this.lifetimes[i] > 0) {
                    aliveCount++;
                    const i3 = i * 3;
                    
                    // 更新位置
                    positions[i3] += this.velocities[i3];
                    positions[i3 + 1] += this.velocities[i3 + 1];
                    positions[i3 + 2] += this.velocities[i3 + 2];
                    
                    if (isHovering) {
                        // 悬停阶段：高摩擦力
                        this.velocities[i3] *= this.friction;
                        this.velocities[i3 + 1] *= this.friction;
                        this.velocities[i3 + 2] *= this.friction;
                    } else {
                        // 下落阶段：重力+低摩擦力
                        this.velocities[i3 + 1] -= this.gravity * gravityFactor;
                        this.velocities[i3] *= 0.98;
                        this.velocities[i3 + 1] *= 0.98;
                        this.velocities[i3 + 2] *= 0.98;
                        this.lifetimes[i] -= this.fadeSpeed;
                    }
                    
                    // 更新颜色（淡出）
                    const alpha = Math.max(0, this.lifetimes[i]);
                    colors[i3] = this.baseColors[i3] * alpha * 1.5;
                    colors[i3 + 1] = this.baseColors[i3 + 1] * alpha * 1.5;
                    colors[i3 + 2] = this.baseColors[i3 + 2] * alpha * 1.5;
                }
            }
            
            this.sparkSystem.geometry.attributes.position.needsUpdate = true;
            this.sparkSystem.geometry.attributes.color.needsUpdate = true;
            
            if (aliveCount === 0) {
                this.cleanup();
            }
        }
    }
    
    explode() {
        // 音效
        const audio = window.FireworkConfig?.audio || {};
        if (audio.soundEnabled && window.DeepAudio && window.DeepAudio.enabled) {
            window.DeepAudio.playDeepExplosion();
        }
        
        this.scene.remove(this.rocketMesh);
        this.phase = 'explode';
        this.timer = 0;
        this.currentParticleCount = this.particleCount;
        
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(this.currentParticleCount * 3);
        const colors = new Float32Array(this.currentParticleCount * 3);
        this.baseColors = new Float32Array(this.currentParticleCount * 3);
        this.velocities = new Float32Array(this.currentParticleCount * 3);
        this.lifetimes = new Float32Array(this.currentParticleCount);
        
        const baseSpeed = this.explosionForce * (0.8 + Math.random() * 0.4);
        
        for (let i = 0; i < this.currentParticleCount; i++) {
            const i3 = i * 3;
            positions[i3] = this.pos.x;
            positions[i3 + 1] = this.pos.y;
            positions[i3 + 2] = this.pos.z;
            
            // 完美球形分布
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = baseSpeed * (0.8 + Math.random() * 0.4);
            
            this.velocities[i3] = speed * Math.sin(phi) * Math.cos(theta);
            this.velocities[i3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
            this.velocities[i3 + 2] = speed * Math.cos(phi);
            
            // 颜色选择+亮度变化
            const targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            const brightness = 0.5 + Math.random() * 0.8;
            
            this.baseColors[i3] = targetColor.r * brightness;
            this.baseColors[i3 + 1] = targetColor.g * brightness;
            this.baseColors[i3 + 2] = targetColor.b * brightness;
            
            colors[i3] = this.baseColors[i3];
            colors[i3 + 1] = this.baseColors[i3 + 1];
            colors[i3 + 2] = this.baseColors[i3 + 2];
            
            this.lifetimes[i] = 1.0;
        }
        
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        this.sparkSystem = new THREE.Points(geo, new THREE.PointsMaterial({
            size: this.particleSize,
            map: particleSprite,
            transparent: true,
            depthWrite: false,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(this.sparkSystem);
    }
    
    cleanup() {
        this.isDead = true;
        if (this.sparkSystem) {
            this.scene.remove(this.sparkSystem);
            this.sparkSystem.geometry.dispose();
            this.sparkSystem.material.dispose();
        }
        if (this.rocketMesh) {
            this.scene.remove(this.rocketMesh);
            this.rocketMesh.geometry.dispose();
            this.rocketMesh.material.dispose();
        }
    }
}

// --- 烟花系统管理器 ---
class FireworkSystem {
    constructor(canvasId) {
        this.container = document.getElementById(canvasId);
        if (!this.container) {
            console.error('Container not found:', canvasId);
            return;
        }
        
        // 场景
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002);
        
        // 相机
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            4000
        );
        this.camera.position.set(0, 0, 150);
        
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.container,
            antialias: false,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.autoClearColor = false;
        
        // 后期处理 - UnrealBloomPass（关键！）
        const renderScene = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.495,  // bloomStrength
            0.5,    // bloomRadius
            0.0     // bloomThreshold
        );
        
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(this.bloomPass);
        
        // 背景星星
        this.createStars();
        
        // 拖尾效果（全屏半透明quad）
        this.createTrailQuad();
        
        // 烟花列表
        this.fireworks = [];
        this.autoLaunch = true;
        this.lastLaunchTime = 0;
        this.nextLaunchDelay = 0;
        this.clock = new THREE.Clock();
        
        // 响应式
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 开始渲染
        this.running = true;
        this.animate();
    }
    
    createStars() {
        const starsGeo = new THREE.BufferGeometry();
        const starsCnt = 3000;
        const sPos = new Float32Array(starsCnt * 3);
        for (let i = 0; i < starsCnt * 3; i++) {
            sPos[i] = (Math.random() - 0.5) * 1200;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
        
        const starsMat = new THREE.PointsMaterial({
            size: 1.5,
            color: 0x888888,
            map: particleSprite,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        this.scene.add(new THREE.Points(starsGeo, starsMat));
    }
    
    createTrailQuad() {
        const fadeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.39707
        });
        
        const fullScreenQuad = new THREE.Mesh(
            new THREE.PlaneGeometry(4000, 4000),
            fadeMaterial
        );
        fullScreenQuad.position.z = this.camera.position.z - 50;
        fullScreenQuad.lookAt(this.camera.position);
        this.scene.add(fullScreenQuad);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.bloomPass.resolution.set(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }
    
    launch(config = {}) {
        const x = config.x !== undefined ? config.x : (Math.random() - 0.5) * 150;
        const firework = new Firework(this.scene, this.camera, { x, ...config });
        this.fireworks.push(firework);
    }
    
    launchMultiple(count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.launch(), i * 150);
        }
    }
    
    explodeAt(x, y) {
        // 将屏幕坐标转换为3D坐标
        const mouse = new THREE.Vector2();
        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = -(y / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const distance = 100 + Math.random() * 50;
        const point = raycaster.ray.origin.clone().add(
            raycaster.ray.direction.multiplyScalar(distance)
        );
        
        const firework = new Firework(this.scene, this.camera, { x: point.x });
        firework.pos.copy(point);
        firework.explode();
        this.fireworks.push(firework);
    }
    
    updateMouseTrail(x, y) {
        // 不需要鼠标拖尾
    }
    
    animate() {
        if (!this.running) return;
        
        const dt = this.clock.getDelta();
        
        // 自动发射
        if (this.autoLaunch) {
            const now = performance.now();
            const cfg = window.FireworkConfig;
            const modeConfig = cfg ? cfg.modes[cfg.currentMode] : { interval: 4000, burstCount: 1, burstDelay: 0 };
            
            // 舒缓模式：等待所有烟花消失
            const isRelaxedMode = cfg && cfg.currentMode === 'relaxed';
            const canLaunch = isRelaxedMode ? this.fireworks.length === 0 : true;
            
            if (canLaunch && now - this.lastLaunchTime > this.nextLaunchDelay) {
                this.lastLaunchTime = now;
                this.nextLaunchDelay = modeConfig.interval + Math.random() * 1000;
                
                const count = modeConfig.burstCount || 1;
                for (let i = 0; i < count; i++) {
                    setTimeout(() => this.launch(), i * (modeConfig.burstDelay || 150));
                }
            }
        }
        
        // 更新烟花
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.update(dt);
            if (fw.isDead) {
                this.fireworks.splice(i, 1);
            }
        }
        
        // 渲染（使用Bloom后期处理）
        this.composer.render();
        
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        this.running = false;
        this.fireworks.forEach(fw => fw.cleanup());
        this.renderer.dispose();
    }
}

window.FireworkSystem = FireworkSystem;
