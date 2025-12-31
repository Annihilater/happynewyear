/**
 * 主逻辑文件
 * 初始化所有模块并处理交互
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== 初始化配置 ====================
    FireworkConfig.init();
    
    // ==================== 初始化模块 ====================
    
    // 星空背景
    const starfield = new Starfield('starfield');
    
    // 烟花系统
    const fireworks = new FireworkSystem('fireworks');
    
    // 倒计时
    const countdown = new Countdown({
        targetDate: new Date('2026-01-01T00:00:00'),
        onComplete: () => {
            // 跨年时自动切换到激烈模式
            FireworkConfig.setMode('intense');
            celebrateNewYear();
        }
    });
    
    // 弹幕系统
    const danmaku = new Danmaku('danmaku-container');
    
    // ==================== 烟花模式控制 ====================
    
    let launchInterval = null;
    
    function applyFireworkMode(mode) {
        const config = FireworkConfig.modes[mode];
        
        // 清除现有定时器
        if (launchInterval) {
            clearInterval(launchInterval);
        }
        
        // 设置新的发射模式
        fireworks.autoLaunch = true;
        
        launchInterval = setInterval(() => {
            if (!fireworks.autoLaunch) return;
            
            // 根据模式发射烟花
            for (let i = 0; i < config.burstCount; i++) {
                setTimeout(() => {
                    fireworks.launch();
                }, i * config.burstDelay);
            }
        }, config.interval);
        
        // 更新UI
        updateModeDisplay(mode);
    }
    
    function updateModeDisplay(mode) {
        const display = document.getElementById('current-mode-display');
        const modeRadios = document.querySelectorAll('input[name="firework-mode"]');
        
        if (display) {
            display.textContent = FireworkConfig.modes[mode].name;
        }
        
        modeRadios.forEach(radio => {
            radio.checked = radio.value === mode;
        });
    }
    
    // 监听模式变化
    FireworkConfig.onModeChange = (mode) => {
        applyFireworkMode(mode);
    };
    
    // ==================== 音频控制 ====================
    
    const overlay = document.getElementById('audio-overlay');
    const soundToggle = document.getElementById('sound-toggle');
    let audioInitialized = false;
    
    function initAudio() {
        if (!audioInitialized && window.DeepAudio) {
            window.DeepAudio.init();
            audioInitialized = true;
        }
    }
    
    function toggleSound() {
        initAudio();
        
        if (window.DeepAudio) {
            const enabled = window.DeepAudio.toggle();
            
            if (enabled) {
                soundToggle.classList.remove('muted');
                soundToggle.title = '关闭音效';
            } else {
                soundToggle.classList.add('muted');
                soundToggle.title = '开启音效';
            }
            
            return enabled;
        }
        return false;
    }
    
    // 点击覆盖层启用音频
    overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.classList.add('hidden');
        
        // 初始化并启用音效
        initAudio();
        if (window.DeepAudio) {
            window.DeepAudio.enabled = true;
            soundToggle.classList.remove('muted');
        }
        
        // 应用当前模式并开始发射
        applyFireworkMode(FireworkConfig.currentMode);
        
        // 立即发射几个烟花
        fireworks.launchMultiple(5);
        starfield.boost();
    });
    
    // 音量开关按钮
    soundToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSound();
    });
    
    // 默认静音状态
    soundToggle.classList.add('muted');
    
    // 如果用户没点击覆盖层也启动烟花（静音模式）
    setTimeout(() => {
        if (!overlay.classList.contains('hidden')) {
            // 用户还没点击，静默启动
            applyFireworkMode(FireworkConfig.currentMode);
        }
    }, 3000);
    
    // ==================== 设置面板 ====================
    
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');
    
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.remove('hidden');
        settingsPanel.classList.add('visible');
        updateModeDisplay(FireworkConfig.currentMode);
        renderScheduleList();
    });
    
    closeSettings.addEventListener('click', () => {
        settingsPanel.classList.remove('visible');
        settingsPanel.classList.add('hidden');
    });
    
    // 点击面板外关闭
    document.addEventListener('click', (e) => {
        if (settingsPanel.classList.contains('visible') && 
            !settingsPanel.contains(e.target) &&
            !settingsBtn.contains(e.target)) {
            settingsPanel.classList.remove('visible');
            settingsPanel.classList.add('hidden');
        }
    });
    
    // 模式切换
    document.querySelectorAll('input[name="firework-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            FireworkConfig.setMode(e.target.value);
        });
    });
    
    // ==================== 定时任务 ====================
    
    const scheduleTime = document.getElementById('schedule-time');
    const scheduleMode = document.getElementById('schedule-mode');
    const addScheduleBtn = document.getElementById('add-schedule');
    const scheduleList = document.getElementById('schedule-list');
    
    function renderScheduleList() {
        scheduleList.innerHTML = '';
        
        FireworkConfig.scheduledTasks.forEach(task => {
            const item = document.createElement('div');
            item.className = 'schedule-item';
            item.innerHTML = `
                <div class="schedule-item-info">
                    <span class="schedule-time">${task.time}</span>
                    <span>${FireworkConfig.modes[task.mode].name}</span>
                </div>
                <button class="schedule-delete" data-id="${task.id}">✕</button>
            `;
            scheduleList.appendChild(item);
        });
        
        // 绑定删除事件
        scheduleList.querySelectorAll('.schedule-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                FireworkConfig.removeScheduledTask(parseInt(btn.dataset.id));
                renderScheduleList();
            });
        });
    }
    
    addScheduleBtn.addEventListener('click', () => {
        const time = scheduleTime.value;
        const mode = scheduleMode.value;
        
        if (time) {
            FireworkConfig.addScheduledTask(time, mode);
            renderScheduleList();
            scheduleTime.value = '';
        }
    });
    
    // 快捷设置
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            if (action === 'countdown-intense') {
                // 23:59 切换到激烈模式
                FireworkConfig.addScheduledTask('23:59', 'intense');
                btn.classList.add('active');
            } else if (action === 'morning-relaxed') {
                // 8:00 切换到舒缓模式
                FireworkConfig.addScheduledTask('08:00', 'relaxed');
                btn.classList.add('active');
            }
            
            renderScheduleList();
        });
    });
    
    // ==================== 愿望输入 ====================
    
    const wishForm = document.getElementById('wish-form');
    const wishInput = document.getElementById('wish-input');
    
    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const wish = wishInput.value.trim();
        if (wish) {
            danmaku.addUserWish(wish);
            fireworks.launchMultiple(3);
            starfield.boost();
            wishInput.value = '';
        }
    });
    
    // ==================== 鼠标交互 ====================
    
    // 鼠标移动 - 跟踪特效
    document.addEventListener('mousemove', (e) => {
        fireworks.updateMouseTrail(e.clientX, e.clientY);
    });
    
    // 点击页面 - 在点击位置爆炸烟花
    document.addEventListener('click', (e) => {
        // 排除各种UI元素的点击
        if (e.target.closest('#audio-overlay') || 
            e.target.closest('.wish-form') ||
            e.target.closest('.control-buttons') ||
            e.target.closest('.settings-panel') ||
            e.target.closest('button') ||
            e.target.closest('input') ||
            e.target.closest('select')) {
            return;
        }
        
        // 在点击位置爆炸烟花
        fireworks.explodeAt(e.clientX, e.clientY);
        starfield.boost();
    });
    
    // ==================== 键盘快捷键 ====================
    
    document.addEventListener('keydown', (e) => {
        // ESC 关闭设置面板
        if (e.code === 'Escape') {
            settingsPanel.classList.remove('visible');
            settingsPanel.classList.add('hidden');
        }
        
        // 空格键发射烟花
        if (e.code === 'Space' && document.activeElement !== wishInput) {
            e.preventDefault();
            fireworks.launchMultiple(5);
            starfield.boost();
        }
        
        // M键切换音效
        if (e.code === 'KeyM' && document.activeElement.tagName !== 'INPUT') {
            toggleSound();
        }
        
        // 1/2键切换模式
        if (e.code === 'Digit1') {
            FireworkConfig.setMode('relaxed');
        }
        if (e.code === 'Digit2') {
            FireworkConfig.setMode('intense');
        }
    });
    
    // ==================== 新年庆祝效果 ====================
    
    function celebrateNewYear() {
        let count = 0;
        const interval = setInterval(() => {
            fireworks.launchMultiple(5);
            starfield.boost();
            count++;
            
            if (count > 30) {
                clearInterval(interval);
            }
        }, 150);
        
        const celebrationMessages = [
            "🎉 新年快乐！",
            "🎆 2026来了！",
            "✨ Happy New Year!",
            "🎊 恭喜发财！",
            "🧧 万事如意！"
        ];
        
        celebrationMessages.forEach((msg, i) => {
            setTimeout(() => {
                danmaku.addUserWish(msg);
            }, i * 400);
        });
    }
    
    // ==================== 页面可见性处理 ====================
    
    document.addEventListener('visibilitychange', () => {
        fireworks.autoLaunch = !document.hidden;
    });
    
    // ==================== 控制台欢迎信息 ====================
    
    console.log('%c🎆 新年快乐 2026 🎆', 'color: #FFD700; font-size: 24px; font-weight: bold;');
    console.log('%c愿你的代码永远没有Bug！', 'color: #00FF7F; font-size: 14px;');
    console.log('%c快捷键: 空格=烟花 M=音效 1=舒缓 2=激烈', 'color: #FF69B4; font-size: 12px;');
});
