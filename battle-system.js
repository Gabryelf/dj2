// ==============================
// БОЕВАЯ СИСТЕМА
// ==============================

class BattleSystem {
    constructor(pokemonManager, game, atlasManager) {
        this.pokemonManager = pokemonManager;
        this.game = game;
        this.atlasManager = atlasManager;
        this.currentEnemy = null;
        this.enemyLevel = 1;
        this.autoAttackInterval = null;
        
        this.createNewEnemy();
        this.startAutoAttack();
    }
    
    createNewEnemy() {
        const enemyData = GameUtils.getRandomEnemyAtlasCoords(GAME_CONFIG);
        
        const maxHp = GAME_CONFIG.BASE_ENEMY_HP * Math.pow(GAME_CONFIG.ENEMY_HP_MULTIPLIER, this.enemyLevel - 1);
        
        this.currentEnemy = {
            ...enemyData,
            hp: maxHp,
            maxHp: maxHp
        };
        
        return this.currentEnemy;
    }
    
    attackEnemy() {
        if (!this.currentEnemy) return { damage: 0, defeated: false };
        
        const totalDamage = this.pokemonManager.useEnergy();
        
        if (totalDamage === 0) {
            return { damage: 0, defeated: false };
        }
        
        this.currentEnemy.hp -= totalDamage;
        
        const result = {
            damage: totalDamage,
            defeated: false,
            enemy: null,
            reward: 0
        };
        
        if (this.currentEnemy.hp <= 0) {
            const oldEnemy = { ...this.currentEnemy };
            result.defeated = true;
            result.reward = this.enemyLevel * GAME_CONFIG.REWARD_MULTIPLIER;
            result.enemy = oldEnemy;
            
            this.enemyLevel++;
            this.createNewEnemy();
        }
        
        return result;
    }
    
    startAutoAttack() {
        if (this.autoAttackInterval) {
            clearInterval(this.autoAttackInterval);
        }
        
        this.autoAttackInterval = setInterval(() => {
            if (this.pokemonManager.team.length > 0 && this.game.isInitialized) {
                this.game.manualAttack();
            }
        }, GAME_CONFIG.AUTO_ATTACK_INTERVAL);
    }
    
    updateUI() {
        if (!this.currentEnemy) return;
        
        const enemyName = document.getElementById('enemy-name');
        const enemyLevel = document.getElementById('enemy-level');
        const enemyHpBar = document.getElementById('enemy-hp-bar');
        const enemyHpText = document.getElementById('enemy-hp-text');
        const enemyRarity = document.getElementById('enemy-rarity');
        const enemyImageContainer = document.getElementById('enemy-image-container');
        const totalDamage = document.getElementById('total-damage');
        
        if (enemyName) enemyName.textContent = this.currentEnemy.name;
        if (enemyLevel) enemyLevel.textContent = this.enemyLevel;
        
        const hpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
        if (enemyHpBar) enemyHpBar.style.width = `${hpPercent}%`;
        if (enemyHpText) enemyHpText.textContent = `${Math.ceil(this.currentEnemy.hp)}/${Math.ceil(this.currentEnemy.maxHp)}`;
        
        if (enemyRarity) {
            const rarityData = GAME_CONFIG.RARITIES[this.currentEnemy.rarity];
            enemyRarity.textContent = rarityData.name;
            enemyRarity.style.color = rarityData.color;
        }
        
        // Рисуем противника на canvas
        if (enemyImageContainer) {
            enemyImageContainer.innerHTML = ''; // Очищаем контейнер
            
            // Создаем canvas
            const canvas = document.createElement('canvas');
            canvas.width = 250;
            canvas.height = 250;
            canvas.style.width = '250px';
            canvas.style.height = '250px';
            canvas.className = 'enemy-img';
            canvas.id = 'enemy-image';
            
            // Добавляем canvas в DOM
            enemyImageContainer.appendChild(canvas);
            
            // Получаем контекст
            const ctx = canvas.getContext('2d');
            
            // ОЧИЩАЕМ canvas для начала
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Рисуем фон для проверки
            ctx.fillStyle = '#ffcccc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Рисуем рамку
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            
            // Рисуем текст
            ctx.fillStyle = '#000000';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Тест', canvas.width/2, canvas.height/2);
            
            // Теперь пробуем нарисовать противника
            console.log('🎯 Рисуем противника:', this.currentEnemy);
            
            const success = GameUtils.drawEnemy(
                ctx,
                this.atlasManager,
                this.currentEnemy,
                0, 0,
                250, 250
            );
            
            console.log('Результат отрисовки:', success ? '✅' : '❌');
        }
        
        if (totalDamage) {
            totalDamage.textContent = this.pokemonManager.getTeamDamage();
        }
    }
}

window.BattleSystem = BattleSystem;