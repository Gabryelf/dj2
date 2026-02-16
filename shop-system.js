// ==============================
// СИСТЕМА МАГАЗИНА (ОБНОВЛЕННАЯ)
// ==============================

class ShopSystem {
    constructor(pokemonManager, game, imageManager) {
        this.pokemonManager = pokemonManager;
        this.game = game;
        this.imageManager = imageManager;
        this.money = GAME_CONFIG.STARTING_MONEY;
        this.pokeballs = { ...GAME_CONFIG.STARTING_POKEBALLS };
    }
    
    addMoney(amount) {
        this.money += amount;
        this.updateMoneyDisplay();
    }
    
    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.updateMoneyDisplay();
            return true;
        }
        return false;
    }
    
    setMoney(amount) {
        this.money = amount;
        this.updateMoneyDisplay();
    }
    
    updateMoneyDisplay() {
        const moneyElement = document.getElementById('money');
        if (moneyElement) {
            moneyElement.textContent = this.money;
        }
    }
    
    updatePokeballsDisplay() {
        const normalCount = document.getElementById('normal-count');
        const masterCount = document.getElementById('master-count');
        const mythicCount = document.getElementById('mythic-count');
        
        if (normalCount) normalCount.textContent = this.pokeballs.NORMAL;
        if (masterCount) masterCount.textContent = this.pokeballs.MASTER;
        if (mythicCount) mythicCount.textContent = this.pokeballs.MYTHIC;
    }
    
    buyPokeball(type) {
        let price;
        let ballType;
        
        switch(type) {
            case 'NORMAL':
                price = GAME_CONFIG.SHOP_PRICES.NORMAL_BALL;
                ballType = 'NORMAL';
                break;
            case 'MASTER':
                price = GAME_CONFIG.SHOP_PRICES.MASTER_BALL;
                ballType = 'MASTER';
                break;
            case 'MYTHIC':
                price = GAME_CONFIG.SHOP_PRICES.MYTHIC_BALL;
                ballType = 'MYTHIC';
                break;
            default:
                return { success: false, message: 'Неизвестный тип покебола' };
        }
        
        if (this.spendMoney(price)) {
            this.pokeballs[ballType]++;
            this.updatePokeballsDisplay();
            this.game.saveGame();
            return { success: true, message: `Куплен ${GAME_CONFIG.POKEBALL_DATA[ballType].name}` };
        } else {
            return { success: false, message: 'Недостаточно поке-баксов' };
        }
    }
    
    openPokeball(type) {
        if (this.pokeballs[type] <= 0) {
            this.game.showNotification('У вас нет таких покеболов!', 'error');
            return null;
        }
        
        this.pokeballs[type]--;
        this.updatePokeballsDisplay();
        
        const rates = GAME_CONFIG.POKEBALL_RATES[type];
        const random = Math.random() * 100;
        
        let cumulative = 0;
        let selectedRarity = 'COMMON';
        
        for (const [rarity, chance] of Object.entries(rates)) {
            cumulative += chance;
            if (random <= cumulative) {
                selectedRarity = rarity;
                break;
            }
        }
        
        const availablePokemon = Object.entries(GAME_CONFIG.POKEMON_DATA)
            .filter(([id, data]) => data.rarity === selectedRarity);
        
        if (availablePokemon.length === 0) {
            this.game.showNotification('Ошибка: нет покемонов этой редкости', 'error');
            return null;
        }
        
        const [pokemonId, pokemonData] = availablePokemon[
            Math.floor(Math.random() * availablePokemon.length)
        ];
        
        const newPokemon = this.pokemonManager.addToCollection(parseInt(pokemonId));
        
        if (newPokemon) {
            this.game.showNotification(`Вы получили ${newPokemon.name}!`, 'success');
            this.game.saveGame();
        }
        
        return newPokemon;
    }
    
    async createPokeballUI() {
        const optionsContainer = document.getElementById('pokeball-options');
        if (!optionsContainer) return;
        
        optionsContainer.innerHTML = '';
        
        for (const [type, data] of Object.entries(GAME_CONFIG.POKEBALL_DATA)) {
            const count = this.pokeballs[type] || 0;
            
            const option = document.createElement('div');
            option.className = 'pokeball-option';
            option.dataset.type = type;
            
            const img = document.createElement('img');
            img.className = 'pokeball-option-image';
            img.alt = data.name;
            img.width = 96;
            img.height = 96;
            
            try {
                const pokeballImg = await this.imageManager.getPokeballImage(type);
                img.src = pokeballImg.src;
            } catch (e) {
                console.error(`❌ Ошибка загрузки изображения покебола ${type}:`, e);
            }
            
            option.innerHTML = `
                ${img.outerHTML}
                <div class="pokeball-option-info">
                    <h3>${data.name}</h3>
                    <p>${data.description}</p>
                    <div class="pokeball-stats">
                        <span><i class="fas fa-coins"></i> ${data.price}</span>
                        <span><i class="fas fa-box"></i> ${count} шт.</span>
                    </div>
                </div>
                <button class="open-pokeball-btn" ${count === 0 ? 'disabled' : ''}>
                    Открыть
                </button>
            `;
            
            const btn = option.querySelector('.open-pokeball-btn');
            btn.addEventListener('click', () => {
                this.openPokeball(type);
                this.createPokeballUI(); // Обновляем UI
            });
            
            optionsContainer.appendChild(option);
        }
    }
    
    async createShopUI() {
        const shopItems = document.getElementById('shop-items');
        if (!shopItems) return;
        
        shopItems.innerHTML = '';
        
        const items = [
            { type: 'NORMAL', name: 'Покебол', price: GAME_CONFIG.SHOP_PRICES.NORMAL_BALL },
            { type: 'MASTER', name: 'Мастербол', price: GAME_CONFIG.SHOP_PRICES.MASTER_BALL },
            { type: 'MYTHIC', name: 'Мификбол', price: GAME_CONFIG.SHOP_PRICES.MYTHIC_BALL }
        ];
        
        for (const item of items) {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            
            const img = document.createElement('img');
            img.className = 'shop-item-image';
            img.alt = item.name;
            img.width = 64;
            img.height = 64;
            
            try {
                const pokeballImg = await this.imageManager.getPokeballImage(item.type);
                img.src = pokeballImg.src;
            } catch (e) {
                console.error(`❌ Ошибка загрузки изображения ${item.name}:`, e);
            }
            
            itemElement.innerHTML = `
                ${img.outerHTML}
                <div class="shop-item-info">
                    <h4>${item.name}</h4>
                    <span class="price"><i class="fas fa-coins"></i> ${item.price}</span>
                </div>
                <button class="buy-btn" data-type="${item.type}">Купить</button>
            `;
            
            const buyBtn = itemElement.querySelector('.buy-btn');
            buyBtn.addEventListener('click', () => {
                const result = this.buyPokeball(item.type);
                this.game.showNotification(result.message, result.success ? 'success' : 'error');
            });
            
            shopItems.appendChild(itemElement);
        }
    }
}

window.ShopSystem = ShopSystem;