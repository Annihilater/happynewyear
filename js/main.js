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
            FireworkConfig.setMode('intense');
            celebrateNewYear();
        }
    });
    
    // 弹幕系统
    const danmaku = new Danmaku('danmaku-container');
    
    // ==================== 设置面板控制 ====================
    
    const settingsPanel = document.getElementById('settings-panel');
    const settingsBtn = document.getElementById('settings-btn');
    
    // 切换设置面板
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('open');
    });
    
    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsPanel.classList.remove('open');
        }
    });
    
    // 折叠分区
    document.querySelectorAll('.adv-section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            section.classList.toggle('collapsed');
        });
    });
    
    // ==================== 参数滑块绑定 ====================
    
    // 粒子参数
    bindSlider('cfg-particleCount', 'val-particleCount', 'particles', 'particleCount');
    bindSlider('cfg-particleSize', 'val-particleSize', 'particles', 'particleSize');
    bindSlider('cfg-fadeSpeed', 'val-fadeSpeed', 'particles', 'fadeSpeed');
    
    // 物理参数
    bindSlider('cfg-explosionForce', 'val-explosionForce', 'physics', 'explosionForce');
    bindSlider('cfg-hoverDuration', 'val-hoverDuration', 'physics', 'hoverDuration');
    bindSlider('cfg-gravity', 'val-gravity', 'physics', 'gravity');
    
    // 音频参数
    bindSlider('cfg-volume', 'val-volume', 'audio', 'volume', (val) => {
        if (window.DeepAudio) {
            window.DeepAudio.volume = val;
        }
    });
    
    // 音效开关
    const soundCheckbox = document.getElementById('cfg-soundEnabled');
    if (soundCheckbox) {
        soundCheckbox.checked = FireworkConfig.audio.soundEnabled;
        soundCheckbox.addEventListener('change', () => {
            FireworkConfig.set('audio', 'soundEnabled', soundCheckbox.checked);
            if (window.DeepAudio) {
                window.DeepAudio.enabled = soundCheckbox.checked;
            }
            updateSoundToggleUI();
        });
    }
    
    function bindSlider(sliderId, valueId, category, key, callback) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        if (!slider || !valueDisplay) return;
        
        // 初始值
        const initialValue = FireworkConfig.get(category, key);
        if (initialValue !== undefined) {
            slider.value = initialValue;
            valueDisplay.textContent = formatValue(initialValue);
        }
        
        // 监听变化
        slider.addEventListener('input', () => {
            const val = parseFloat(slider.value);
            valueDisplay.textContent = formatValue(val);
            FireworkConfig.set(category, key, val);
            if (callback) callback(val);
        });
    }
    
    function formatValue(val) {
        if (val >= 100) return Math.round(val);
        if (val >= 1) return val.toFixed(1);
        if (val >= 0.01) return val.toFixed(3);
        return val.toFixed(4);
    }
    
    // ==================== 语言切换 ====================
    
    const langToggle = document.getElementById('lang-toggle');
    const langLabel = document.getElementById('lang-label');
    
    function updateLanguageUI() {
        const lang = FireworkConfig.lang;
        langLabel.textContent = lang === 'zh' ? '中文 / EN' : 'EN / 中文';
        
        // 更新所有带 data-i18n 的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = FireworkConfig.t(key);
        });
        
        // 更新模式按钮
        document.querySelectorAll('.mode-toggle-btn').forEach(btn => {
            const mode = btn.dataset.mode;
            if (mode === 'relaxed') {
                btn.querySelector('span').textContent = lang === 'zh' ? '🌙 舒缓' : '🌙 Relaxed';
            } else if (mode === 'intense') {
                btn.querySelector('span').textContent = lang === 'zh' ? '🎉 激烈' : '🎉 Intense';
            }
        });
    }
    
    langToggle.addEventListener('click', () => {
        FireworkConfig.toggleLang();
        updateLanguageUI();
    });
    
    FireworkConfig.updateUI = updateLanguageUI;
    updateLanguageUI();
    
    // ==================== 重置按钮 ====================
    
    const resetBtn = document.getElementById('reset-settings');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            FireworkConfig.resetToDefault();
            
            // 更新所有滑块
            document.querySelectorAll('.adv-slider-group input[type="range"]').forEach(slider => {
                const id = slider.id.replace('cfg-', '');
                let value;
                
                if (['particleCount', 'particleSize', 'fadeSpeed'].includes(id)) {
                    value = FireworkConfig.particles[id];
                } else if (['explosionForce', 'hoverDuration', 'gravity'].includes(id)) {
                    value = FireworkConfig.physics[id];
                } else if (id === 'volume') {
                    value = FireworkConfig.audio.volume;
                }
                
                if (value !== undefined) {
                    slider.value = value;
                    const valueDisplay = document.getElementById(`val-${id}`);
                    if (valueDisplay) {
                        valueDisplay.textContent = value;
                    }
                }
            });
            
            // 更新音效复选框
            const soundCheckbox = document.getElementById('cfg-soundEnabled');
            if (soundCheckbox) {
                soundCheckbox.checked = FireworkConfig.audio.soundEnabled;
            }
            
            // 显示确认
            resetBtn.innerHTML = `<span>✓</span><span>${FireworkConfig.t('resetConfirm')}</span>`;
            setTimeout(() => {
                resetBtn.innerHTML = `<span>🔄</span><span data-i18n="resetSettings">${FireworkConfig.t('resetSettings')}</span>`;
            }, 1500);
        });
    }
    
    // ==================== 模式切换 ====================
    
    const modeDescription = document.getElementById('mode-description');
    
    function updateModeUI(mode) {
        document.querySelectorAll('.mode-toggle-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.mode-toggle-btn[data-mode="${mode}"]`)?.classList.add('active');
        
        // 更新描述
        if (modeDescription) {
            const descKey = mode === 'relaxed' ? 'relaxedDesc' : 'intenseDesc';
            modeDescription.textContent = FireworkConfig.t(descKey);
        }
    }
    
    document.querySelectorAll('.mode-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            FireworkConfig.setMode(mode);
            updateModeUI(mode);
        });
    });
    
    // 初始化模式UI
    updateModeUI(FireworkConfig.currentMode);
    
    FireworkConfig.onModeChange = (mode) => {
        updateModeUI(mode);
    };
    
    // ==================== 定时切换 ====================
    
    const scheduleTime = document.getElementById('schedule-time');
    const scheduleMode = document.getElementById('schedule-mode');
    const addScheduleBtn = document.getElementById('add-schedule-btn');
    const scheduleList = document.getElementById('schedule-list');
    
    function renderScheduleList() {
        if (!scheduleList) return;
        
        const tasks = FireworkConfig.scheduledTasks;
        
        if (tasks.length === 0) {
            scheduleList.innerHTML = `<div class="schedule-empty">${FireworkConfig.t('noSchedule')}</div>`;
            return;
        }
        
        scheduleList.innerHTML = tasks.map(task => `
            <div class="schedule-item">
                <div class="schedule-item-info">
                    <span class="schedule-item-time">${task.time}</span>
                    <span class="schedule-item-mode">→ ${FireworkConfig.t(task.mode)}</span>
                </div>
                <button class="schedule-item-delete" data-id="${task.id}">✕</button>
            </div>
        `).join('');
        
        // 绑定删除事件
        scheduleList.querySelectorAll('.schedule-item-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                FireworkConfig.removeScheduledTask(parseInt(btn.dataset.id));
                renderScheduleList();
            });
        });
    }
    
    if (addScheduleBtn) {
        addScheduleBtn.addEventListener('click', () => {
            const time = scheduleTime.value;
            const mode = scheduleMode.value;
            
            if (time) {
                FireworkConfig.addScheduledTask(time, mode);
                renderScheduleList();
                scheduleTime.value = '';
            }
        });
    }
    
    renderScheduleList();
    
    // ==================== 音频控制 ====================
    
    const overlay = document.getElementById('audio-overlay');
    const soundToggle = document.getElementById('sound-toggle');
    let audioInitialized = false;
    
    function initAudio() {
        if (!audioInitialized && window.DeepAudio) {
            window.DeepAudio.init();
            window.DeepAudio.volume = FireworkConfig.audio.volume;
            window.DeepAudio.enabled = FireworkConfig.audio.soundEnabled;
            audioInitialized = true;
        }
    }
    
    function updateSoundToggleUI() {
        const enabled = window.DeepAudio ? window.DeepAudio.enabled : false;
        if (enabled) {
            soundToggle.classList.remove('muted');
            soundToggle.title = '关闭音效';
        } else {
            soundToggle.classList.add('muted');
            soundToggle.title = '开启音效';
        }
        
        // 同步复选框
        if (soundCheckbox) {
            soundCheckbox.checked = enabled;
        }
    }
    
    function toggleSound() {
        initAudio();
        
        if (window.DeepAudio) {
            const enabled = window.DeepAudio.toggle();
            FireworkConfig.set('audio', 'soundEnabled', enabled);
            updateSoundToggleUI();
            return enabled;
        }
        return false;
    }
    
    // 点击覆盖层启用音频
    overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.classList.add('hidden');
        
        initAudio();
        if (window.DeepAudio) {
            window.DeepAudio.enabled = true;
            FireworkConfig.set('audio', 'soundEnabled', true);
        }
        updateSoundToggleUI();
        
        // 发射烟花
        fireworks.launchMultiple(5);
        starfield.boost();
    });
    
    // 音量开关按钮
    soundToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSound();
    });
    
    // 默认状态
    soundToggle.classList.add('muted');
    
    // 3秒后自动开始（静音）
    setTimeout(() => {
        if (!overlay.classList.contains('hidden')) {
            fireworks.autoLaunch = true;
        }
    }, 3000);
    
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
    
    document.addEventListener('mousemove', (e) => {
        fireworks.updateMouseTrail(e.clientX, e.clientY);
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.closest('#audio-overlay') || 
            e.target.closest('.wish-form') ||
            e.target.closest('.control-buttons') ||
            e.target.closest('.adv-settings-panel') ||
            e.target.closest('button') ||
            e.target.closest('input') ||
            e.target.closest('select')) {
            return;
        }
        
        fireworks.explodeAt(e.clientX, e.clientY);
        starfield.boost();
    });
    
    // ==================== 键盘快捷键 ====================
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            settingsPanel.classList.remove('open');
        }
        
        if (e.code === 'Space' && document.activeElement !== wishInput) {
            e.preventDefault();
            fireworks.launchMultiple(5);
            starfield.boost();
        }
        
        if (e.code === 'KeyM' && document.activeElement.tagName !== 'INPUT') {
            toggleSound();
        }
        
        if (e.code === 'Digit1') {
            FireworkConfig.setMode('relaxed');
        }
        if (e.code === 'Digit2') {
            FireworkConfig.setMode('intense');
        }
    });
    
    // ==================== 新年庆祝 ====================
    
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
        
        const messages = ["🎉 新年快乐！", "🎆 2026来了！", "✨ Happy New Year!", "🎊 恭喜发财！", "🧧 万事如意！"];
        messages.forEach((msg, i) => {
            setTimeout(() => danmaku.addUserWish(msg), i * 400);
        });
    }
    
    // ==================== 页面可见性 ====================
    
    document.addEventListener('visibilitychange', () => {
        fireworks.autoLaunch = !document.hidden;
    });
    
    // ==================== 控制台信息 ====================
    
    console.log('%c🎆 新年快乐 2026 🎆', 'color: #FFD700; font-size: 24px; font-weight: bold;');
    console.log('%c愿你的代码永远没有Bug！', 'color: #00FF7F; font-size: 14px;');
    console.log('%c快捷键: 空格=烟花 M=音效 1=舒缓 2=激烈', 'color: #FF69B4; font-size: 12px;');
});
