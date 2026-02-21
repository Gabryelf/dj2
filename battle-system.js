// ==============================
// СИСТЕМА БОЯ С АНИМАЦИЯМИ И АВТО-АТАКОЙ
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
        this.isInitialized = false;
        
        // Создаем врага только один раз
        this.createNewEnemy();
        this.startEnemyAnimation();
        this.startAutoAttack();
        this.isInitialized = true;
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
        
        // Обновляем UI только если игра инициализирована
        if (this.isInitialized) {
            this.updateUI();
        }
    }
    
    startEnemyAnimation() {
        const animate = () => {
            if (this.currentEnemy) {
                const enemyImage = document.querySelector('.enemy-image');
                if (enemyImage && Math.random() < 0.1) {
                    enemyImage.style.animation = 'none';
                    enemyImage.offsetHeight;
                    enemyImage.style.animation = 'enemyFloat 3s ease-in-out infinite';
                }
            }
            this.enemyAnimationFrame = requestAnimationFrame(animate);
        };
        this.enemyAnimationFrame = requestAnimationFrame(animate);
    }
    
    startAutoAttack() {
        if (this.autoAttackInterval) {
            clearInterval(this.autoAttackInterval);
        }
        
        this.autoAttackInterval = setInterval(() => {
            // Авто-атака срабатывает только если команда полностью заполнена (3 покемона)
            if (this.pokemonManager && this.pokemonManager.team.length === this.pokemonManager.maxTeamSize) {
                this.performAutoAttack();
            }
        }, GAME_CONFIG.AUTO_ATTACK_INTERVAL || 3000);
    }
    
    performAutoAttack() {
        if (!this.currentEnemy || !this.pokemonManager || this.pokemonManager.team.length === 0) return;
        
        const totalDamage = this.pokemonManager.getTeamDamage();
        
        // Применяем урон
        this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - totalDamage);
        
        // Показываем урон
        const enemyCard = document.querySelector('.enemy-card');
        if (enemyCard) {
            const rect = enemyCard.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            if (this.game && this.game.animationManager) {
                this.game.animationManager.createDamageEffect(
                    Math.floor(totalDamage),
                    x,
                    y,
                    totalDamage > 50
                );
            }
        }
        
        // Анимация получения урона
        if (enemyCard) {
            enemyCard.classList.add('enemy-damage-effect');
            setTimeout(() => {
                enemyCard.classList.remove('enemy-damage-effect');
            }, 300);
        }
        
        // Проверка на победу
        if (this.currentEnemy.hp <= 0) {
            this.handleVictory();
        }
        
        this.updateUI();
    }
    
    attackEnemy() {
        if (!this.currentEnemy) return { damage: 0 };
        
        const totalDamage = this.pokemonManager.useEnergy();
        
        if (totalDamage <= 0) {
            if (this.game) {
                this.game.showNotification('У покемонов нет энергии!', 'warning');
            }
            return { damage: 0 };
        }
        
        // Анимация получения урона
        const enemyCard = document.querySelector('.enemy-card');
        if (enemyCard) {
            enemyCard.classList.add('enemy-damage-effect');
            setTimeout(() => {
                enemyCard.classList.remove('enemy-damage-effect');
            }, 300);
        }
        
        this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - totalDamage);
        
        let result = {
            damage: totalDamage,
            defeated: false
        };
        
        if (this.currentEnemy.hp <= 0) {
            result = this.handleVictory(result);
        }
        
        this.updateUI();
        return result;
    }
    
    handleVictory(result = {}) {
        const reward = Math.floor(this.enemyLevel * GAME_CONFIG.REWARD_MULTIPLIER);
        
        result.defeated = true;
        result.reward = reward;
        result.enemy = { ...this.currentEnemy };
        
        this.enemyLevel++;
        this.createNewEnemy();
        
        return result;
    }
    
    async updateUI() {
        if (!this.currentEnemy) return;
        
        const enemyName = document.getElementById('enemy-name');
        const enemyLevel = document.getElementById('enemy-level');
        const enemyHpBar = document.getElementById('enemy-hp-bar');
        const enemyHpText = document.getElementById('enemy-hp-text');
        const enemyRarity = document.getElementById('enemy-rarity');
        const enemyTypeIcons = document.getElementById('enemy-type-icons');
        const enemyRarityIcon = document.getElementById('enemy-rarity-icon');
        const enemyImage = document.getElementById('enemy-image');
        
        if (enemyName) enemyName.textContent = this.currentEnemy.name;
        if (enemyLevel) enemyLevel.textContent = this.currentEnemy.level;
        
        if (enemyRarity) {
            const rarity = GAME_CONFIG.RARITIES[this.currentEnemy.rarity];
            enemyRarity.textContent = rarity.name;
            enemyRarity.style.color = rarity.color;
            enemyRarity.style.borderColor = rarity.color;
        }
        
        if (enemyRarityIcon) {
            const rarity = GAME_CONFIG.RARITIES[this.currentEnemy.rarity];
            enemyRarityIcon.style.borderColor = rarity.color;
            enemyRarityIcon.style.color = rarity.color;
            enemyRarityIcon.textContent = this.getRarityIcon(this.currentEnemy.rarity);
        }
        
        if (enemyTypeIcons) {
            enemyTypeIcons.innerHTML = this.getTypeIcons(this.currentEnemy.types);
        }
        
        if (enemyHpBar) {
            const hpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
            enemyHpBar.style.width = `${hpPercent}%`;
        }
        
        if (enemyHpText) {
            enemyHpText.textContent = `${Math.floor(this.currentEnemy.hp)}/${this.currentEnemy.maxHp}`;
        }
        
        if (enemyImage && this.imageManager) {
            try {
                const enemyImg = await this.imageManager.getEnemyImage(this.currentEnemy.imageKey);
                enemyImage.src = enemyImg.src;
            } catch (e) {
                console.error(`❌ Ошибка загрузки изображения противника:`, e);
            }
        }
    }
    
    getTypeIcons(types) {
        return types.map(type => {
            const symbol = this.getTypeSymbol(type);
            return `<div class="type-icon" title="${type}">${symbol}</div>`;
        }).join('');
    }
    
    getTypeSymbol(type) {
        const symbols = {
            NORMAL: '⬤',
            FIRE: '🔥',
            WATER: '💧',
            GRASS: '🌿',
            ELECTRIC: '⚡',
            ICE: '❄️',
            FIGHTING: '👊',
            POISON: '☠️',
            GROUND: '⛰️',
            FLYING: '🦅',
            PSYCHIC: '🔮',
            BUG: '🐛',
            ROCK: '🪨',
            GHOST: '👻',
            DRAGON: '🐉'
        };
        return symbols[type] || '❓';
    }
    
    getRarityIcon(rarity) {
        const icons = {
            COMMON: '⬤',
            UNCOMMON: '🔹',
            RARE: '🔷',
            EPIC: '💜',
            SPECIAL: '✨',
            LEGENDARY: '⭐'
        };
        return icons[rarity] || '⬤';
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
const battleStyles = document.createElement('style');
battleStyles.textContent = `
    @keyframes enemyDamage {
        0% { filter: brightness(1); }
        30% { filter: brightness(1.5) drop-shadow(0 0 20px #ef4444); }
        100% { filter: brightness(1); }
    }
    
    .enemy-damage-effect {
        animation: enemyDamage 0.3s ease-out;
    }
    
    .enemy-card {
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    
    .enemy-card:active {
        transform: scale(0.98);
    }
`;
document.head.appendChild(battleStyles);

window.BattleSystem = BattleSystem;