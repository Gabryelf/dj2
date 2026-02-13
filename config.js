// ==============================
// КОНФИГУРАЦИЯ ИГРЫ
// ==============================

const CONFIG = {
    // Настройки сохранений
    SAVE_KEY: 'pokemon_clicker_save',
    AUTO_SAVE_INTERVAL: 30000, // 30 секунд
    
    // Базовые значения
    STARTING_MONEY: 100,
    STARTING_POKEBALLS: {
        NORMAL: 5,
        MASTER: 0,
        MYTHIC: 0
    },
    
    // Настройки боя
    BASE_ENEMY_HP: 100,
    ENEMY_HP_MULTIPLIER: 1.5, // Умножается на уровень
    REWARD_MULTIPLIER: 10, // Награда за победу = уровень * множитель
    
    // Авто-атака
    AUTO_ATTACK_INTERVAL: 3000, // 3 секунды
    
    // Типы покемонов и их взаимодействия
    POKEMON_TYPES: {
        NORMAL: { strong: [], weak: ['FIGHTING'] },
        FIRE: { strong: ['GRASS', 'ICE', 'BUG'], weak: ['WATER', 'ROCK', 'GROUND'] },
        WATER: { strong: ['FIRE', 'GROUND', 'ROCK'], weak: ['ELECTRIC', 'GRASS'] },
        GRASS: { strong: ['WATER', 'GROUND', 'ROCK'], weak: ['FIRE', 'ICE', 'POISON', 'FLYING', 'BUG'] },
        ELECTRIC: { strong: ['WATER', 'FLYING'], weak: ['GROUND'] },
        ICE: { strong: ['GRASS', 'GROUND', 'FLYING', 'DRAGON'], weak: ['FIRE', 'FIGHTING', 'ROCK'] },
        FIGHTING: { strong: ['NORMAL', 'ICE', 'ROCK'], weak: ['FLYING', 'PSYCHIC'] },
        POISON: { strong: ['GRASS'], weak: ['GROUND', 'PSYCHIC'] },
        GROUND: { strong: ['FIRE', 'ELECTRIC', 'POISON', 'ROCK'], weak: ['WATER', 'GRASS', 'ICE'] },
        FLYING: { strong: ['GRASS', 'FIGHTING', 'BUG'], weak: ['ELECTRIC', 'ICE', 'ROCK'] },
        PSYCHIC: { strong: ['FIGHTING', 'POISON'], weak: ['BUG', 'GHOST'] },
        BUG: { strong: ['GRASS', 'PSYCHIC'], weak: ['FIRE', 'FLYING', 'ROCK'] },
        ROCK: { strong: ['FIRE', 'ICE', 'FLYING', 'BUG'], weak: ['WATER', 'GRASS', 'FIGHTING', 'GROUND'] },
        GHOST: { strong: ['PSYCHIC', 'GHOST'], weak: ['GHOST'] },
        DRAGON: { strong: ['DRAGON'], weak: ['ICE', 'DRAGON'] }
    },
    
    // Редкости покемонов
    RARITIES: {
        COMMON: { name: 'Обычный', color: '#6c757d', weight: 40, damageMultiplier: 1.0 },
        UNCOMMON: { name: 'Повсеместный', color: '#28a745', weight: 25, damageMultiplier: 1.2 },
        RARE: { name: 'Редкий', color: '#007bff', weight: 15, damageMultiplier: 1.5 },
        EPIC: { name: 'Эпический', color: '#9c27b0', weight: 10, damageMultiplier: 2.0 },
        SPECIAL: { name: 'Специальный', color: '#ff5722', weight: 7, damageMultiplier: 2.5 },
        LEGENDARY: { name: 'Легендарный', color: '#ffd700', weight: 3, damageMultiplier: 3.5 }
    },
    
    // Шансы выпадения из покеболов (в процентах)
    POKEBALL_RATES: {
        NORMAL: {
            COMMON: 60,
            UNCOMMON: 25,
            RARE: 10,
            EPIC: 4,
            SPECIAL: 0.9,
            LEGENDARY: 0.1
        },
        MASTER: {
            COMMON: 20,
            UNCOMMON: 25,
            RARE: 30,
            EPIC: 15,
            SPECIAL: 9,
            LEGENDARY: 1
        },
        MYTHIC: {
            COMMON: 10,
            UNCOMMON: 15,
            RARE: 25,
            EPIC: 25,
            SPECIAL: 19,
            LEGENDARY: 6
        }
    },
    
    // Цены в магазине
    SHOP_PRICES: {
        NORMAL_BALL: 10,
        MASTER_BALL: 100,
        MYTHIC_BALL: 500,
        ENERGY_RESTORE: 50, // Восстанавливает всю энергию одному покемону
        TEAM_EXPANDER: 1000 // Увеличивает максимальный размер команды
    },
    
    // Максимальный размер команды
    MAX_TEAM_SIZE: 3,
    
    // Энергия покемонов
    MAX_ENERGY: 100,
    ENERGY_DECAY_PER_ATTACK: 1, // Сколько энергии тратит покемон за атаку
    ENERGY_RESTORE_PER_SECOND: 0.1, // Сколько восстанавливается в секунду вне команды
    
    // ============================================
    // НАСТРОЙКИ АТЛАСОВ (НОВЫЙ ФОРМАТ)
    // ============================================
    
    // Настройки атласа покемонов
    ATLAS: {
        POKEMON: {
            image: './images/game/pokemons/pokemons.png',  // Путь к общему атласу покемонов
            tileWidth: 128,   // Ширина одного спрайта в пикселях
            tileHeight: 128,  // Высота одного спрайта в пикселях
            columns: 9      // Количество колонок в атласе (можно вычислить автоматически, если указать null)
        },
        ENEMIES: {
            image: './images/game/enemies/pokemons.png',  // Путь к общему атласу противников
            tileWidth: 128,
            tileHeight: 128,
            columns: 9
        },
        POKEBALLS: {  
            image: './images/game/pokeballs/pokeballs.png',
            tileWidth: 96,  
            tileHeight: 96,
            columns: 3      // 3 типа покеболов
        }
    },
    
    // Данные покемонов с координатами в атласе
    POKEMON_SPRITES: {
        // Обычные (ряд 0)
        1: { 
            name: 'Раттата', 
            rarity: 'COMMON', 
            types: ['NORMAL'], 
            baseDamage: 5,
            atlasX: 0,  // колонка 0, ряд 0
            atlasY: 0
        },
        2: { 
            name: 'Пиджи', 
            rarity: 'COMMON', 
            types: ['NORMAL', 'FLYING'], 
            baseDamage: 4,
            atlasX: 1,
            atlasY: 0
        },
        
        // Повсеместные (ряд 0)
        3: { 
            name: 'Бульбазавр', 
            rarity: 'UNCOMMON', 
            types: ['GRASS', 'POISON'], 
            baseDamage: 8,
            atlasX: 2,
            atlasY: 0
        },
        4: { 
            name: 'Чармандер', 
            rarity: 'UNCOMMON', 
            types: ['FIRE'], 
            baseDamage: 9,
            atlasX: 3,
            atlasY: 0
        },
        
        // Редкие (ряд 0)
        5: { 
            name: 'Сквиртл', 
            rarity: 'RARE', 
            types: ['WATER'], 
            baseDamage: 12,
            atlasX: 4,
            atlasY: 0
        },
        6: { 
            name: 'Пикачу', 
            rarity: 'RARE', 
            types: ['ELECTRIC'], 
            baseDamage: 15,
            atlasX: 5,
            atlasY: 0
        },
        
        // Эпические (ряд 0)
        7: { 
            name: 'Иви', 
            rarity: 'EPIC', 
            types: ['NORMAL'], 
            baseDamage: 25,
            atlasX: 6,
            atlasY: 0
        },
        8: { 
            name: 'Дратини', 
            rarity: 'EPIC', 
            types: ['DRAGON'], 
            baseDamage: 30,
            atlasX: 7,
            atlasY: 0
        },
        
        // Специальные (ряд 0)
        9: { 
            name: 'Снорлакс', 
            rarity: 'SPECIAL', 
            types: ['NORMAL'], 
            baseDamage: 40,
            atlasX: 8,
            atlasY: 0
        },
        10: { 
            name: 'Лапрас', 
            rarity: 'SPECIAL', 
            types: ['WATER', 'ICE'], 
            baseDamage: 35,
            atlasX: 9,
            atlasY: 0
        },
        
        // Легендарные (ряд 1)
        11: { 
            name: 'Мью', 
            rarity: 'LEGENDARY', 
            types: ['PSYCHIC'], 
            baseDamage: 80,
            atlasX: 0,
            atlasY: 1
        },
        12: { 
            name: 'Мьюту', 
            rarity: 'LEGENDARY', 
            types: ['PSYCHIC'], 
            baseDamage: 90,
            atlasX: 1,
            atlasY: 1
        },
        
        // Можно добавить еще ряд 1 для других легендарных
        13: { 
            name: 'Хупа', 
            rarity: 'LEGENDARY', 
            types: ['PSYCHIC', 'GHOST'], 
            baseDamage: 85,
            atlasX: 2,
            atlasY: 1
        },
        
        // Добавьте больше покемонов по аналогии
    },
    
    // Данные противников с координатами в атласе
    ENEMY_SPRITES: [
        { 
            name: 'Раттата', 
            rarity: 'COMMON', 
            types: ['NORMAL'],
            atlasX: 0,
            atlasY: 0
        },
        { 
            name: 'Зубат', 
            rarity: 'COMMON', 
            types: ['POISON', 'FLYING'],
            atlasX: 1,
            atlasY: 0
        },
        { 
            name: 'Мяут', 
            rarity: 'UNCOMMON', 
            types: ['NORMAL'],
            atlasX: 2,
            atlasY: 0
        },
        { 
            name: 'Псидак', 
            rarity: 'UNCOMMON', 
            types: ['BUG', 'POISON'],
            atlasX: 3,
            atlasY: 0
        },
        { 
            name: 'Гастли', 
            rarity: 'RARE', 
            types: ['GHOST', 'POISON'],
            atlasX: 4,
            atlasY: 0
        },
        { 
            name: 'Оникс', 
            rarity: 'EPIC', 
            types: ['ROCK', 'GROUND'],
            atlasX: 5,
            atlasY: 0
        },
        { 
            name: 'Сайтрон', 
            rarity: 'SPECIAL', 
            types: ['GRASS', 'POISON'],
            atlasX: 6,
            atlasY: 0
        },
        { 
            name: 'Артикуно', 
            rarity: 'LEGENDARY', 
            types: ['ICE', 'FLYING'],
            atlasX: 7,
            atlasY: 0
        },
        // Можно добавить второй ряд противников
        { 
            name: 'Молтрес', 
            rarity: 'LEGENDARY', 
            types: ['FIRE', 'FLYING'],
            atlasX: 0,
            atlasY: 1
        }
    ],

    // НОВЫЙ РАЗДЕЛ: Данные покеболов с координатами в атласе
    POKEBALL_SPRITES: {
        NORMAL: {
            name: 'Покебол',
            description: 'Обычный покебол. Шанс получить обычного или необычного покемона.',
            price: 10,
            atlasX: 0,  // Колонка 0 в атласе покеболов
            atlasY: 0,  // Ряд 0
            color: '#ff4444'
        },
        MASTER: {
            name: 'Мастербол',
            description: 'Редкий покебол. Высокий шанс получить редких и эпических покемонов.',
            price: 100,
            atlasX: 1,
            atlasY: 0,
            color: '#9c27b0'
        },
        MYTHIC: {
            name: 'Мификбол',
            description: 'Легендарный покебол. Максимальный шанс получить легендарных покемонов.',
            price: 500,
            atlasX: 2,
            atlasY: 0,
            color: '#ffd700'
        }
    },
    
    // Для обратной совместимости
    POKEBALL_IMAGES: {
        NORMAL: './images/game/pokeballs/pokeballs.png',
        MASTER: './images/game/pokeballs/masterballs.png',
        MYTHIC: './images/game/pokeballs/ultraballs.png'
    }
    
   
};

// Для обратной совместимости, если где-то используется старый формат
// Можно добавить прокси для доступа к старым полям
CONFIG.POKEMON_IMAGES = CONFIG.POKEMON_SPRITES; // Для совместимости
CONFIG.ENEMY_IMAGES = CONFIG.ENEMY_SPRITES;


// Экспорт конфигурации
window.GAME_CONFIG = CONFIG;