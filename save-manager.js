// ==============================
// save-manager.js
// ==============================

class SaveManager {
    constructor() {
        this.saveKey = GAME_CONFIG.SAVE_KEY;
    }

    load() {
        const saved = localStorage.getItem(this.saveKey);
        
        if (saved) {
            try {
                const data = JSON.parse(saved);
                console.log('📥 Загружено сохранение');
                return data;
            } catch (e) {
                console.error('Ошибка загрузки сохранения:', e);
            }
        }
        
        // Возвращаем новое состояние по умолчанию
        return {
            money: GAME_CONFIG.STARTING_MONEY,
            level: 1,
            pokeballs: { ...GAME_CONFIG.STARTING_POKEBALLS },
            collection: [],
            team: [],
            maxTeamSize: GAME_CONFIG.MAX_TEAM_SIZE,
            currentEnemy: null
        };
    }

    save(gameState) {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(gameState));
            console.log('💾 Игра сохранена');
            return true;
        } catch (e) {
            console.error('Ошибка сохранения:', e);
            return false;
        }
    }

    clear() {
        localStorage.removeItem(this.saveKey);
        console.log('🗑️ Сохранение удалено');
    }
}

window.SaveManager = SaveManager;