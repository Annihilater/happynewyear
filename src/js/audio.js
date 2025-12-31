/**
 * 深度音效系统 - 完全照抄原网站实现
 * 使用 Web Audio API 生成烟花爆炸音效
 */

const DeepAudio = {
    ctx: null,
    enabled: false,
    volume: 0.3,  // 降低默认音量
    limiter: null,
    unlocked: false,  // 音频是否已解锁（移动端需要）
    
    init() {
        if (this.ctx) {
            this.resumeContext();
            this.enabled = true;
            return;
        }
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            this.ctx = new AudioContext();
            
            // 动态压缩器 - 防止爆音
            this.limiter = this.ctx.createDynamicsCompressor();
            this.limiter.threshold.value = -10;
            this.limiter.knee.value = 40;
            this.limiter.ratio.value = 12;
            this.limiter.connect(this.ctx.destination);
            
            this.enabled = true;
            
            // 移动端需要先解锁音频上下文
            this.unlockAudio();
        } catch (e) {
            console.warn('音频初始化失败:', e);
        }
    },
    
    // 解锁音频上下文（移动端必需）
    async unlockAudio() {
        if (!this.ctx || this.unlocked) return;
        
        try {
            // 方法1: 直接 resume
            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }
            
            // 方法2: 播放极短静音音频来"解锁"（iOS Safari 需要）
            if (this.ctx.state === 'suspended') {
                const buffer = this.ctx.createBuffer(1, 1, 22050);
                const source = this.ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(this.ctx.destination);
                source.start(0);
                source.stop(0);
                
                // 再次尝试 resume
                await this.ctx.resume();
            }
            
            this.unlocked = this.ctx.state === 'running';
        } catch (e) {
            console.warn('音频解锁失败:', e);
        }
    },
    
    // Resume 音频上下文
    async resumeContext() {
        if (!this.ctx) return false;
        
        try {
            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
                this.unlocked = this.ctx.state === 'running';
            }
            return this.ctx.state === 'running';
        } catch (e) {
            console.warn('音频恢复失败:', e);
            return false;
        }
    },
    
    // 检查音频是否可用
    isAudioAvailable() {
        return this.ctx && this.ctx.state === 'running';
    },
    
    // 完全照抄原网站的 playDeepExplosion
    async playDeepExplosion() {
        if (!this.enabled || !this.ctx) return;
        
        // 确保音频上下文已解锁（移动端）
        if (!this.unlocked || this.ctx.state === 'suspended') {
            await this.unlockAudio();
        }
        
        // 如果仍未解锁，尝试 resume
        if (this.ctx.state === 'suspended') {
            await this.resumeContext();
        }
        
        // 如果还是 suspended，说明用户未交互，直接返回
        if (this.ctx.state === 'suspended') {
            return;
        }
        
        const e = this.ctx.currentTime;
        
        // 第一层：低频正弦波 (深沉的隆隆声)
        const t = this.ctx.createOscillator();
        const i = this.ctx.createGain();
        t.type = "sine";
        t.frequency.setValueAtTime(50, e);
        t.frequency.exponentialRampToValueAtTime(20, e + 2.5);
        i.gain.setValueAtTime(1.5 * this.volume, e);
        i.gain.exponentialRampToValueAtTime(0.01, e + 5);
        t.connect(i);
        i.connect(this.limiter);
        t.start(e);
        t.stop(e + 5);
        
        // 第二层：白噪音 + 低通滤波 (爆炸的沙沙声)
        const n = 5 * this.ctx.sampleRate;
        const r = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
        const a = r.getChannelData(0);
        for (let x = 0; x < n; x++) {
            a[x] = 2 * Math.random() - 1;
        }
        const s = this.ctx.createBufferSource();
        s.buffer = r;
        const o = this.ctx.createBiquadFilter();
        o.type = "lowpass";
        o.frequency.setValueAtTime(150, e);
        o.frequency.exponentialRampToValueAtTime(30, e + 4);
        const l = this.ctx.createGain();
        l.gain.setValueAtTime(this.volume, e);
        l.gain.exponentialRampToValueAtTime(0.01, e + 4.5);
        s.connect(o);
        o.connect(l);
        l.connect(this.limiter);
        s.start(e);
        
        // 第三层：三角波冲击 (短促的"砰"声)
        const h = this.ctx.createOscillator();
        h.type = "triangle";
        const c = this.ctx.createGain();
        h.frequency.setValueAtTime(200, e);
        h.frequency.exponentialRampToValueAtTime(50, e + 0.1);
        c.gain.setValueAtTime(0.3 * this.volume, e);
        c.gain.exponentialRampToValueAtTime(0.01, e + 0.1);
        h.connect(c);
        c.connect(this.limiter);
        h.start(e);
        h.stop(e + 0.1);
    },
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },
    
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
};

window.DeepAudio = DeepAudio;
