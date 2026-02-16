// ==============================
// ГЛАВНЫЙ КЛАСС ИГРЫ С ПОДДЕРЖКОЙ СЛИЯНИЯ
// ==============================

class PokemonClickerGame {
    constructor() {
        // Системы
        this.saveManager = new SaveManager();
        this.pokemonManager = null;
        this.shopSystem = null;
        this.battleSystem = null;
        this.uiManager = null;
        this.animationManager = new AnimationManager();
        this.tutorialSystem = null;
        
        // Менеджер изображений
        this.imageManager = null;
        
        // Состояние
        this.gameState = null;
        this.isInitialized = false;
        
        // Таймеры
        this.energyRestoreInterval = null;
        this.autoSaveInterval = null;
    }
    
    async init() {
        console.log('🚀 Инициализация Pokemon Clicker Game...');
        
        try {
            // 1. Инициализируем менеджер изображений
            this.imageManager = new ImageManager(IMAGE_CONFIG);
            
            // 2. Предзагружаем изображения
            await this.imageManager.preloadAll();
            console.log('✅ Все изображения загружены!');
            
            // 3. Загружаем сохранение
            this.loadGame();
            
            // 4. Инициализируем системы
            this.pokemonManager = new PokemonManager();
            this.shopSystem = new ShopSystem(this.pokemonManager, this, this.imageManager);
            this.battleSystem = new BattleSystem(this.pokemonManager, this, this.imageManager);
            this.uiManager = new UIManager(this, this.imageManager);
            
            // 5. Подписываемся на события слияния
            this.pokemonManager.onMerge((mergeData) => {
                this.uiManager.showMergeAnimation(mergeData);
                this.showNotification(
                    `${mergeData.pokemon.name} достиг ${mergeData.newLevel} уровня!`,
                    'success'
                );
            });
            
            // 6. Инициализируем UI
            this.animationManager.initCSSAnimations();
            this.uiManager.initEventListeners();
            
            // 7. Инициализируем туториал
            this.tutorialSystem = new TutorialSystem(this);
            
            // 8. Создаем первого противника
            if (!this.battleSystem.currentEnemy) {
                this.battleSystem.createNewEnemy();
            }
            
            // 9. Обновляем UI
            await this.uiManager.updateUI();
            
            // 10. Запускаем таймеры
            this.startEnergyRestore();
            this.startAutoSave();
            
            // 11. Блокируем кнопку атаки до завершения туториала
            const attackButton = document.getElementById('attack-button');
            if (attackButton) {
                attackButton.disabled = true;
            }
            
            // 12. Инициализируем звуки
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.init();
                document.addEventListener('click', function activateSound() {
                    GameSoundGenerator.activate();
                    document.removeEventListener('click', activateSound);
                }, { once: true });
            }
            
            // 13. Обновляем изображения покеболов
            await updatePokeballImages(this.imageManager);
            
            this.isInitialized = true;
            console.log('✅ Игра успешно инициализирована!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации игры:', error);
        }
    }
    
    loadGame() {
        this.gameState = this.saveManager.load();
        
        // Восстанавливаем состояние
        if (this.shopSystem) {
            this.shopSystem.setMoney(this.gameState.money);
            this.shopSystem.pokeballs = { ...this.gameState.pokeballs };
        }
        
        if (this.pokemonManager) {
            this.pokemonManager.collection = [...this.gameState.collection];
            this.pokemonManager.team = [...this.gameState.team];
            this.pokemonManager.maxTeamSize = this.gameState.maxTeamSize;
        }
        
        if (this.battleSystem && this.gameState.currentEnemy) {
            this.battleSystem.enemyLevel = this.gameState.currentEnemy.level;
        }
        
        const hasCompletedTutorial = localStorage.getItem('pokemon_tutorial_completed');
        if (hasCompletedTutorial && this.pokemonManager && this.pokemonManager.collection.length === 0) {
            this.addStarterPokemon();
        }
        
        if (this.pokemonManager) {
            for (const pokemon of this.pokemonManager.collection) {
                pokemon.isInTeam = this.pokemonManager.team.some(p => p.id === pokemon.id);
            }
        }
    }
    
    addStarterPokemon() {
        const starterPokemonIds = [1, 2];
        const randomId = starterPokemonIds[Math.floor(Math.random() * starterPokemonIds.length)];
        
        const pokemon = this.pokemonManager.addToCollection(randomId);
        
        if (pokemon) {
            const result = this.pokemonManager.addToTeam(pokemon.id);
            if (result.success) {
                console.log('🎁 Добавлен стартовый покемон:', pokemon.name);
                
                const attackButton = document.getElementById('attack-button');
                if (attackButton) {
                    attackButton.disabled = false;
                }
            }
        }
    }
    
    saveGame() {
        this.gameState.money = this.shopSystem.money;
        this.gameState.pokeballs = { ...this.shopSystem.pokeballs };
        this.gameState.collection = [...this.pokemonManager.collection];
        this.gameState.team = [...this.pokemonManager.team];
        this.gameState.maxTeamSize = this.pokemonManager.maxTeamSize;
        
        if (this.battleSystem.currentEnemy) {
            this.gameState.currentEnemy = {
                id: this.battleSystem.currentEnemy.id,
                hp: this.battleSystem.currentEnemy.hp,
                maxHp: this.battleSystem.currentEnemy.maxHp,
                level: this.battleSystem.enemyLevel
            };
        }
        
        return this.saveManager.save(this.gameState);
    }
    
    manualAttack() {
        if (this.tutorialSystem && this.tutorialSystem.isTutorialActive) {
            this.showNotification('Заверши обучение сначала!', 'warning');
            return;
        }
        
        if (this.pokemonManager.team.length === 0) {
            this.showNotification('Добавь покемонов в команду для атаки!', 'warning');
            this.uiManager.showModal('team');
            return;
        }
        
        const result = this.battleSystem.attackEnemy();
        
        if (result.damage > 0) {
            const button = document.getElementById('attack-button');
            if (button) {
                const rect = button.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top;
                
                this.animationManager.createDamageEffect(
                    Math.floor(result.damage), 
                    x, 
                    y, 
                    result.damage > 50
                );
            }
            
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.playAttack();
            }
        }
        
        if (result.defeated && result.reward) {
            this.shopSystem.addMoney(result.reward);
            this.showNotification(`Победа! +${result.reward} поке-баксов`, 'success');
            
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.playVictory();
            }
            
            if (result.enemy) {
                this.animationManager.animateEnemyChange(
                    result.enemy,
                    this.battleSystem.currentEnemy
                );
            }
        }
        
        this.uiManager.updateUI();
        this.saveGame();
    }
    
    addToTeam(pokemonId) {
        const result = this.pokemonManager.addToTeam(pokemonId);
        
        if (result.success) {
            if (this.pokemonManager.team.length === 1) {
                const attackButton = document.getElementById('attack-button');
                if (attackButton) {
                    attackButton.disabled = false;
                }
            }
            
            this.uiManager.updateUI();
            this.saveGame();
            this.showNotification(`${result.pokemon.name} добавлен в команду!`, 'success');
        } else {
            this.showNotification(result.message, 'error');
        }
        
        return result;
    }
    
    removeFromTeam(pokemonId) {
        const pokemon = this.pokemonManager.getPokemonById(pokemonId);
        const removed = this.pokemonManager.removeFromTeam(pokemonId);
        
        if (removed) {
            this.uiManager.updateUI();
            this.saveGame();
            if (pokemon) {
                this.showNotification(`${pokemon.name} удален из команды`, 'info');
            }
            
            if (this.pokemonManager.team.length === 0) {
                const attackButton = document.getElementById('attack-button');
                if (attackButton) {
                    attackButton.disabled = true;
                }
            }
        }
        
        return removed;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 5000);
        }
    }
    
    startEnergyRestore() {
        if (this.energyRestoreInterval) {
            clearInterval(this.energyRestoreInterval);
        }
        
        this.energyRestoreInterval = setInterval(() => {
            this.pokemonManager.restoreEnergy();
            if (this.pokemonManager.collection.some(p => !p.isInTeam && p.energy < p.maxEnergy)) {
                this.uiManager.updateUI();
            }
        }, 1000);
    }
    
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
            console.log('💾 Автосохранение выполнено');
        }, GAME_CONFIG.AUTO_SAVE_INTERVAL);
    }
    
    cleanup() {
        if (this.energyRestoreInterval) {
            clearInterval(this.energyRestoreInterval);
        }
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        if (this.battleSystem) {
            this.battleSystem.cleanup();
        }
        
        this.saveGame();
    }
}

// Запуск игры
let game;

window.addEventListener('load', async () => {
    game = new PokemonClickerGame();
    await game.init();
    
    window.addEventListener('beforeunload', () => {
        game.cleanup();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            game.manualAttack();
        }
    });
});

window.Game = PokemonClickerGame;
window.gameInstance = game;