// ==============================
// ГЛАВНЫЙ КЛАСС ИГРЫ (обновленный)
// ==============================

class PokemonClickerGame {
    constructor() {
        // Инициализация систем
        this.saveManager = new SaveManager();
        this.pokemonManager = new PokemonManager();
        this.shopSystem = new ShopSystem(this.pokemonManager);
        this.battleSystem = new BattleSystem(this.pokemonManager);
        this.uiManager = new UIManager(this);
        this.animationManager = new AnimationManager();
        this.tutorialSystem = null; // Инициализируем позже
        
        // Состояние игры
        this.gameState = null;
        this.isInitialized = false;
        
        // Таймеры
        this.energyRestoreInterval = null;
        this.autoSaveInterval = null;
    }
    
    // Инициализация игры
    async init() {
        console.log('🚀 Инициализация Pokemon Clicker Game...');
        
        try {
            // Загружаем сохранение
            this.loadGame();
            
            // Инициализируем системы
            this.animationManager.initCSSAnimations();
            this.uiManager.initEventListeners();
            this.uiManager.updateUI();
            
            // Инициализируем туториал
            this.tutorialSystem = new TutorialSystem(this);
            
            // Создаем первого противника, если нет
            if (!this.battleSystem.currentEnemy) {
                this.battleSystem.createNewEnemy();
                this.battleSystem.updateUI();
            }
            
            // Блокируем кнопку атаки до завершения туториала
            const attackButton = document.getElementById('attack-button');
            if (attackButton) {
                attackButton.disabled = true;
            }
            
            // Запускаем восстановление энергии
            this.startEnergyRestore();
            
            // Запускаем автосохранение
            this.startAutoSave();
            
            // Инициализируем звуковую систему
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.init();
                
                // Активируем звуки после первого клика
                document.addEventListener('click', function activateSound() {
                    GameSoundGenerator.activate();
                    document.removeEventListener('click', activateSound);
                }, { once: true });
            }
            
            this.isInitialized = true;
            console.log('✅ Игра успешно инициализирована!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации игры:', error);
        }
    }
    
    // Загрузка игры
    loadGame() {
        this.gameState = this.saveManager.load();
        
        // Проверяем, проходил ли игрок туториал
        const hasCompletedTutorial = localStorage.getItem('pokemon_tutorial_completed');
        
        // Восстанавливаем состояние из сохранения
        this.shopSystem.setMoney(this.gameState.money);
        this.shopSystem.pokeballs = { ...this.gameState.pokeballs };
        this.pokemonManager.collection = [...this.gameState.collection];
        this.pokemonManager.team = [...this.gameState.team];
        this.pokemonManager.maxTeamSize = this.gameState.maxTeamSize;
        this.battleSystem.enemyLevel = this.gameState.currentEnemy.level;
        
        // Если игрок прошел туториал, но в сохранении нет покемонов,
        // добавляем начального покемона
        if (hasCompletedTutorial && this.pokemonManager.collection.length === 0) {
            this.addStarterPokemon();
        }
        
        // Восстанавливаем команду покемонов
        for (const pokemon of this.pokemonManager.collection) {
            pokemon.isInTeam = this.pokemonManager.team.some(p => p.id === pokemon.id);
        }
    }
    
    // Добавляет стартового покемона
    addStarterPokemon() {
        // Добавляем случайного обычного покемона
        const starterPokemonIds = [1, 2]; // Раттата и Пиджи
        const randomId = starterPokemonIds[Math.floor(Math.random() * starterPokemonIds.length)];
        const pokemon = this.pokemonManager.addToCollection(randomId);
        
        if (pokemon) {
            // Автоматически добавляем в команду
            this.pokemonManager.addToTeam(pokemon.id);
            console.log('🎁 Добавлен стартовый покемон:', pokemon.name);
        }
    }
    
    // Сохранение игры
    saveGame() {
        // Обновляем состояние игры
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
        
        // Сохраняем
        return this.saveManager.save(this.gameState);
    }
    
    // Ручная атака (с проверкой туториала)
    manualAttack() {
        // Проверяем, активен ли туториал
        if (this.tutorialSystem && this.tutorialSystem.isTutorialActive) {
            this.showNotification('Заверши обучение сначала!', 'warning');
            return;
        }
        
        // Проверяем, есть ли покемоны в команде
        if (this.pokemonManager.team.length === 0) {
            this.showNotification('Добавь покемонов в команду для атаки!', 'warning');
            this.uiManager.showModal('team');
            return;
        }
        
        const result = this.battleSystem.attackEnemy();
        
        // Создаем эффект урона
        if (result.damage > 0) {
            const button = document.getElementById('attack-button');
            if (button) {
                const rect = button.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top;
                
                this.animationManager.createDamageEffect(
                    result.damage, 
                    x, 
                    y, 
                    result.damage > 50
                );
            }
            
            // Проигрываем звук атаки
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.playAttack();
            }
        }
        
        // Если противник побежден
        if (result.defeated && result.reward) {
            this.shopSystem.addMoney(result.reward);
            this.showNotification(`Победа! +${result.reward} поке-баксов`, 'success');
            
            // Проигрываем звук победы
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.playVictory();
            }
            
            // Анимация смены противника
            if (result.enemy) {
                this.animationManager.animateEnemyChange(
                    result.enemy,
                    this.battleSystem.currentEnemy
                );
            }
        }
        
        // Обновляем UI
        this.uiManager.updateUI();
        
        // Сохраняем игру
        this.saveGame();
    }
    
    // Добавление покемона в команду
    addToTeam(pokemonId) {
        const result = this.pokemonManager.addToTeam(pokemonId);
        
        if (result.success) {
            // Если это первый покемон в команде, включаем кнопку атаки
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
    
    // Удаление покемона из команды
    removeFromTeam(pokemonId) {
        const pokemon = this.pokemonManager.getPokemonById(pokemonId);
        const removed = this.pokemonManager.removeFromTeam(pokemonId);
        
        if (removed) {
            this.uiManager.updateUI();
            this.saveGame();
            if (pokemon) {
                this.showNotification(`${pokemon.name} удален из команды`, 'info');
            }
            
            // Если команда пуста, блокируем кнопку атаки
            if (this.pokemonManager.team.length === 0) {
                const attackButton = document.getElementById('attack-button');
                if (attackButton) {
                    attackButton.disabled = true;
                }
            }
        }
        
        return removed;
    }
    
    // Показать уведомление
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
            
            // Автоматически удаляем через 5 секунд
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
    
    // Запуск восстановления энергии
    startEnergyRestore() {
        if (this.energyRestoreInterval) {
            clearInterval(this.energyRestoreInterval);
        }
        
        this.energyRestoreInterval = setInterval(() => {
            this.pokemonManager.restoreEnergy();
            // Обновляем только если есть изменения в энергии
            if (this.pokemonManager.collection.some(p => !p.isInTeam && p.energy < p.maxEnergy)) {
                this.uiManager.updateUI();
            }
        }, 1000);
    }
    
    // Запуск автосохранения
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
            console.log('💾 Автосохранение выполнено');
        }, GAME_CONFIG.AUTO_SAVE_INTERVAL);
    }
    
    // Очистка ресурсов
    cleanup() {
        // Останавливаем все интервалы
        if (this.energyRestoreInterval) {
            clearInterval(this.energyRestoreInterval);
        }
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        if (this.battleSystem.autoAttackInterval) {
            clearInterval(this.battleSystem.autoAttackInterval);
        }
        
        // Сохраняем игру
        this.saveGame();
    }
}

// ==============================
// ЗАПУСК ИГРЫ
// ==============================

// Создаем и запускаем игру при загрузке страницы
let game;

window.addEventListener('load', async () => {
    game = new PokemonClickerGame();
    await game.init();
    
    // Сохраняем игру при закрытии страницы
    window.addEventListener('beforeunload', () => {
        game.cleanup();
    });
    
    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            game.manualAttack();
        }
    });
});

// Экспортируем игру для отладки
window.Game = PokemonClickerGame;
window.gameInstance = game;