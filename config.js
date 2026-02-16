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
    ENEMY_HP_MULTIPLIER: 1.5,
    REWARD_MULTIPLIER: 10,
    
    // Авто-атака
    AUTO_ATTACK_INTERVAL: 3000,
    
    // Типы покемонов
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
    
    // Шансы выпадения из покеболов
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
        ENERGY_RESTORE: 50,
        TEAM_EXPANDER: 1000
    },
    
    // Максимальный размер команды
    MAX_TEAM_SIZE: 3,
    
    // Энергия покемонов
    MAX_ENERGY: 100,
    ENERGY_DECAY_PER_ATTACK: 1,
    ENERGY_RESTORE_PER_SECOND: 0.1,
    
    // Данные покемонов (без координат атласа)
    POKEMON_DATA: {
        1: { 
            name: 'Раттата', 
            rarity: 'COMMON', 
            types: ['NORMAL'], 
            baseDamage: 5,
            imageKey: 'rattata'
        },
        2: { 
            name: 'Пиджи', 
            rarity: 'COMMON', 
            types: ['NORMAL', 'FLYING'], 
            baseDamage: 4,
            imageKey: 'pidgey'
        },
        3: { 
            name: 'Бульбазавр', 
            rarity: 'UNCOMMON', 
            types: ['GRASS', 'POISON'], 
            baseDamage: 8,
            imageKey: 'bulbasaur'
        },
        4: { 
            name: 'Чармандер', 
            rarity: 'UNCOMMON', 
            types: ['FIRE'], 
            baseDamage: 9,
            imageKey: 'charmander'
        },
        5: { 
            name: 'Сквиртл', 
            rarity: 'RARE', 
            types: ['WATER'], 
            baseDamage: 12,
            imageKey: 'squirtle'
        },
        6: { 
            name: 'Пикачу', 
            rarity: 'RARE', 
            types: ['ELECTRIC'], 
            baseDamage: 15,
            imageKey: 'pikachu'
        },
        7: { 
            name: 'Иви', 
            rarity: 'EPIC', 
            types: ['NORMAL'], 
            baseDamage: 25,
            imageKey: 'eevee'
        },
        8: { 
            name: 'Дратини', 
            rarity: 'EPIC', 
            types: ['DRAGON'], 
            baseDamage: 30,
            imageKey: 'dratini'
        },
        9: { 
            name: 'Снорлакс', 
            rarity: 'SPECIAL', 
            types: ['NORMAL'], 
            baseDamage: 40,
            imageKey: 'snorlax'
        },
        10: { 
            name: 'Лапрас', 
            rarity: 'SPECIAL', 
            types: ['WATER', 'ICE'], 
            baseDamage: 35,
            imageKey: 'lapras'
        },
        11: { 
            name: 'Мью', 
            rarity: 'LEGENDARY', 
            types: ['PSYCHIC'], 
            baseDamage: 80,
            imageKey: 'mew'
        },
        12: { 
            name: 'Мьюту', 
            rarity: 'LEGENDARY', 
            types: ['PSYCHIC'], 
            baseDamage: 90,
            imageKey: 'mewtwo'
        },
        13: { 
            name: 'Хупа', 
            rarity: 'LEGENDARY', 
            types: ['PSYCHIC', 'GHOST'], 
            baseDamage: 85,
            imageKey: 'hoopa'
        }
    },
    
    // Данные противников
    ENEMY_DATA: [
        { 
            name: 'Раттата', 
            rarity: 'COMMON', 
            types: ['NORMAL'],
            imageKey: 'rattata'
        },
        { 
            name: 'Зубат', 
            rarity: 'COMMON', 
            types: ['POISON', 'FLYING'],
            imageKey: 'zubat'
        },
        { 
            name: 'Мяут', 
            rarity: 'UNCOMMON', 
            types: ['NORMAL'],
            imageKey: 'meowth'
        },
        { 
            name: 'Псидак', 
            rarity: 'UNCOMMON', 
            types: ['WATER'],
            imageKey: 'psyduck'
        },
        { 
            name: 'Гастли', 
            rarity: 'RARE', 
            types: ['GHOST', 'POISON'],
            imageKey: 'gastly'
        },
        { 
            name: 'Оникс', 
            rarity: 'EPIC', 
            types: ['ROCK', 'GROUND'],
            imageKey: 'onix'
        },
        { 
            name: 'Сайтер', 
            rarity: 'SPECIAL', 
            types: ['BUG', 'FLYING'],
            imageKey: 'scyther'
        },
        { 
            name: 'Артикуно', 
            rarity: 'LEGENDARY', 
            types: ['ICE', 'FLYING'],
            imageKey: 'articuno'
        },
        { 
            name: 'Молтрес', 
            rarity: 'LEGENDARY', 
            types: ['FIRE', 'FLYING'],
            imageKey: 'moltres'
        }
    ],

    // Данные покеболов
    POKEBALL_DATA: {
        NORMAL: {
            name: 'Покебол',
            description: 'Обычный покебол. Шанс получить обычного или необычного покемона.',
            price: 10,
            color: '#ff4444',
            imageKey: 'NORMAL'
        },
        MASTER: {
            name: 'Мастербол',
            description: 'Редкий покебол. Высокий шанс получить редких и эпических покемонов.',
            price: 100,
            color: '#9c27b0',
            imageKey: 'MASTER'
        },
        MYTHIC: {
            name: 'Мификбол',
            description: 'Легендарный покебол. Максимальный шанс получить легендарных покемонов.',
            price: 500,
            color: '#ffd700',
            imageKey: 'MYTHIC'
        }
    }
};

// Для обратной совместимости
CONFIG.POKEMON_SPRITES = CONFIG.POKEMON_DATA;
CONFIG.ENEMY_SPRITES = CONFIG.ENEMY_DATA;
CONFIG.POKEBALL_SPRITES = CONFIG.POKEBALL_DATA;

window.GAME_CONFIG = CONFIG;