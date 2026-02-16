// ==============================
// СИСТЕМА БОЯ С АНИМАЦИЯМИ
// ==============================

class BattleSystem {
    constructor(pokemonManager, game, imageManager) {
        this.pokemonManager = pokemonManager;
        this.game = game;
        this.imageManager = imageManager;
        this.currentEnemy = null;
        this.enemyLevel = 1;
        this.autoAttackInterval = null;
        this.enemyAnimationFrame = null;
        
        this.createNewEnemy();
        this.startEnemyAnimation();
    }
    
    createNewEnemy() {
        const enemies = GAME_CONFIG.ENEMY_DATA;
        const randomEnemy = { ...enemies[Math.floor(Math.random() * enemies.length)] };
        
        const baseHp = GAME_CONFIG.BASE_ENEMY_HP;
        const hpMultiplier = GAME_CONFIG.ENEMY_HP_MULTIPLIER;
        
        const maxHp = Math.floor(baseHp * Math.pow(hpMultiplier, this.enemyLevel - 1));
        
        this.currentEnemy = {
            ...randomEnemy,
            id: Date.now() + Math.random(),
            hp: maxHp,
            maxHp: maxHp,
            level: this.enemyLevel,
            imageKey: randomEnemy.imageKey
        };
        
        this.updateUI();
    }
    
    startEnemyAnimation() {
        // Случайные анимации для врага
        const animate = () => {
            if (this.currentEnemy) {
                const enemyImage = document.querySelector('.enemy-image');
                if (enemyImage && Math.random() < 0.1) { // 10% шанс анимации
                    enemyImage.style.animation = 'none';
                    enemyImage.offsetHeight; // trigger reflow
                    enemyImage.style.animation = 'enemyFloat 3s ease-in-out infinite';
                }
            }
            this.enemyAnimationFrame = requestAnimationFrame(animate);
        };
        this.enemyAnimationFrame = requestAnimationFrame(animate);
    }
    
    attackEnemy() {
        if (!this.currentEnemy) return { damage: 0 };
        
        const totalDamage = this.pokemonManager.useEnergy();
        
        if (totalDamage <= 0) {
            return { damage: 0 };
        }
        
        // Анимация получения урона
        const enemyCard = document.querySelector('.enemy-card');
        if (enemyCard) {
            enemyCard.style.animation = 'none';
            enemyCard.offsetHeight;
            enemyCard.style.animation = 'enemyDamage 0.3s ease-out';
            setTimeout(() => {
                enemyCard.style.animation = '';
            }, 300);
        }
        
        this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - totalDamage);
        
        let result = {
            damage: totalDamage,
            defeated: false
        };
        
        if (this.currentEnemy.hp <= 0) {
            const reward = Math.floor(this.enemyLevel * GAME_CONFIG.REWARD_MULTIPLIER);
            
            result.defeated = true;
            result.reward = reward;
            result.enemy = { ...this.currentEnemy };
            
            this.enemyLevel++;
            this.createNewEnemy();
        }
        
        this.updateUI();
        return result;
    }
    
    async updateUI() {
        if (!this.currentEnemy) return;
        
        const enemyName = document.getElementById('enemy-name');
        const enemyLevel = document.getElementById('enemy-level');
        const enemyHpBar = document.getElementById('enemy-hp-bar');
        const enemyHpText = document.getElementById('enemy-hp-text');
        const enemyRarity = document.getElementById('enemy-rarity');
        const enemyContainer = document.getElementById('enemy-image-container');
        
        if (enemyName) enemyName.textContent = this.currentEnemy.name;
        if (enemyLevel) enemyLevel.textContent = this.currentEnemy.level;
        if (enemyRarity) {
            const rarity = GAME_CONFIG.RARITIES[this.currentEnemy.rarity];
            enemyRarity.textContent = rarity.name;
            enemyRarity.style.color = rarity.color;
            enemyRarity.style.borderColor = rarity.color;
        }
        
        if (enemyHpBar) {
            const hpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
            enemyHpBar.style.width = `${hpPercent}%`;
        }
        
        if (enemyHpText) {
            // Отображаем только целые числа
            enemyHpText.textContent = `${Math.floor(this.currentEnemy.hp)}/${this.currentEnemy.maxHp}`;
        }
        
        if (enemyContainer) {
            // Очищаем контейнер, но оставляем rarity-badge
            const badge = enemyContainer.querySelector('.rarity-badge');
            enemyContainer.innerHTML = '';
            if (badge) enemyContainer.appendChild(badge);
            
            const img = document.createElement('img');
            img.className = 'enemy-image';
            img.alt = this.currentEnemy.name;
            img.width = 200;
            img.height = 200;
            
            try {
                const enemyImg = await this.imageManager.getEnemyImage(this.currentEnemy.imageKey);
                img.src = enemyImg.src;
            } catch (e) {
                console.error(`❌ Ошибка загрузки изображения противника:`, e);
            }
            
            enemyContainer.appendChild(img);
        }
        
        const totalDamage = document.getElementById('total-damage');
        if (totalDamage) {
            totalDamage.textContent = Math.floor(this.pokemonManager.getTeamDamage());
        }
    }
    
    toggleAutoAttack() {
        if (this.autoAttackInterval) {
            clearInterval(this.autoAttackInterval);
            this.autoAttackInterval = null;
            this.game.showNotification('Авто-атака отключена', 'info');
        } else {
            this.autoAttackInterval = setInterval(() => {
                this.game.manualAttack();
            }, GAME_CONFIG.AUTO_ATTACK_INTERVAL);
            this.game.showNotification('Авто-атака включена', 'success');
        }
    }
    
    cleanup() {
        if (this.enemyAnimationFrame) {
            cancelAnimationFrame(this.enemyAnimationFrame);
        }
        if (this.autoAttackInterval) {
            clearInterval(this.autoAttackInterval);
        }
    }
}

// Добавляем CSS анимацию для урона
const style = document.createElement('style');
style.textContent = `
    @keyframes enemyDamage {
        0% { filter: brightness(1); }
        30% { filter: brightness(1.5) drop-shadow(0 0 20px #ef4444); }
        100% { filter: brightness(1); }
    }
`;
document.head.appendChild(style);

window.BattleSystem = BattleSystem;