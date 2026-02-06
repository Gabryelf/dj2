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
    
    // Изображения покемонов (замените на свои)
    POKEMON_IMAGES: {
        // Обычные
        1: { name: 'Раттата', rarity: 'COMMON', types: ['NORMAL'], baseDamage: 5, image: './images/pokemon/1.png' },
        2: { name: 'Пиджи', rarity: 'COMMON', types: ['NORMAL', 'FLYING'], baseDamage: 4, image: './images/pokemon/2.png' },
        
        // Повсеместные
        3: { name: 'Бульбазавр', rarity: 'UNCOMMON', types: ['GRASS', 'POISON'], baseDamage: 8, image: './images/pokemon/3.png' },
        4: { name: 'Чармандер', rarity: 'UNCOMMON', types: ['FIRE'], baseDamage: 9, image: './images/pokemon/4.png' },
        
        // Редкие
        5: { name: 'Сквиртл', rarity: 'RARE', types: ['WATER'], baseDamage: 12, image: './images/pokemon/5.png' },
        6: { name: 'Пикачу', rarity: 'RARE', types: ['ELECTRIC'], baseDamage: 15, image: './images/pokemon/6.png' },
        
        // Эпические
        7: { name: 'Иви', rarity: 'EPIC', types: ['NORMAL'], baseDamage: 25, image: './images/pokemon/7.png' },
        8: { name: 'Дратини', rarity: 'EPIC', types: ['DRAGON'], baseDamage: 30, image: './images/pokemon/8.png' },
        
        // Специальные
        9: { name: 'Снорлакс', rarity: 'SPECIAL', types: ['NORMAL'], baseDamage: 40, image: './images/pokemon/9.png' },
        10: { name: 'Лапрас', rarity: 'SPECIAL', types: ['WATER', 'ICE'], baseDamage: 35, image: './images/pokemon/10.png' },
        
        // Легендарные
        11: { name: 'Мью', rarity: 'LEGENDARY', types: ['PSYCHIC'], baseDamage: 80, image: './images/pokemon/11.png' },
        12: { name: 'Мьюту', rarity: 'LEGENDARY', types: ['PSYCHIC'], baseDamage: 90, image: './images/pokemon/12.png' },
        
        // Добавьте больше покемонов по аналогии
    },
    
    // Изображения противников
    ENEMY_IMAGES: [
        { name: 'Раттата', rarity: 'COMMON', types: ['NORMAL'], image: './images/enemies/1.png' },
        { name: 'Зубат', rarity: 'COMMON', types: ['POISON', 'FLYING'], image: './images/enemies/2.png' },
        { name: 'Мяут', rarity: 'UNCOMMON', types: ['NORMAL'], image: './images/enemies/3.png' },
        { name: 'Псидак', rarity: 'UNCOMMON', types: ['BUG', 'POISON'], image: './images/enemies/4.png' },
        { name: 'Гастли', rarity: 'RARE', types: ['GHOST', 'POISON'], image: './images/enemies/5.png' },
        { name: 'Оникс', rarity: 'EPIC', types: ['ROCK', 'GROUND'], image: './images/enemies/6.png' },
        { name: 'Сайтрон', rarity: 'SPECIAL', types: ['GRASS', 'POISON'], image: './images/enemies/7.png' },
        { name: 'Артикуно', rarity: 'LEGENDARY', types: ['ICE', 'FLYING'], image: './images/enemies/8.png' }
    ]
};

// Экспорт конфигурации
window.GAME_CONFIG = CONFIG;