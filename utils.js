// ==============================
// utils.js - Утилиты для работы с игрой
// ==============================

class SpriteAtlas {
    constructor(imagePath, tileWidth, tileHeight, columns = null) {
        this.image = new Image();
        this.imagePath = imagePath;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.columns = columns;
        this.loaded = false;
        this.fallbackCanvas = null;
        this.loadCallbacks = [];
        
        this.image.onload = () => {
            console.log(`✅ Атлас загружен: ${imagePath} (${this.image.width}x${this.image.height})`);
            this.loaded = true;
            
            if (!this.columns && this.image.width > 0) {
                this.columns = Math.floor(this.image.width / this.tileWidth);
                console.log(`   Автоматически определено колонок: ${this.columns}`);
            }
            
            this.loadCallbacks.forEach(callback => callback());
            this.loadCallbacks = [];
        };
        
        this.image.onerror = () => {
            console.error(`❌ Ошибка загрузки атласа: ${imagePath}`);
            this.loaded = true; // Считаем загруженным, чтобы не ждать вечно
            this.loadCallbacks.forEach(callback => callback());
            this.loadCallbacks = [];
        };
        
        this.image.src = imagePath;
    }
    
    waitForLoad() {
        return new Promise((resolve) => {
            if (this.loaded) {
                resolve();
            } else {
                this.loadCallbacks.push(resolve);
            }
        });
    }
    
    getSpriteByGrid(col, row) {
        return {
            x: col * this.tileWidth,
            y: row * this.tileHeight,
            width: this.tileWidth,
            height: this.tileHeight
        };
    }
    
    drawGrid(ctx, col, row, destX, destY, destWidth = null, destHeight = null) {
        if (!this.loaded || !this.image.complete || this.image.naturalWidth === 0) {
            this.drawFallback(ctx, destX, destY, destWidth || this.tileWidth, destHeight || this.tileHeight);
            return false;
        }
        
        try {
            const sprite = this.getSpriteByGrid(col, row);
            const width = destWidth || this.tileWidth;
            const height = destHeight || this.tileHeight;
            
            ctx.drawImage(
                this.image,
                sprite.x, sprite.y,
                sprite.width, sprite.height,
                destX, destY,
                width, height
            );
            return true;
        } catch (e) {
            console.warn('Ошибка отрисовки атласа:', e);
            this.drawFallback(ctx, destX, destY, destWidth || this.tileWidth, destHeight || this.tileHeight);
            return false;
        }
    }
    
    drawFallback(ctx, x, y, width, height) {
        // Рисуем заглушку (цветной квадрат)
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Рисуем знак вопроса
        ctx.fillStyle = '#666666';
        ctx.font = `${Math.floor(width * 0.6)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', x + width/2, y + height/2);
    }
}

class AtlasManager {
    constructor() {
        this.atlases = new Map();
        this.isReady = false;
        this.readyCallbacks = [];
    }
    
    add(key, imagePath, tileWidth, tileHeight, columns = null) {
        const atlas = new SpriteAtlas(imagePath, tileWidth, tileHeight, columns);
        this.atlases.set(key, atlas);
        return atlas;
    }
    
    get(key) {
        return this.atlases.get(key);
    }
    
    async waitForAll() {
        const promises = [];
        for (let atlas of this.atlases.values()) {
            promises.push(atlas.waitForLoad());
        }
        await Promise.all(promises);
        this.isReady = true;
        this.readyCallbacks.forEach(cb => cb());
        this.readyCallbacks = [];
    }
    
    onReady(callback) {
        if (this.isReady) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }
}

// Функции для получения координат
function getPokemonAtlasCoords(pokemonId, config) {
    const pokemon = config.POKEMON_SPRITES[pokemonId];
    if (!pokemon) {
        console.error(`Покемон с ID ${pokemonId} не найден`);
        return null;
    }
    
    return {
        col: pokemon.atlasX,
        row: pokemon.atlasY,
        name: pokemon.name,
        types: pokemon.types,
        rarity: pokemon.rarity,
        baseDamage: pokemon.baseDamage
    };
}

function getRandomEnemyAtlasCoords(config) {
    const enemies = config.ENEMY_SPRITES;
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    
    return {
        col: enemy.atlasX,
        row: enemy.atlasY,
        name: enemy.name,
        types: enemy.types,
        rarity: enemy.rarity
    };
}

function getPokeballSprite(type, config) {
    const pokeball = config.POKEBALL_SPRITES[type];
    if (!pokeball) {
        console.error(`Покебол типа ${type} не найден`);
        return null;
    }
    
    return {
        col: pokeball.atlasX,
        row: pokeball.atlasY,
        name: pokeball.name,
        description: pokeball.description,
        price: pokeball.price,
        color: pokeball.color
    };
}

function getAllPokeballs(config) {
    return Object.entries(config.POKEBALL_SPRITES).map(([type, data]) => ({
        type: type,
        col: data.atlasX,
        row: data.atlasY,
        name: data.name,
        description: data.description,
        price: data.price,
        color: data.color
    }));
}

function drawPokemon(ctx, atlasManager, pokemonId, config, x, y, width = 128, height = 128) {
    const coords = getPokemonAtlasCoords(pokemonId, config);
    if (!coords) {
        console.warn(`❌ Не удалось получить координаты для покемона ${pokemonId}`);
        drawFallbackPokemon(ctx, x, y, width, height, '?');
        return false;
    }
    
    const atlas = atlasManager.get('pokemon');
    if (!atlas) {
        console.error('❌ Атлас покемонов не найден');
        drawFallbackPokemon(ctx, x, y, width, height, 'P');
        return false;
    }
    
    if (!atlas.loaded) {
        console.warn('⚠️ Атлас покемонов еще не загружен');
        drawFallbackPokemon(ctx, x, y, width, height, '⏳');
        return false;
    }
    
    try {
        const result = atlas.drawGrid(ctx, coords.col, coords.row, x, y, width, height);
        if (!result) {
            drawFallbackPokemon(ctx, x, y, width, height, '⚠️');
        }
        return result;
    } catch (e) {
        console.error('❌ Ошибка при отрисовке покемона:', e);
        drawFallbackPokemon(ctx, x, y, width, height, '!');
        return false;
    }
}

function drawEnemy(ctx, atlasManager, enemyData, x, y, width = 128, height = 128) {
    if (!enemyData) {
        console.warn('❌ Нет данных о противнике');
        drawFallbackPokemon(ctx, x, y, width, height, 'E');
        return false;
    }
    
    const atlas = atlasManager.get('enemies');
    if (!atlas) {
        console.error('❌ Атлас противников не найден');
        drawFallbackPokemon(ctx, x, y, width, height, 'E');
        return false;
    }
    
    if (!atlas.loaded) {
        console.warn('⚠️ Атлас противников еще не загружен');
        drawFallbackPokemon(ctx, x, y, width, height, '⏳');
        return false;
    }
    
    try {
        const result = atlas.drawGrid(ctx, enemyData.col, enemyData.row, x, y, width, height);
        if (!result) {
            drawFallbackPokemon(ctx, x, y, width, height, '⚠️');
        }
        return result;
    } catch (e) {
        console.error('❌ Ошибка при отрисовке противника:', e);
        drawFallbackPokemon(ctx, x, y, width, height, '!');
        return false;
    }
}

// Функция для рисования заглушки покемона
function drawFallbackPokemon(ctx, x, y, width, height, text = '?') {
    // Рисуем фон
    ctx.fillStyle = '#ffcccc';
    ctx.fillRect(x, y, width, height);
    
    // Рисуем рамку
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Рисуем текст
    ctx.fillStyle = '#000000';
    ctx.font = `${Math.floor(width/2)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width/2, y + height/2);
}

function drawPokeball(ctx, atlasManager, pokeballType, config, x, y, width = 96, height = 96) {
    const pokeball = getPokeballSprite(pokeballType, config);
    if (!pokeball) {
        drawPokeballFallback(ctx, pokeballType, x, y, width, height);
        return false;
    }
    
    const atlas = atlasManager.get('pokeballs');
    if (!atlas || !atlas.loaded) {
        drawPokeballFallback(ctx, pokeballType, x, y, width, height);
        return false;
    }
    
    try {
        return atlas.drawGrid(ctx, pokeball.col, pokeball.row, x, y, width, height);
    } catch (e) {
        drawPokeballFallback(ctx, pokeballType, x, y, width, height);
        return false;
    }
}

function drawPokeballFallback(ctx, type, x, y, width, height) {
    const colors = {
        NORMAL: '#ff4444',
        MASTER: '#9c27b0',
        MYTHIC: '#ffd700'
    };
    
    const color = colors[type] || '#cccccc';
    
    // Рисуем круг
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/2 - 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Рисуем кнопку
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Рисуем букву
    ctx.fillStyle = '#000000';
    ctx.font = `${Math.floor(width/3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type[0], x + width/2, y + height/2);
}

function drawPokeball(ctx, atlasManager, pokeballType, config, x, y, width = 32, height = 32) {
    const pokeball = getPokeballSprite(pokeballType, config);
    if (!pokeball) return false;
    
    const atlas = atlasManager.get('pokeballs');
    if (!atlas) {
        console.error('Атлас покеболов не найден');
        return false;
    }
    
    return atlas.drawGrid(ctx, pokeball.col, pokeball.row, x, y, width, height);
}

// Функция для обновления изображений покеболов (без toDataURL)
async function updatePokeballImages(atlasManager, config) {
    if (!atlasManager) return;
    
    const pokeballsAtlas = atlasManager.get('pokeballs');
    if (!pokeballsAtlas) return;
    
    await pokeballsAtlas.waitForLoad();
    
    // Обновляем изображения в шапке, рисуя прямо на canvas
    const pokeballItems = document.querySelectorAll('.pokeball-item');
    
    pokeballItems.forEach(item => {
        const type = item.dataset.type;
        const img = item.querySelector('img');
        if (!img || !type) return;
        
        // Создаем canvas вместо img
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        canvas.className = 'pokeball-canvas';
        
        const ctx = canvas.getContext('2d');
        drawPokeball(ctx, atlasManager, type, config, 0, 0, 32, 32);
        
        // Заменяем img на canvas
        if (img.parentNode) {
            img.parentNode.replaceChild(canvas, img);
        }
    });
}

// Функция для проверки отрисовки
function testDrawPokemon(ctx, atlasManager, pokemonId, config, x, y) {
    console.log(`🎨 Попытка отрисовать покемона ID ${pokemonId}:`);
    
    const coords = getPokemonAtlasCoords(pokemonId, config);
    console.log('   Координаты в атласе:', coords);
    
    const atlas = atlasManager.get('pokemon');
    console.log('   Атлас покемонов:', atlas ? 'найден' : 'не найден');
    
    if (atlas) {
        console.log('   Статус атласа:', atlas.loaded ? 'загружен' : 'не загружен');
        console.log('   Размер атласа:', atlas.image.width, 'x', atlas.image.height);
        console.log('   Размер тайла:', atlas.tileWidth, 'x', atlas.tileHeight);
        console.log('   Колонок:', atlas.columns);
    }
    
    const result = drawPokemon(ctx, atlasManager, pokemonId, config, x, y, 128, 128);
    console.log('   Результат отрисовки:', result ? 'успешно' : 'неудачно');
}

// Функция для проверки всех атласов
function debugAtlases(atlasManager) {
    console.log('🔍 ОТЛАДКА АТЛАСОВ:');
    
    const atlasTypes = ['pokemon', 'enemies', 'pokeballs'];
    
    atlasTypes.forEach(type => {
        const atlas = atlasManager.get(type);
        if (atlas) {
            console.log(`📊 ${type}:`);
            console.log(`   - Загружен: ${atlas.loaded}`);
            console.log(`   - Путь: ${atlas.imagePath}`);
            console.log(`   - Размер: ${atlas.image.width}x${atlas.image.height}`);
            console.log(`   - Тайл: ${atlas.tileWidth}x${atlas.tileHeight}`);
            console.log(`   - Колонок: ${atlas.columns}`);
            console.log(`   - Изображение: ${atlas.image.complete ? 'готово' : 'не готово'}`);
        } else {
            console.log(`❌ ${type}: не найден`);
        }
    });
}


function initAtlases(config) {
    const atlasManager = new AtlasManager();
    
    if (config.ATLAS.POKEMON) {
        atlasManager.add(
            'pokemon',
            config.ATLAS.POKEMON.image,
            config.ATLAS.POKEMON.tileWidth,
            config.ATLAS.POKEMON.tileHeight,
            config.ATLAS.POKEMON.columns
        );
    }
    
    if (config.ATLAS.ENEMIES) {
        atlasManager.add(
            'enemies',
            config.ATLAS.ENEMIES.image,
            config.ATLAS.ENEMIES.tileWidth,
            config.ATLAS.ENEMIES.tileHeight,
            config.ATLAS.ENEMIES.columns
        );
    }
    
    if (config.ATLAS.POKEBALLS) {
        atlasManager.add(
            'pokeballs',
            config.ATLAS.POKEBALLS.image,
            config.ATLAS.POKEBALLS.tileWidth,
            config.ATLAS.POKEBALLS.tileHeight,
            config.ATLAS.POKEBALLS.columns
        );
    }
    
    return atlasManager;
}


// Добавьте в конец файла перед экспортом
function testDrawAll(ctx, atlasManager, config) {
    console.log('🧪 ТЕСТОВАЯ ОТРИСОВКА:');
    
    // Тест 1: Рисуем цветной квадрат
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 100, 100);
    console.log('✅ Тест 1: Красный квадрат нарисован');
    
    // Тест 2: Рисуем покемона через нашу функцию
    const result = drawPokemon(ctx, atlasManager, 1, config, 150, 0, 128, 128);
    console.log('✅ Тест 2: Отрисовка покемона:', result ? 'успешно' : 'неудачно');
    
    // Тест 3: Прямая отрисовка из атласа
    const atlas = atlasManager.get('pokemon');
    if (atlas && atlas.loaded) {
        try {
            ctx.drawImage(atlas.image, 0, 0, 128, 128, 300, 0, 128, 128);
            console.log('✅ Тест 3: Прямая отрисовка из атласа успешна');
        } catch (e) {
            console.error('❌ Тест 3: Ошибка прямой отрисовки:', e);
        }
    }
}

// Добавьте функцию для проверки размера canvas
function checkCanvasSize(canvas) {
    console.log(`📐 Canvas размер: ${canvas.width}x${canvas.height}`);
    console.log(`📐 Canvas CSS размер: ${canvas.style.width} x ${canvas.style.height}`);
    console.log(`📐 Canvas context размер: ${canvas.getContext('2d').canvas.width}x${canvas.getContext('2d').canvas.height}`);
}


window.GameUtils = {
    SpriteAtlas,
    AtlasManager,
    initAtlases,
    getPokemonAtlasCoords,
    getRandomEnemyAtlasCoords,
    getPokeballSprite,
    getAllPokeballs,
    drawPokemon,
    drawEnemy,
    drawPokeball,
    drawPokeballFallback,
    drawFallbackPokemon,
    updatePokeballImages,
    debugAtlases,
    testDrawPokemon
};

// Добавьте в экспорт
window.GameUtils.testDrawPokemon = testDrawPokemon;
window.GameUtils.debugAtlases = debugAtlases;
// Экспортируем новые функции
window.GameUtils.testDrawAll = testDrawAll;
window.GameUtils.checkCanvasSize = checkCanvasSize;