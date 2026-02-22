// ==============================
// СИСТЕМА ЛОКАЦИЙ И КАРТЫ
// ==============================

class LocationSystem {
    constructor(game) {
        this.game = game;
        this.currentLocation = 'pallet_town';
        this.availableLocations = ['pallet_town'];
        this.transitionInProgress = false;
        this.transitionEndTime = null;
        this.dailyQuests = {};
        this.lastQuestUpdate = null;
        
        // Карта региона Канто
        this.locations = {
            'pallet_town': {
                name: 'Паллет Таун',
                description: 'Тихий городок, где начинаются приключения',
                neighbors: ['route_1'],
                icon: '🏠',
                questCount: 3,
                position: { x: 40, y: 80 }
            },
            'route_1': {
                name: 'Маршрут 1',
                description: 'Дорога через зеленые луга',
                neighbors: ['pallet_town', 'viridian_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 40, y: 60 }
            },
            'viridian_city': {
                name: 'Веридиан Сити',
                description: 'Город с видом на вечнозеленый лес',
                neighbors: ['route_1', 'route_2', 'route_22'],
                icon: '🏙️',
                questCount: 4,
                position: { x: 40, y: 40 }
            },
            'route_2': {
                name: 'Маршрут 2',
                description: 'Дорога к лесу',
                neighbors: ['viridian_city', 'viridian_forest'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 25, y: 30 }
            },
            'viridian_forest': {
                name: 'Веридианский лес',
                description: 'Густой лес с множеством насекомых',
                neighbors: ['route_2', 'pewter_city'],
                icon: '🌲',
                questCount: 4,
                position: { x: 25, y: 20 }
            },
            'pewter_city': {
                name: 'Пьютер Сити',
                description: 'Город у подножия гор',
                neighbors: ['viridian_forest', 'route_3'],
                icon: '⛰️',
                questCount: 4,
                position: { x: 25, y: 10 }
            },
            'route_3': {
                name: 'Маршрут 3',
                description: 'Горная тропа',
                neighbors: ['pewter_city', 'mt_moon'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 40, y: 10 }
            },
            'mt_moon': {
                name: 'Лунная гора',
                description: 'Таинственная гора с пещерами',
                neighbors: ['route_3', 'cerulean_city'],
                icon: '🌙',
                questCount: 4,
                position: { x: 55, y: 10 }
            },
            'cerulean_city': {
                name: 'Церулин Сити',
                description: 'Город с красивыми фонтанами',
                neighbors: ['mt_moon', 'route_4', 'route_5', 'route_9'],
                icon: '💧',
                questCount: 4,
                position: { x: 70, y: 15 }
            },
            'route_4': {
                name: 'Маршрут 4',
                description: 'Дорога вдоль реки',
                neighbors: ['cerulean_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 85, y: 15 }
            },
            'route_5': {
                name: 'Маршрут 5',
                description: 'Тихая дорога на юг',
                neighbors: ['cerulean_city', 'vermilion_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 70, y: 30 }
            },
            'vermilion_city': {
                name: 'Вермилион Сити',
                description: 'Портовый город с большим кораблем',
                neighbors: ['route_5', 'route_6'],
                icon: '⚓',
                questCount: 4,
                position: { x: 70, y: 45 }
            },
            'route_6': {
                name: 'Маршрут 6',
                description: 'Дорога вдоль побережья',
                neighbors: ['vermilion_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 70, y: 60 }
            },
            'route_9': {
                name: 'Маршрут 9',
                description: 'Извилистая горная дорога',
                neighbors: ['cerulean_city', 'rock_tunnel'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 85, y: 30 }
            },
            'rock_tunnel': {
                name: 'Каменный туннель',
                description: 'Темный туннель сквозь гору',
                neighbors: ['route_9', 'lavender_town'],
                icon: '🚇',
                questCount: 4,
                position: { x: 85, y: 45 }
            },
            'lavender_town': {
                name: 'Лавандовый город',
                description: 'Город с Башней Покемонов',
                neighbors: ['rock_tunnel', 'route_8'],
                icon: '🔮',
                questCount: 4,
                position: { x: 85, y: 60 }
            },
            'route_8': {
                name: 'Маршрут 8',
                description: 'Дорога через холмы',
                neighbors: ['lavender_town', 'saffron_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 70, y: 70 }
            },
            'saffron_city': {
                name: 'Саффрон Сити',
                description: 'Крупный город с офисами',
                neighbors: ['route_7', 'route_8', 'route_16'],
                icon: '🏢',
                questCount: 4,
                position: { x: 55, y: 70 }
            },
            'route_7': {
                name: 'Маршрут 7',
                description: 'Дорога через поля',
                neighbors: ['saffron_city', 'celadon_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 40, y: 70 }
            },
            'celadon_city': {
                name: 'Селадон Сити',
                description: 'Большой город с торговым центром',
                neighbors: ['route_7', 'route_16'],
                icon: '🛍️',
                questCount: 4,
                position: { x: 25, y: 70 }
            },
            'route_16': {
                name: 'Маршрут 16',
                description: 'Дорога к циклопу',
                neighbors: ['celadon_city', 'saffron_city', 'fuchsia_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 30, y: 85 }
            },
            'fuchsia_city': {
                name: 'Фуксия Сити',
                description: 'Город с сафари-зоной',
                neighbors: ['route_16', 'route_15', 'route_18'],
                icon: '🦒',
                questCount: 4,
                position: { x: 45, y: 95 }
            },
            'route_15': {
                name: 'Маршрут 15',
                description: 'Прибрежная дорога',
                neighbors: ['fuchsia_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 60, y: 95 }
            },
            'route_18': {
                name: 'Маршрут 18',
                description: 'Дорога через луга',
                neighbors: ['fuchsia_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 30, y: 95 }
            },
            'route_22': {
                name: 'Маршрут 22',
                description: 'Дорога к Лиге',
                neighbors: ['viridian_city'],
                icon: '🛤️',
                questCount: 3,
                position: { x: 10, y: 40 }
            }
        };
        
        // Квесты для локаций
        this.questTemplates = [
            {
                id: 'catch_pokemon',
                name: 'Поймать покемона',
                description: 'Поймайте покемона в этой локации',
                reward: 50,
                progress: 0,
                target: 1
            },
            {
                id: 'defeat_enemies',
                name: 'Победить врагов',
                description: 'Победите врагов в этой локации',
                reward: 30,
                progress: 0,
                target: 5
            },
            {
                id: 'collect_money',
                name: 'Собрать поке-баксы',
                description: 'Заработайте поке-баксы в этой локации',
                reward: 40,
                progress: 0,
                target: 100
            },
            {
                id: 'use_pokeballs',
                name: 'Использовать покеболы',
                description: 'Откройте покеболы в этой локации',
                reward: 45,
                progress: 0,
                target: 3
            },
            {
                id: 'team_damage',
                name: 'Нанести урон',
                description: 'Нанесите урон врагам',
                reward: 35,
                progress: 0,
                target: 500
            }
        ];
        
        this.init();
    }
    
    init() {
        this.loadProgress();
        this.updateDailyQuests();
        
        // Проверяем, не истек ли таймер перехода
        if (this.transitionEndTime) {
            const now = Date.now();
            if (now >= this.transitionEndTime) {
                this.completeTransition();
            }
        }
    }
    
    loadProgress() {
        const saved = localStorage.getItem('pokemon_location_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentLocation = data.currentLocation || 'pallet_town';
                this.availableLocations = data.availableLocations || ['pallet_town'];
                this.transitionEndTime = data.transitionEndTime || null;
                this.lastQuestUpdate = data.lastQuestUpdate || null;
                this.dailyQuests = data.dailyQuests || {};
                
                // Обновляем доступные локации на основе текущей
                this.updateAvailableLocations();
            } catch (e) {
                console.error('Ошибка загрузки прогресса локаций:', e);
            }
        }
    }
    
    saveProgress() {
        const data = {
            currentLocation: this.currentLocation,
            availableLocations: this.availableLocations,
            transitionEndTime: this.transitionEndTime,
            lastQuestUpdate: this.lastQuestUpdate,
            dailyQuests: this.dailyQuests
        };
        localStorage.setItem('pokemon_location_progress', JSON.stringify(data));
    }
    
    updateAvailableLocations() {
        const current = this.locations[this.currentLocation];
        if (current) {
            current.neighbors.forEach(neighbor => {
                if (!this.availableLocations.includes(neighbor)) {
                    this.availableLocations.push(neighbor);
                }
            });
        }
    }
    
    canTravelTo(locationId) {
        // Проверяем, доступна ли локация
        if (!this.availableLocations.includes(locationId)) {
            return { allowed: false, reason: 'Локация еще не открыта' };
        }
        
        // Проверяем, не в процессе ли перехода
        if (this.transitionInProgress) {
            return { allowed: false, reason: 'Переход уже выполняется' };
        }
        
        // Проверяем, соседняя ли это локация
        const current = this.locations[this.currentLocation];
        if (!current.neighbors.includes(locationId)) {
            return { allowed: false, reason: 'Можно переходить только в соседние локации' };
        }
        
        return { allowed: true };
    }
    
    startTravel(locationId) {
        const check = this.canTravelTo(locationId);
        if (!check.allowed) {
            this.game.showNotification(check.reason, 'warning');
            return false;
        }
        
        // Начинаем переход (15 секунд)
        const travelTime = 15 * 1000; // 15 секунд для демонстрации, можно изменить
        this.transitionInProgress = true;
        this.transitionEndTime = Date.now() + travelTime;
        
        // Сохраняем данные перехода
        this.saveProgress();
        
        // Показываем уведомление
        this.game.showNotification(`Переход в ${this.locations[locationId].name}... ${travelTime/1000} сек.`, 'info');
        
        // Запускаем таймер
        setTimeout(() => {
            this.completeTransition(locationId);
        }, travelTime);
        
        return true;
    }
    
    completeTransition(locationId = null) {
        if (locationId) {
            this.currentLocation = locationId;
            this.updateAvailableLocations();
        }
        
        this.transitionInProgress = false;
        this.transitionEndTime = null;
        
        // Сохраняем прогресс
        this.saveProgress();
        
        // Обновляем квесты для новой локации
        this.updateDailyQuests();
        
        // Показываем уведомление
        this.game.showNotification(`Вы прибыли в ${this.locations[this.currentLocation].name}!`, 'success');
        
        // Обновляем UI
        if (this.game.uiManager) {
            this.game.uiManager.updateLocationUI();
        }
    }
    
    updateDailyQuests() {
        const now = new Date();
        const today = now.toDateString();
        
        // Проверяем, нужно ли обновить квесты
        if (this.lastQuestUpdate !== today) {
            // Генерируем новые квесты для всех локаций
            this.generateDailyQuests();
            this.lastQuestUpdate = today;
            this.saveProgress();
        }
        
        // Обновляем прогресс текущей локации, если нужно
        if (!this.dailyQuests[this.currentLocation]) {
            this.generateQuestsForLocation(this.currentLocation);
        }
    }
    
    generateDailyQuests() {
        Object.keys(this.locations).forEach(locationId => {
            this.generateQuestsForLocation(locationId);
        });
    }
    
    generateQuestsForLocation(locationId) {
        const location = this.locations[locationId];
        const questCount = location.questCount || 3;
        
        // Выбираем случайные квесты
        const quests = [];
        const shuffled = [...this.questTemplates].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < questCount; i++) {
            if (i < shuffled.length) {
                const template = { ...shuffled[i] };
                quests.push({
                    ...template,
                    id: `${template.id}_${locationId}_${Date.now()}_${i}`,
                    progress: 0,
                    completed: false,
                    claimed: false
                });
            }
        }
        
        this.dailyQuests[locationId] = quests;
    }
    
    getCurrentQuests() {
        return this.dailyQuests[this.currentLocation] || [];
    }
    
    updateQuestProgress(eventType, amount = 1, data = {}) {
        const quests = this.getCurrentQuests();
        let updated = false;
        
        quests.forEach(quest => {
            if (quest.completed || quest.claimed) return;
            
            if (quest.id.startsWith(eventType)) {
                quest.progress = Math.min(quest.progress + amount, quest.target);
                
                if (quest.progress >= quest.target && !quest.completed) {
                    quest.completed = true;
                    this.game.showNotification(`Квест выполнен: ${quest.name}!`, 'success');
                    updated = true;
                }
            }
        });
        
        if (updated) {
            this.saveProgress();
            if (this.game.uiManager) {
                this.game.uiManager.updateQuestsUI();
            }
        }
    }
    
    claimQuestReward(questId) {
        const quests = this.getCurrentQuests();
        const quest = quests.find(q => q.id === questId);
        
        if (!quest || !quest.completed || quest.claimed) {
            return false;
        }
        
        // Выдаем награду
        this.game.shopSystem.addMoney(quest.reward);
        quest.claimed = true;
        
        this.saveProgress();
        this.game.showNotification(`+${quest.reward} поке-баксов!`, 'success');
        
        if (this.game.uiManager) {
            this.game.uiManager.updateQuestsUI();
        }
        
        return true;
    }
}

window.LocationSystem = LocationSystem;