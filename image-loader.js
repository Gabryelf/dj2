// ==============================
// ЗАГРУЗЧИК ИЗОБРАЖЕНИЙ ПО URL
// ==============================

class ImageCache {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    async loadImage(url, id) {
        // Если уже загружено, возвращаем из кэша
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }

        // Если уже загружается, возвращаем существующий промис
        if (this.loadingPromises.has(id)) {
            return this.loadingPromises.get(id);
        }

        // Создаем новый промис для загрузки
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.cache.set(id, img);
                this.loadingPromises.delete(id);
                resolve(img);
            };
            
            img.onerror = () => {
                console.error(`❌ Ошибка загрузки изображения: ${url}`);
                // Создаем запасное изображение
                const fallbackImg = this.createFallbackImage(id);
                this.cache.set(id, fallbackImg);
                this.loadingPromises.delete(id);
                resolve(fallbackImg);
            };
            
            img.src = url;
        });

        this.loadingPromises.set(id, promise);
        return promise;
    }

    createFallbackImage(id) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Рисуем заглушку
        ctx.fillStyle = '#6C5CE7';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#A0A8C0';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 128, 128);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 64, 64);
        
        // Преобразуем canvas в изображение
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    getCached(id) {
        return this.cache.get(id) || null;
    }

    clear() {
        this.cache.clear();
        this.loadingPromises.clear();
    }
}

class ImageManager {
    constructor(imageConfig) {
        this.config = imageConfig;
        this.cache = new ImageCache();
        this.isReady = false;
    }

    async getPokemonImage(pokemonId) {
        const url = this.config.POKEMON_IMAGES[pokemonId];
        if (!url) {
            console.warn(`⚠️ Нет URL для покемона ${pokemonId}`);
            return this.cache.createFallbackImage(`pokemon_${pokemonId}`);
        }
        return this.cache.loadImage(url, `pokemon_${pokemonId}`);
    }

    async getEnemyImage(enemyKey) {
        const url = this.config.ENEMY_IMAGES[enemyKey];
        if (!url) {
            console.warn(`⚠️ Нет URL для противника ${enemyKey}`);
            return this.cache.createFallbackImage(`enemy_${enemyKey}`);
        }
        return this.cache.loadImage(url, `enemy_${enemyKey}`);
    }

    async getPokeballImage(pokeballType) {
        const url = this.config.POKEBALL_IMAGES[pokeballType];
        if (!url) {
            console.warn(`⚠️ Нет URL для покебола ${pokeballType}`);
            return this.cache.createFallbackImage(`pokeball_${pokeballType}`);
        }
        return this.cache.loadImage(url, `pokeball_${pokeballType}`);
    }

    async preloadAll() {
        const promises = [];
        
        // Загружаем всех покемонов
        for (const [id, url] of Object.entries(this.config.POKEMON_IMAGES)) {
            promises.push(this.cache.loadImage(url, `pokemon_${id}`).catch(() => {}));
        }
        
        // Загружаем противников
        for (const [key, url] of Object.entries(this.config.ENEMY_IMAGES)) {
            promises.push(this.cache.loadImage(url, `enemy_${key}`).catch(() => {}));
        }
        
        // Загружаем покеболы
        for (const [type, url] of Object.entries(this.config.POKEBALL_IMAGES)) {
            promises.push(this.cache.loadImage(url, `pokeball_${type}`).catch(() => {}));
        }
        
        await Promise.all(promises);
        this.isReady = true;
        console.log('✅ Все изображения предзагружены');
    }

    getCachedPokemonImage(pokemonId) {
        return this.cache.getCached(`pokemon_${pokemonId}`);
    }
}

// Функции для отрисовки
async function drawPokemon(ctx, imageManager, pokemonId, x, y, width = 128, height = 128) {
    try {
        const img = await imageManager.getPokemonImage(pokemonId);
        ctx.drawImage(img, x, y, width, height);
        return true;
    } catch (e) {
        console.error(`❌ Ошибка отрисовки покемона ${pokemonId}:`, e);
        drawFallback(ctx, x, y, width, height, '?');
        return false;
    }
}

async function drawEnemy(ctx, imageManager, enemyKey, x, y, width = 128, height = 128) {
    try {
        const img = await imageManager.getEnemyImage(enemyKey);
        ctx.drawImage(img, x, y, width, height);
        return true;
    } catch (e) {
        console.error(`❌ Ошибка отрисовки противника ${enemyKey}:`, e);
        drawFallback(ctx, x, y, width, height, 'E');
        return false;
    }
}

async function drawPokeball(ctx, imageManager, pokeballType, x, y, width = 96, height = 96) {
    try {
        const img = await imageManager.getPokeballImage(pokeballType);
        ctx.drawImage(img, x, y, width, height);
        return true;
    } catch (e) {
        console.error(`❌ Ошибка отрисовки покебола ${pokeballType}:`, e);
        drawPokeballFallback(ctx, pokeballType, x, y, width, height);
        return false;
    }
}

function drawFallback(ctx, x, y, width, height, text = '?') {
    ctx.fillStyle = '#ffcccc';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = '#000000';
    ctx.font = `${Math.floor(width/2)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width/2, y + height/2);
}

function drawPokeballFallback(ctx, type, x, y, width, height) {
    const colors = {
        NORMAL: '#ff4444',
        MASTER: '#9c27b0',
        MYTHIC: '#ffd700'
    };
    
    const color = colors[type] || '#cccccc';
    
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/2 - 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.font = `${Math.floor(width/3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type[0], x + width/2, y + height/2);
}

async function updatePokeballImages(imageManager) {
    const pokeballItems = document.querySelectorAll('.pokeball-item');
    
    for (const item of pokeballItems) {
        const type = item.dataset.type;
        const img = item.querySelector('img');
        if (!img || !type) continue;
        
        try {
            const pokeballImg = await imageManager.getPokeballImage(type);
            img.src = pokeballImg.src;
        } catch (e) {
            console.error(`❌ Ошибка обновления покебола ${type}:`, e);
        }
    }
}

// Экспортируем в глобальную область
window.ImageManager = ImageManager;
window.ImageCache = ImageCache;
window.drawPokemon = drawPokemon;
window.drawEnemy = drawEnemy;
window.drawPokeball = drawPokeball;
window.updatePokeballImages = updatePokeballImages;