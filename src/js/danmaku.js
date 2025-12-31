/**
 * 弹幕系统
 * 彩色祝福语从右向左飘动
 */

class Danmaku {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // 预设祝福语
        this.wishes = [
            "身体健康，万事如意",
            "Keep coding, keep creating.",
            "愿所有梦想都成真",
            "暴富!",
            "家人平安",
            "升职加薪",
            "去环游世界",
            "Happy New Year!",
            "不再脱发",
            "找到另一半",
            "代码无Bug",
            "工资翻倍",
            "早睡早起",
            "学会新技能",
            "天天开心",
            "实现财务自由",
            "工作顺利",
            "心想事成",
            "交到更多朋友",
            "家人健康",
            "父母身体健康",
            "五子登科",
            "迎娶刘亦菲",
            "迎娶迪丽热巴",
            "money money money",
            "oh money money home",
            "考上理想大学",
            "项目大卖",
            "生活美满幸福",
            "各位彦祖新年快乐",
            "代码写得又快又好",
            "项目上线零BUG",
            "多读书，涨知识",
            "存款突破百万",
            "有时间，多运动，健健康康",
            "找到理想工作",
            "多读好书！",
            "暴富！暴富！还是TM的暴富！",
            "工资翻个倍，或者跳个槽直接涨薪50%！",
            "副业搞起来，每月多赚个三五千零花钱。",
            "买彩票中次大的，不多，够付个首付就行。",
            "投资理财别绿了，给我红！赚个年终奖出来。",
            "接到个大单子，奖金拿到手软。",
            "清空购物车不用犹豫，喜欢就买。",
            "实现'奶茶自由'、'打车自由'，想花就花。",
            "给爸妈包个大红包，让他们嘚瑟一下。",
            "攒够fuck you money",
            "瘦它个10斤，穿啥都好看！",
            "练出马甲线",
            "皮肤变好，痘痘退散，素颜也能打。",
            "学会化妆，换头术那种！",
            "早睡早起，再也不当秃头小宝贝。",
            "把健身卡的钱练回本，一周至少去三次！",
            "戒掉宵夜和糖，管住嘴。",
            "体态变好，告别驼背，走路带风。",
            "学会穿搭，衣品飙升，出门被夸。",
            "工作少点破事，同事关系简单点。",
            "顺利升职，手下能带几个人。",
            "考个证，挂靠出去也能赚点。",
            "少加班！准时下班！拒绝996！",
            "做出个亮眼的成绩，在公司横着走。",
            "和讨厌的客户顺利掰头，且获胜。",
            "成功上岸",
            "毕业论文顺利通过，别折磨我了。",
            "找到一份钱多事少离家近的神仙工作。",
            "勇敢提离职，换到一个不内耗的环境。",
            "脱单！谈个甜甜的恋爱！",
            "和对象少吵架，多恩爱，感情更稳。",
            "多认识点新朋友，扩大社交圈。",
            "跟老朋友常聚，别生疏了。",
            "在社交场合不怂，能大方聊天。",
            "学会拒绝，不当老好人，让自己舒服。",
            "来一场说走就走的旅行",
            "遇到crush能勇敢要微信，别错过。",
            "和伴侣一起存钱，为未来打算。",
            "买下心心念念的东西",
            "学会做几道拿手硬菜，震住全场。",
            "养一只猫，过上猫狗双全的日子。",
            "去杭州玩一趟。",
            "看一场偶像的演唱会，冲到最前排。",
            "戒掉拖延症，有事立刻干！",
            "少刷短视频，多干点正经事。",
            "开车技术变好，成为老司机。",
            "把自己的小窝收拾得温馨又舒服。",
            "比2025年更开心、更顺、更牛逼！"
        ];
        
        // 弹幕颜色
        this.colors = [
            '#FF4500',  // 橙红
            '#ADFF2F',  // 黄绿
            '#00FFFF',  // 青色
            '#FF69B4',  // 粉红
            '#FFD700',  // 金色
            '#FFFFFF',  // 白色
            '#FF6347',  // 番茄红
            '#00FF7F',  // 春绿
            '#DA70D6',  // 兰花紫
            '#FFA500',  // 橙色
        ];
        
        this.activeDanmaku = [];
        this.usedTracks = new Map(); // 轨道占用记录
        this.trackHeight = 35; // 每条轨道高度
        
        this.init();
    }
    
    init() {
        // 初始生成一批弹幕
        this.generateInitialDanmaku();
        
        // 持续生成新弹幕
        this.startAutoGenerate();
    }
    
    generateInitialDanmaku() {
        // 先快速生成一批带随机延迟的弹幕
        const shuffled = [...this.wishes].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(30, shuffled.length); i++) {
            setTimeout(() => {
                this.createDanmaku(shuffled[i], true);
            }, i * 300 + Math.random() * 500);
        }
    }
    
    startAutoGenerate() {
        // 随机间隔生成弹幕
        const generate = () => {
            const randomWish = this.wishes[Math.floor(Math.random() * this.wishes.length)];
            this.createDanmaku(randomWish);
            
            // 随机间隔1-3秒
            const delay = 1000 + Math.random() * 2000;
            setTimeout(generate, delay);
        };
        
        setTimeout(generate, 2000);
    }
    
    getAvailableTrack() {
        const now = Date.now();
        // 使用百分比位置（5% - 90%）
        const minTop = 5;
        const maxTop = 90;
        const trackCount = 20; // 轨道数量
        const trackStep = (maxTop - minTop) / trackCount;
        
        // 清理过期的轨道占用
        for (const [track, endTime] of this.usedTracks) {
            if (now > endTime) {
                this.usedTracks.delete(track);
            }
        }
        
        // 找一个空闲轨道
        const shuffledTracks = Array.from({ length: trackCount }, (_, i) => i)
            .sort(() => Math.random() - 0.5);
        
        for (const track of shuffledTracks) {
            if (!this.usedTracks.has(track)) {
                return minTop + track * trackStep;
            }
        }
        
        // 如果没有空闲轨道，随机选一个
        return minTop + Math.random() * (maxTop - minTop);
    }
    
    createDanmaku(text, isInitial = false) {
        const element = document.createElement('div');
        element.className = 'danmaku';
        element.textContent = text;
        
        // 随机颜色
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        element.style.color = color;
        
        // 获取可用轨道
        const top = this.getAvailableTrack();
        element.style.top = `${top}%`;
        
        // 随机缩放 (0.8 - 1.2)
        const scale = 0.8 + Math.random() * 0.4;
        element.style.transform = `scale(${scale})`;
        element.style.fontSize = `${14 + Math.random() * 4}px`;
        
        // 随机速度 (10-25秒)
        const duration = 10 + Math.random() * 15;
        element.style.animationDuration = `${duration}s`;
        
        // 初始弹幕带随机延迟模拟已经在飞的效果
        if (isInitial) {
            const delay = -Math.random() * duration;
            element.style.animationDelay = `${delay}s`;
        }
        
        // 起始位置在右侧屏幕外
        element.style.right = `-${text.length * 20}px`;
        element.style.left = 'auto';
        
        // 计算轨道索引
        const trackStep = 85 / 20;
        const trackIndex = Math.floor((top - 5) / trackStep);
        const occupyTime = Date.now() + duration * 300; // 轨道占用时间
        this.usedTracks.set(trackIndex, occupyTime);
        
        this.container.appendChild(element);
        
        // 动画结束后移除
        element.addEventListener('animationend', () => {
            element.remove();
        });
        
        return element;
    }
    
    // 添加用户愿望（高亮显示）
    addUserWish(text) {
        const element = this.createDanmaku(text);
        
        // 用户愿望使用特殊样式
        element.style.color = '#FFD700';
        element.style.fontSize = '18px';
        element.style.textShadow = '0 0 20px #FFD700, 0 0 40px #FFA500';
        element.style.fontWeight = 'bold';
        element.style.transform = 'scale(1.1)';
        
        // 同时加入预设列表
        if (!this.wishes.includes(text) && text.length > 0) {
            this.wishes.push(text);
        }
        
        return element;
    }
}

// 导出到全局
window.Danmaku = Danmaku;
