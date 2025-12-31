/**
 * 主逻辑文件
 * 初始化所有模块并处理交互
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== 初始化模块 ====================
    
    // 星空背景
    const starfield = new Starfield('starfield');
    
    // 烟花系统
    const fireworks = new FireworkSystem('fireworks');
    
    // 倒计时
    const countdown = new Countdown({
        targetDate: new Date('2026-01-01T00:00:00'),
        onComplete: () => {
            // 倒计时结束时大放烟花
            celebrateNewYear();
        },
        onTick: (time) => {
            // 可以在这里添加每秒的额外逻辑
        }
    });
    
    // 弹幕系统
    const danmaku = new Danmaku('danmaku-container');
    
    // ==================== 音频控制 ====================
    
    const overlay = document.getElementById('audio-overlay');
    const audioElement = document.getElementById('firework-sound');
    let audioEnabled = false;
    
    // 点击覆盖层启用音频
    overlay.addEventListener('click', () => {
        audioEnabled = true;
        overlay.classList.add('hidden');
        
        // 启用烟花音效
        fireworks.enableSound(audioElement);
        
        // 开始自动发射烟花
        fireworks.startAutoLaunch(1200);
        
        // 立即发射几个烟花
        fireworks.launchMultiple(5);
        
        // 星空加速效果
        starfield.boost();
        
        // 尝试播放一次音效
        audioElement.play().catch(() => {});
    });
    
    // 如果用户没点击覆盖层也启动烟花（静音模式）
    setTimeout(() => {
        if (!audioEnabled) {
            fireworks.startAutoLaunch(2000);
        }
    }, 3000);
    
    // ==================== 愿望输入 ====================
    
    const wishForm = document.getElementById('wish-form');
    const wishInput = document.getElementById('wish-input');
    
    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const wish = wishInput.value.trim();
        if (wish) {
            // 添加到弹幕
            danmaku.addUserWish(wish);
            
            // 发射烟花庆祝
            fireworks.launchMultiple(3);
            
            // 星空加速
            starfield.boost();
            
            // 清空输入
            wishInput.value = '';
            
            // 输入框动画反馈
            wishInput.style.transform = 'scale(0.98)';
            setTimeout(() => {
                wishInput.style.transform = 'scale(1)';
            }, 100);
        }
    });
    
    // 输入框获得焦点时的效果
    wishInput.addEventListener('focus', () => {
        wishInput.parentElement.style.transform = 'scale(1.02)';
    });
    
    wishInput.addEventListener('blur', () => {
        wishInput.parentElement.style.transform = 'scale(1)';
    });
    
    // ==================== 点击页面发射烟花 ====================
    
    document.addEventListener('click', (e) => {
        // 排除覆盖层、输入框和按钮的点击
        if (e.target.closest('#audio-overlay') || 
            e.target.closest('.wish-form') ||
            e.target.closest('button')) {
            return;
        }
        
        // 在点击位置发射烟花
        const x = e.clientX;
        const targetY = e.clientY * 0.3 + Math.random() * 100;
        
        fireworks.launch(x, targetY);
        
        // 星空微加速
        if (Math.random() > 0.7) {
            starfield.boost();
        }
    });
    
    // ==================== 键盘快捷键 ====================
    
    document.addEventListener('keydown', (e) => {
        // 空格键发射烟花
        if (e.code === 'Space' && document.activeElement !== wishInput) {
            e.preventDefault();
            fireworks.launchMultiple(5);
            starfield.boost();
        }
        
        // Enter键（非输入状态）发射烟花
        if (e.code === 'Enter' && document.activeElement !== wishInput) {
            fireworks.launchMultiple(3);
        }
    });
    
    // ==================== 新年庆祝效果 ====================
    
    function celebrateNewYear() {
        // 连续发射大量烟花
        let count = 0;
        const interval = setInterval(() => {
            fireworks.launchMultiple(5);
            starfield.boost();
            count++;
            
            if (count > 20) {
                clearInterval(interval);
                fireworks.startAutoLaunch(500); // 持续快速发射
            }
        }, 300);
        
        // 添加特殊弹幕
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
            }, i * 500);
        });
    }
    
    // ==================== 页面可见性处理 ====================
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面不可见时减少资源消耗
            fireworks.autoLaunch = false;
        } else {
            fireworks.autoLaunch = true;
        }
    });
    
    // ==================== 窗口大小变化 ====================
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // 可以在这里添加响应式调整逻辑
        }, 200);
    });
    
    // ==================== 控制台欢迎信息 ====================
    
    console.log('%c🎆 新年快乐 2026 🎆', 'color: #FFD700; font-size: 24px; font-weight: bold;');
    console.log('%c愿你的代码永远没有Bug！', 'color: #00FF7F; font-size: 14px;');
    console.log('%c按空格键可以发射更多烟花哦！', 'color: #FF69B4; font-size: 12px;');
});
