/**
 * 倒计时组件
 * 计算并显示距离2026年的倒计时
 * 使用 requestAnimationFrame 驱动，避免与渲染循环冲突
 */

class Countdown {
    constructor(options = {}) {
        this.targetDate = options.targetDate || new Date('2026-01-01T00:00:00');
        this.onComplete = options.onComplete || null;
        this.onTick = options.onTick || null;
        
        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
        
        this.lastValues = {
            days: -1,
            hours: -1,
            minutes: -1,
            seconds: -1
        };
        
        this.isComplete = false;
        this.lastSecond = -1; // 用于判断是否跨秒
        
        this.start();
    }
    
    calculate() {
        const now = new Date();
        const diff = this.targetDate - now;
        
        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
    }
    
    formatNumber(num) {
        return num.toString().padStart(2, '0');
    }
    
    updateDOM(time) {
        const units = ['days', 'hours', 'minutes', 'seconds'];
        
        for (const unit of units) {
            const value = time[unit];
            const formattedValue = this.formatNumber(value);
            
            if (this.lastValues[unit] !== value) {
                const element = this.elements[unit];
                if (element) {
                    // 添加翻转动画
                    const flipCard = element.parentElement;
                    flipCard.classList.add('flip-animation');
                    
                    // 更新数值
                    element.textContent = formattedValue;
                    
                    // 使用 requestAnimationFrame 延迟移除动画类，保持流畅
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            flipCard.classList.remove('flip-animation');
                        }, 450);
                    });
                }
                
                this.lastValues[unit] = value;
            }
        }
    }
    
    tick() {
        const time = this.calculate();
        
        // 只有秒数变化时才更新 DOM（避免无意义的重绘）
        if (time.seconds !== this.lastSecond) {
            this.lastSecond = time.seconds;
            this.updateDOM(time);
            
            // 回调
            if (this.onTick) {
                this.onTick(time);
            }
            
            // 检查是否倒计时完成
            if (time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
                if (!this.isComplete) {
                    this.isComplete = true;
                    if (this.onComplete) {
                        this.onComplete();
                    }
                }
            }
        }
    }
    
    start() {
        // 立即执行一次
        this.tick();
        
        // 使用 requestAnimationFrame 驱动，与渲染同步
        const loop = () => {
            this.tick();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    
    // 获取剩余时间（用于其他组件）
    getRemaining() {
        return this.calculate();
    }
}

// 导出到全局
window.Countdown = Countdown;
