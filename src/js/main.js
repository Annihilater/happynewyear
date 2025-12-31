/**
 * 主逻辑文件
 * 初始化所有模块并处理交互
 */

// 站点配置
let SiteConfig = {
    subtitle: '倒计时',
    tagline: '点亮希望，照亮未来',
    year: '2026'
};

// 加载站点配置
async function loadSiteConfig() {
    try {
        const response = await fetch('site-config.json');
        if (response.ok) {
            const config = await response.json();
            SiteConfig = { ...SiteConfig, ...config };
        }
    } catch (e) {
        console.warn('加载站点配置失败，使用默认值:', e);
    }
    
    // 更新页面显示
    const subtitleEl = document.getElementById('site-subtitle');
    const taglineEl = document.getElementById('site-tagline');
    const yearEl = document.getElementById('site-year');
    
    if (subtitleEl) subtitleEl.textContent = SiteConfig.subtitle;
    if (taglineEl) taglineEl.textContent = SiteConfig.tagline;
    if (yearEl) yearEl.textContent = SiteConfig.year;
}

function initApp() {
    // ==================== 初始化配置 ====================
    FireworkConfig.init();
    
    // ==================== 初始化模块 ====================
    
    // 等待烟花系统加载完成
    if (!window.FireworkSystem) {
        console.warn('⏳ 等待Three.js烟花系统加载...');
        return;
    }
    
    // 烟花系统（包含背景星空）
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
    const overlayText = document.getElementById('overlay-text');
    const soundToggle = document.getElementById('sound-toggle');
    let audioInitialized = false;
    
    // 检测移动端并更新提示文本
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && overlayText) {
        overlayText.textContent = '轻触屏幕启用音频并发射烟花';
    }
    
    async function initAudio() {
        if (!audioInitialized && window.DeepAudio) {
            window.DeepAudio.init();
            window.DeepAudio.volume = FireworkConfig.audio.volume;
            window.DeepAudio.enabled = FireworkConfig.audio.soundEnabled;
            
            // 移动端：确保音频上下文已解锁
            await window.DeepAudio.unlockAudio();
            
            audioInitialized = true;
            
            // 检查音频是否真的可用
            if (!window.DeepAudio.isAudioAvailable()) {
                console.warn('⚠️ 音频上下文未激活，需要用户交互');
            }
        } else if (window.DeepAudio) {
            // 如果已初始化，确保上下文已恢复
            const resumed = await window.DeepAudio.resumeContext();
            if (!resumed && window.DeepAudio.enabled) {
                console.warn('⚠️ 音频上下文恢复失败，可能需要用户交互');
            }
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
    
    async function toggleSound() {
        await initAudio();
        
        if (window.DeepAudio) {
            const enabled = window.DeepAudio.toggle();
            FireworkConfig.set('audio', 'soundEnabled', enabled);
            
            // 如果开启音效，确保音频上下文已解锁
            if (enabled) {
                await window.DeepAudio.unlockAudio();
            }
            
            updateSoundToggleUI();
            return enabled;
        }
        return false;
    }
    
    // 点击覆盖层启用音频
    overlay.addEventListener('click', async (e) => {
        e.stopPropagation();
        overlay.classList.add('hidden');
        
        await initAudio();
        if (window.DeepAudio) {
            window.DeepAudio.enabled = true;
            FireworkConfig.set('audio', 'soundEnabled', true);
            // 确保音频上下文已解锁
            await window.DeepAudio.unlockAudio();
        }
        updateSoundToggleUI();
        
        // 发射烟花
        fireworks.launchMultiple(5);
    });
    
    // 触摸事件也触发音频初始化（移动端）
    overlay.addEventListener('touchstart', async (e) => {
        e.stopPropagation();
        overlay.classList.add('hidden');
        
        await initAudio();
        if (window.DeepAudio) {
            window.DeepAudio.enabled = true;
            FireworkConfig.set('audio', 'soundEnabled', true);
            // 确保音频上下文已解锁
            await window.DeepAudio.unlockAudio();
        }
        updateSoundToggleUI();
        
        // 发射烟花
        fireworks.launchMultiple(5);
    }, { passive: true });
    
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
    const wishSection = document.querySelector('.wish-section');
    const wishTrigger = document.querySelector('.wish-trigger');
    
    // 点击触发图标展开输入框（移动端友好）
    if (wishTrigger && wishSection) {
        wishTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            wishSection.classList.add('expanded');
            // 自动聚焦输入框
            setTimeout(() => wishInput.focus(), 100);
        });
        
        // 点击外部收起（移动端）
        document.addEventListener('click', (e) => {
            if (wishSection.classList.contains('expanded') &&
                !wishSection.contains(e.target)) {
                wishSection.classList.remove('expanded');
            }
        });
        
        // 触摸外部收起
        document.addEventListener('touchstart', (e) => {
            if (wishSection.classList.contains('expanded') &&
                !wishSection.contains(e.target)) {
                wishSection.classList.remove('expanded');
            }
        }, { passive: true });
    }
    
    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const wish = wishInput.value.trim();
        if (wish) {
            danmaku.addUserWish(wish);
            fireworks.launchMultiple(3);
            wishInput.value = '';
            // 提交后收起输入框
            wishSection.classList.remove('expanded');
        }
    });
    
    // ==================== 鼠标/触摸交互 ====================
    
    // 检测是否为触摸设备
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 判断是否为交互元素（不应触发烟花）
    function isInteractiveElement(target) {
        return target.closest('#audio-overlay') || 
               target.closest('.wish-form') ||
               target.closest('.wish-section') ||
               target.closest('.control-buttons') ||
               target.closest('.adv-settings-panel') ||
               target.closest('button') ||
               target.closest('input') ||
               target.closest('select');
    }
    
    // 鼠标移动 - 粒子跟随
    document.addEventListener('mousemove', (e) => {
        fireworks.updateMouseTrail(e.clientX, e.clientY);
    });
    
    // 触摸移动 - 粒子跟随
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            fireworks.updateMouseTrail(touch.clientX, touch.clientY);
        }
    }, { passive: true });
    
    // 鼠标点击 - 发射烟花
    document.addEventListener('click', (e) => {
        if (isInteractiveElement(e.target)) {
            return;
        }
        fireworks.explodeAt(e.clientX, e.clientY);
    });
    
    // 触摸开始 - 发射烟花（触摸设备）
    if (isTouchDevice) {
        document.addEventListener('touchstart', async (e) => {
            if (isInteractiveElement(e.target)) {
                return;
            }
            
            // 单指触摸才发射烟花
            if (e.touches.length === 1) {
                // 触摸时初始化音频（移动端）
                await initAudio();
                
                const touch = e.touches[0];
                fireworks.explodeAt(touch.clientX, touch.clientY);
            }
        }, { passive: true });
    }
    
    // ==================== 键盘快捷键 ====================
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            // ESC键切换设置面板开关
            settingsPanel.classList.toggle('open');
        }
        
        if (e.code === 'Space' && document.activeElement !== wishInput) {
            e.preventDefault();
            fireworks.launchMultiple(5);
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
    console.log('%c快捷键: 空格=烟花 M=音效 ESC=设置 1=舒缓 2=激烈', 'color: #FF69B4; font-size: 12px;');
}

// ==================== 初始化 ====================

// 加载站点配置
loadSiteConfig();

// 等待DOM加载和烟花系统就绪
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
} else {
    checkAndInit();
}

// 等待烟花系统加载
window.addEventListener('fireworksReady', checkAndInit);

function checkAndInit() {
    // 确保DOM已加载且烟花系统已就绪
    if (document.readyState !== 'loading' && window.FireworkSystem) {
        initApp();
    }
}
