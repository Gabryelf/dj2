// ==============================
// СИСТЕМА МАГАЗИНА И ПОКЕБОЛОВ
// ==============================

class ShopSystem {
    constructor(pokemonManager) {
        this.pokemonManager = pokemonManager;
        this.money = 0;
        this.pokeballs = { ...GAME_CONFIG.STARTING_POKEBALLS };
    }
    
    // Устанавливает текущее количество денег
    setMoney(amount) {
        this.money = amount;
        this.updateMoneyDisplay();
    }
    
    // Добавляет деньги
    addMoney(amount) {
        this.money += amount;
        this.updateMoneyDisplay();
        return this.money;
    }
    
    // Тратит деньги
    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.updateMoneyDisplay();
            return true;
        }
        return false;
    }
    
    // Обновляет отображение денег
    updateMoneyDisplay() {
        const moneyElement = document.getElementById('money');
        if (moneyElement) {
            moneyElement.textContent = this.money;
        }
    }
    
    // Обновляет отображение покеболов
    updatePokeballsDisplay() {
        const elements = {
            'normal': document.getElementById('normal-count'),
            'master': document.getElementById('master-count'),
            'mythic': document.getElementById('mythic-count')
        };
        
        for (const [type, element] of Object.entries(elements)) {
            if (element) {
                element.textContent = this.pokeballs[type.toUpperCase()];
            }
        }
    }
    
    // Покупает предмет в магазине
    buyItem(itemType) {
        const price = GAME_CONFIG.SHOP_PRICES[itemType];
        
        if (!price) {
            this.showNotification('Неизвестный предмет!', 'error');
            return false;
        }
        
        if (!this.spendMoney(price)) {
            this.showNotification('Недостаточно поке-баксов!', 'error');
            return false;
        }
        
        // Обрабатываем покупку
        switch(itemType) {
            case 'NORMAL_BALL':
                this.pokeballs.NORMAL++;
                this.showNotification('Куплен обычный покебол!', 'info');
                break;
                
            case 'MASTER_BALL':
                this.pokeballs.MASTER++;
                this.showNotification('Куплен мастербол!', 'info');
                break;
                
            case 'MYTHIC_BALL':
                this.pokeballs.MYTHIC++;
                this.showNotification('Куплен мификбол!', 'info');
                break;
                
            case 'ENERGY_RESTORE':
                // Восстанавливает энергию всем покемонам в коллекции
                for (const pokemon of this.pokemonManager.collection) {
                    this.pokemonManager.restorePokemonEnergy(pokemon.id);
                }
                this.showNotification('Энергия всех покемонов восстановлена!', 'info');
                break;
                
            case 'TEAM_EXPANDER':
                this.pokemonManager.maxTeamSize++;
                this.showNotification(`Размер команды увеличен до ${this.pokemonManager.maxTeamSize}!`, 'info');
                break;
        }
        
        this.updatePokeballsDisplay();
        return true;
    }
    
    // Открывает покебол
    openPokeball(ballType) {
        if (this.pokeballs[ballType] <= 0) {
            this.showNotification('Нет покеболов этого типа!', 'error');
            return null;
        }
        
        // Используем покебол
        this.pokeballs[ballType]--;
        this.updatePokeballsDisplay();
        
        // Получаем шансы для этого типа покебола
        const rates = GAME_CONFIG.POKEBALL_RATES[ballType];
        
        // Генерируем случайное число от 0 до 100
        const roll = Math.random() * 100;
        let cumulative = 0;
        let selectedRarity = null;
        
        // Определяем редкость покемона
        for (const [rarity, chance] of Object.entries(rates)) {
            cumulative += chance;
            if (roll <= cumulative) {
                selectedRarity = rarity;
                break;
            }
        }
        
        // Если по какой-то причине редкость не выбрана, используем обычную
        if (!selectedRarity) {
            selectedRarity = 'COMMON';
        }
        
        // Получаем всех покемонов этой редкости
        const pokemonOfRarity = [];
        for (const [id, template] of Object.entries(GAME_CONFIG.POKEMON_IMAGES)) {
            if (template.rarity === selectedRarity) {
                pokemonOfRarity.push(parseInt(id));
            }
        }
        
        // Выбираем случайного покемона
        if (pokemonOfRarity.length === 0) {
            // Если нет покемонов этой редкости, выбираем любого
            const allIds = Object.keys(GAME_CONFIG.POKEMON_IMAGES).map(id => parseInt(id));
            const randomId = allIds[Math.floor(Math.random() * allIds.length)];
            return this.grantPokemon(randomId, selectedRarity);
        }
        
        const randomId = pokemonOfRarity[Math.floor(Math.random() * pokemonOfRarity.length)];
        return this.grantPokemon(randomId, selectedRarity);
    }
    
    // Выдает покемона игроку
    grantPokemon(pokemonId, rarity) {
        const pokemon = this.pokemonManager.addToCollection(pokemonId);
        
        if (pokemon) {
            const rarityName = GAME_CONFIG.RARITIES[rarity].name;
            this.showNotification(`Вы получили ${pokemon.name} (${rarityName})!`, 'info');
            
            // Проигрываем звук
            if (typeof GameSoundGenerator !== 'undefined') {
                GameSoundGenerator.playPokemonSound(pokemon.types[0].toLowerCase());
            }
            
            return pokemon;
        }
        
        return null;
    }
    
    // Создает UI магазина
    createShopUI() {
        const shopItems = document.getElementById('shop-items');
        if (!shopItems) return;
        
        shopItems.innerHTML = '';
        
        const items = [
            {
                type: 'NORMAL_BALL',
                name: 'Обычный покебол',
                price: GAME_CONFIG.SHOP_PRICES.NORMAL_BALL,
                description: 'Шанс получить обычного покемона'
            },
            {
                type: 'MASTER_BALL',
                name: 'Мастербол',
                price: GAME_CONFIG.SHOP_PRICES.MASTER_BALL,
                description: 'Высокий шанс получить редкого покемона'
            },
            {
                type: 'MYTHIC_BALL',
                name: 'Мификбол',
                price: GAME_CONFIG.SHOP_PRICES.MYTHIC_BALL,
                description: 'Шанс получить легендарного покемона'
            },
            {
                type: 'ENERGY_RESTORE',
                name: 'Энергетик',
                price: GAME_CONFIG.SHOP_PRICES.ENERGY_RESTORE,
                description: 'Восстанавливает энергию всем покемонам'
            },
            {
                type: 'TEAM_EXPANDER',
                name: 'Расширитель команды',
                price: GAME_CONFIG.SHOP_PRICES.TEAM_EXPANDER,
                description: 'Увеличивает размер команды на 1'
            }
        ];
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            itemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="price">Цена: <strong>${item.price}</strong> <i class="fas fa-coins"></i></p>
                <button class="buy-btn" data-type="${item.type}">
                    Купить
                </button>
            `;
            
            shopItems.appendChild(itemElement);
        });
        
        // Добавляем обработчики событий
        shopItems.querySelectorAll('.buy-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemType = e.target.dataset.type;
                this.buyItem(itemType);
            });
        });
    }
    
    // Создает UI открытия покеболов
    createPokeballUI() {
        const pokeballOptions = document.getElementById('pokeball-options');
        if (!pokeballOptions) return;
        
        pokeballOptions.innerHTML = '';
        
        const balls = [
            {
                type: 'NORMAL',
                name: 'Обычный покебол',
                image: './images/pokeball.png',
                description: 'Шансы: обычный (60%), повсеместный (25%), редкий (10%), эпический (4%), специальный (0.9%), легендарный (0.1%)',
                count: this.pokeballs.NORMAL
            },
            {
                type: 'MASTER',
                name: 'Мастербол',
                image: './images/masterball.png',
                description: 'Шансы: обычный (20%), повсеместный (25%), редкий (30%), эпический (15%), специальный (9%), легендарный (1%)',
                count: this.pokeballs.MASTER
            },
            {
                type: 'MYTHIC',
                name: 'Мификбол',
                image: './images/ultraball.png',
                description: 'Шансы: обычный (10%), повсеместный (15%), редкий (25%), эпический (25%), специальный (19%), легендарный (6%)',
                count: this.pokeballs.MYTHIC
            }
        ];
        
        balls.forEach(ball => {
            const ballElement = document.createElement('div');
            ballElement.className = 'pokeball-option';
            ballElement.innerHTML = `
                <img src="${ball.image}" alt="${ball.name}">
                <h3>${ball.name}</h3>
                <p>Осталось: <strong>${ball.count}</strong></p>
                <p class="description">${ball.description}</p>
                <button class="open-btn" data-type="${ball.type}" 
                        ${ball.count <= 0 ? 'disabled' : ''}>
                    Открыть
                </button>
            `;
            
            pokeballOptions.appendChild(ballElement);
        });
        
        // Добавляем обработчики событий
        pokeballOptions.querySelectorAll('.open-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const ballType = e.target.dataset.type;
                const pokemon = this.openPokeball(ballType);
                
                if (pokemon) {
                    // Обновляем UI
                    this.updatePokeballsDisplay();
                    
                    // Закрываем модальное окно через 2 секунды
                    setTimeout(() => {
                        const modal = document.getElementById('pokeball-modal');
                        if (modal) modal.style.display = 'none';
                    }, 2000);
                }
            });
        });
    }
    
    // Уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Экспорт системы магазина
window.ShopSystem = ShopSystem;