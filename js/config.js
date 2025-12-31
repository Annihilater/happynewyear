/**
 * 配置管理系统
 * 管理烟花模式、定时切换等设置
 */

const FireworkConfig = {
    // 当前模式: 'relaxed' 或 'intense'
    currentMode: 'relaxed',
    
    // 模式配置
    modes: {
        relaxed: {
            name: '舒缓模式',
            description: '一个接一个，适合平时欣赏',
            interval: 2000,      // 2秒一个
            burstCount: 1,       // 每次1个
            burstDelay: 0        // 无延迟
        },
        intense: {
            name: '激烈模式',
            description: '2-3个快速连发，适合跨年倒数',
            interval: 800,       // 0.8秒一波
            burstCount: 3,       // 每次2-3个
            burstDelay: 150      // 连发间隔150ms
        }
    },
    
    // 定时任务列表
    scheduledTasks: [],
    
    // 获取当前模式配置
    getCurrentConfig() {
        return this.modes[this.currentMode];
    },
    
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
    
    // 模式切换回调
    onModeChange: function(mode) {},
    
    // 添加定时任务
    addScheduledTask(time, mode) {
        const task = {
            id: Date.now(),
            time: time,  // 格式: "HH:MM" 或 Date对象
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
        // 清除现有定时器
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
                
                // 如果时间已过，设置为明天
                if (targetTime <= now) {
                    targetTime.setDate(targetTime.getDate() + 1);
                }
            } else {
                targetTime = new Date(task.time);
            }
            
            const delay = targetTime - now;
            if (delay > 0) {
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
                this.currentMode = data.currentMode || 'relaxed';
                this.scheduledTasks = data.scheduledTasks || [];
            }
        } catch (e) {
            console.warn('加载配置失败:', e);
        }
    },
    
    // 初始化
    init() {
        this.loadFromStorage();
        this.setupTimers();
        
        // 每分钟检查一次定时任务
        setInterval(() => this.setupTimers(), 60000);
    }
};

window.FireworkConfig = FireworkConfig;
