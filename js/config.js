/**
 * 烟花配置管理系统
 * 支持实时参数调节和中英文双语
 */

const FireworkConfig = {
    // 当前语言
    lang: 'zh',
    
    // 多语言文本
    i18n: {
        zh: {
            settings: '设置',
            particles: '粒子',
            physics: '物理',
            deepAudio: '深度音效',
            particleCount: '粒子数量',
            particleSize: '粒子大小',
            fadeSpeed: '淡出速度',
            explosionForce: '爆炸力度',
            hoverDuration: '悬停时间',
            gravity: '重力',
            soundEnabled: '启用音效',
            volume: '音量',
            language: '语言',
            mode: '模式',
            relaxed: '舒缓',
            intense: '激烈',
            relaxedDesc: '一个接一个，适合平时欣赏',
            intenseDesc: '快速连发，适合跨年倒数',
            schedule: '定时切换',
            addSchedule: '添加定时',
            noSchedule: '暂无定时任务',
            resetSettings: '重置为默认值',
            resetConfirm: '已重置为默认值'
        },
        en: {
            settings: 'Settings',
            particles: 'Particles',
            physics: 'Physics',
            deepAudio: 'Deep Audio',
            particleCount: 'particleCount',
            particleSize: 'particleSize',
            fadeSpeed: 'fadeSpeed',
            explosionForce: 'explosionForce',
            hoverDuration: 'hoverDuration',
            gravity: 'gravity',
            soundEnabled: 'soundEnabled',
            volume: 'volume',
            language: 'Language',
            mode: 'Mode',
            relaxed: 'Relaxed',
            intense: 'Intense',
            relaxedDesc: 'One by one, for relaxing',
            intenseDesc: 'Rapid burst, for countdown',
            schedule: 'Schedule',
            addSchedule: 'Add Timer',
            noSchedule: 'No scheduled tasks',
            resetSettings: 'Reset to Default',
            resetConfirm: 'Reset to default values'
        }
    },
    
    // 粒子参数 (原网站默认值)
    particles: {
        particleCount: 23000,     // 原网站默认23000
        particleSize: 0.8,        // 原网站默认0.8
        fadeSpeed: 0.00482        // 原网站默认0.00482
    },
    
    // 物理参数 (原网站默认值)
    physics: {
        explosionForce: 3.3975,   // 原网站默认3.3975
        hoverDuration: 1.5,       // 原网站默认1.5
        gravity: 0.00265          // 原网站默认0.00265
    },
    
    // 音频参数
    audio: {
        soundEnabled: true,
        volume: 0.5               // 原网站默认0.5
    },
    
    // 模式配置
    currentMode: 'relaxed',
    modes: {
        relaxed: {
            name: '舒缓模式',
            nameEn: 'Relaxed',
            interval: 2000,
            burstCount: 1,
            burstDelay: 0
        },
        intense: {
            name: '激烈模式',
            nameEn: 'Intense',
            interval: 600,
            burstCount: 3,
            burstDelay: 100
        }
    },
    
    // 定时任务
    scheduledTasks: [],
    
    // 获取翻译文本
    t(key) {
        return this.i18n[this.lang][key] || key;
    },
    
    // 切换语言
    toggleLang() {
        this.lang = this.lang === 'zh' ? 'en' : 'zh';
        this.saveToStorage();
        this.updateUI();
        return this.lang;
    },
    
    // 设置参数
    set(category, key, value) {
        if (this[category] && this[category][key] !== undefined) {
            this[category][key] = value;
            this.saveToStorage();
            this.onConfigChange(category, key, value);
        }
    },
    
    // 获取参数
    get(category, key) {
        return this[category] ? this[category][key] : undefined;
    },
    
    // 配置变化回调
    onConfigChange: function(category, key, value) {},
    
    // 切换模式
    setMode(mode) {
        if (this.modes[mode]) {
            this.currentMode = mode;
            this.saveToStorage();
            this.onModeChange(mode);
            return true;
        }
        return false;
    },
    
    // 模式变化回调
    onModeChange: function(mode) {},
    
    // UI更新回调
    updateUI: function() {},
    
    // 添加定时任务
    addScheduledTask(time, mode) {
        const task = {
            id: Date.now(),
            time: time,
            mode: mode,
            enabled: true
        };
        this.scheduledTasks.push(task);
        this.saveToStorage();
        this.setupTimers();
        return task;
    },
    
    // 删除定时任务
    removeScheduledTask(id) {
        this.scheduledTasks = this.scheduledTasks.filter(t => t.id !== id);
        this.saveToStorage();
        this.setupTimers();
    },
    
    // 设置定时器
    setupTimers() {
        if (this._timers) {
            this._timers.forEach(t => clearTimeout(t));
        }
        this._timers = [];
        
        const now = new Date();
        
        this.scheduledTasks.forEach(task => {
            if (!task.enabled) return;
            
            let targetTime;
            if (typeof task.time === 'string') {
                const [hours, minutes] = task.time.split(':').map(Number);
                targetTime = new Date();
                targetTime.setHours(hours, minutes, 0, 0);
                
                if (targetTime <= now) {
                    targetTime.setDate(targetTime.getDate() + 1);
                }
            } else {
                targetTime = new Date(task.time);
            }
            
            const delay = targetTime - now;
            if (delay > 0 && delay < 86400000) {
                const timer = setTimeout(() => {
                    this.setMode(task.mode);
                }, delay);
                this._timers.push(timer);
            }
        });
    },
    
    // 保存到本地存储
    saveToStorage() {
        const data = {
            lang: this.lang,
            particles: this.particles,
            physics: this.physics,
            audio: this.audio,
            currentMode: this.currentMode,
            scheduledTasks: this.scheduledTasks
        };
        localStorage.setItem('fireworkConfig', JSON.stringify(data));
    },
    
    // 从本地存储加载
    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('fireworkConfig'));
            if (data) {
                this.lang = data.lang || 'zh';
                if (data.particles) Object.assign(this.particles, data.particles);
                if (data.physics) Object.assign(this.physics, data.physics);
                if (data.audio) Object.assign(this.audio, data.audio);
                this.currentMode = data.currentMode || 'relaxed';
                this.scheduledTasks = data.scheduledTasks || [];
            }
        } catch (e) {
            console.warn('加载配置失败:', e);
        }
    },
    
    // 重置为默认值
    resetToDefault() {
        // 原网站默认值
        this.particles = {
            particleCount: 23000,
            particleSize: 0.8,
            fadeSpeed: 0.00482
        };
        this.physics = {
            explosionForce: 3.3975,
            hoverDuration: 1.5,
            gravity: 0.00265
        };
        this.audio = {
            soundEnabled: true,
            volume: 0.5
        };
        this.saveToStorage();
        return true;
    },
    
    // 初始化
    init() {
        this.loadFromStorage();
        this.setupTimers();
        setInterval(() => this.setupTimers(), 60000);
    }
};

window.FireworkConfig = FireworkConfig;
