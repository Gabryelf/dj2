// ==============================
// СИСТЕМА БОЯ (ОБНОВЛЕННАЯ)
// ==============================

class BattleSystem {
    constructor(pokemonManager, game, imageManager) {
        this.pokemonManager = pokemonManager;
        this.game = game;
        this.imageManager = imageManager;
        this.currentEnemy = null;
        this.enemyLevel = 1;
        this.autoAttackInterval = null;
        
        this.createNewEnemy();
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
    
    attackEnemy() {
        if (!this.currentEnemy) return { damage: 0 };
        
        const totalDamage = this.pokemonManager.useEnergy();
        
        if (totalDamage <= 0) {
            return { damage: 0 };
        }
        
        this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - totalDamage);
        
        let result = {
            damage: totalDamage,
            defeated: false
        };
        
        if (this.currentEnemy.hp <= 0) {
            const reward = this.enemyLevel * GAME_CONFIG.REWARD_MULTIPLIER;
            
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
            enemyRarity.style.backgroundColor = rarity.color;
        }
        
        if (enemyHpBar) {
            const hpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
            enemyHpBar.style.width = `${hpPercent}%`;
        }
        
        if (enemyHpText) {
            enemyHpText.textContent = `${Math.floor(this.currentEnemy.hp)}/${this.currentEnemy.maxHp}`;
        }
        
        if (enemyContainer) {
            enemyContainer.innerHTML = '';
            
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
            totalDamage.textContent = this.pokemonManager.getTeamDamage();
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
}

window.BattleSystem = BattleSystem;