// ==============================
// СИСТЕМА МАГАЗИНА
// ==============================

class ShopSystem {
    constructor(pokemonManager, atlasManager, game) {
        this.pokemonManager = pokemonManager;
        this.atlasManager = atlasManager;
        this.game = game; // Добавляем ссылку на игру для уведомлений
        this.money = GAME_CONFIG.STARTING_MONEY;
        this.pokeballs = { ...GAME_CONFIG.STARTING_POKEBALLS };
    }
    
    addMoney(amount) {
        this.money += amount;
        this.updateMoneyDisplay();
        return this.money;
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
    
    async createPokeballUI() {
        const container = document.getElementById('pokeball-options');
        if (!container) return;
        
        const pokeballs = GameUtils.getAllPokeballs(GAME_CONFIG);
        container.innerHTML = '';
        
        for (const pokeball of pokeballs) {
            const count = this.pokeballs[pokeball.type];
            
            const option = document.createElement('div');
            option.className = 'pokeball-option';
            option.dataset.type = pokeball.type;
            
            // Создаем canvas для покебола
            const canvas = document.createElement('canvas');
            canvas.width = 80;
            canvas.height = 80;
            canvas.className = 'pokeball-canvas';
            
            const ctx = canvas.getContext('2d');
            GameUtils.drawPokeball(
                ctx,
                this.atlasManager,
                pokeball.type,
                GAME_CONFIG,
                0, 0,
                80, 80
            );
            
            const price = GAME_CONFIG.SHOP_PRICES[pokeball.type + '_BALL'];
            
            option.innerHTML = `
                ${canvas.outerHTML}
                <div class="pokeball-info">
                    <h3 style="color: ${pokeball.color}">${pokeball.name}</h3>
                    <p>${pokeball.description}</p>
                    <div class="pokeball-stats">
                        <span><strong>В наличии:</strong> ${count}</span>
                        <span><strong>Цена:</strong> ${price} монет</span>
                    </div>
                </div>
                <button class="open-btn" ${count === 0 ? 'disabled' : ''}>
                    Открыть (${count})
                </button>
            `;
            
            const openBtn = option.querySelector('.open-btn');
            openBtn.addEventListener('click', () => this.openPokeball(pokeball.type));
            
            container.appendChild(option);
        }
    }
    
    createShopUI() {
        const container = document.getElementById('shop-items');
        if (!container) return;
        
        container.innerHTML = '';
        
        const items = [
            {
                type: 'NORMAL_BALL',
                name: 'Покебол',
                description: 'Обычный покебол. Шанс получить обычного или необычного покемона.',
                price: GAME_CONFIG.SHOP_PRICES.NORMAL_BALL
            },
            {
                type: 'MASTER_BALL',
                name: 'Мастербол',
                description: 'Редкий покебол. Высокий шанс получить редких и эпических покемонов.',
                price: GAME_CONFIG.SHOP_PRICES.MASTER_BALL
            },
            {
                type: 'MYTHIC_BALL',
                name: 'Мификбол',
                description: 'Легендарный покебол. Максимальный шанс получить легендарных покемонов.',
                price: GAME_CONFIG.SHOP_PRICES.MYTHIC_BALL
            },
            {
                type: 'ENERGY_RESTORE',
                name: 'Восстановление энергии',
                description: 'Полностью восстанавливает энергию одному покемону.',
                price: GAME_CONFIG.SHOP_PRICES.ENERGY_RESTORE
            },
            {
                type: 'TEAM_EXPANDER',
                name: 'Расширитель команды',
                description: 'Увеличивает максимальный размер команды на 1.',
                price: GAME_CONFIG.SHOP_PRICES.TEAM_EXPANDER
            }
        ];
        
        items.forEach(item => {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            
            shopItem.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="price">
                    <i class="fas fa-coins"></i>
                    <span>${item.price}</span>
                </div>
                <button class="buy-btn" data-type="${item.type}">
                    Купить
                </button>
            `;
            
            const buyBtn = shopItem.querySelector('.buy-btn');
            buyBtn.addEventListener('click', () => this.buyItem(item.type, item.price));
            
            container.appendChild(shopItem);
        });
    }
    
    buyItem(itemType, price) {
        if (this.spendMoney(price)) {
            // Воспроизводим звук покупки
            if (window.GameSoundGenerator && window.GameSoundGenerator.playCoin) {
                window.GameSoundGenerator.playCoin();
            }
            
            switch(itemType) {
                case 'NORMAL_BALL':
                    this.pokeballs.NORMAL++;
                    break;
                case 'MASTER_BALL':
                    this.pokeballs.MASTER++;
                    break;
                case 'MYTHIC_BALL':
                    this.pokeballs.MYTHIC++;
                    break;
                case 'ENERGY_RESTORE':
                    this.showPokemonSelectionForEnergy();
                    return; // Не показываем уведомление здесь, оно покажется в методе восстановления
                case 'TEAM_EXPANDER':
                    this.pokemonManager.maxTeamSize++;
                    break;
            }
            
            this.updatePokeballsDisplay();
            if (this.game && this.game.showNotification) {
                this.game.showNotification('Покупка успешна!', 'success');
            }
        } else {
            if (this.game && this.game.showNotification) {
                this.game.showNotification('Недостаточно средств!', 'error');
            }
        }
    }
    
    openPokeball(pokeballType) {
        if (this.pokeballs[pokeballType] <= 0) {
            if (this.game && this.game.showNotification) {
                this.game.showNotification('У вас нет таких покеболов!', 'warning');
            }
            return;
        }
        
        this.pokeballs[pokeballType]--;
        this.updatePokeballsDisplay();
        
        // Воспроизводим звук открытия
        if (window.GameSoundGenerator && window.GameSoundGenerator.playPokeballOpen) {
            window.GameSoundGenerator.playPokeballOpen();
        }
        
        const randomPokemonId = this.getRandomPokemonByPokeball(pokeballType);
        const newPokemon = this.pokemonManager.addToCollection(randomPokemonId);
        
        if (newPokemon) {
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`Вы получили ${newPokemon.name}!`, 'success');
            }
            
            // Воспроизводим звук покемона
            if (window.GameSoundGenerator && window.GameSoundGenerator.playPokemonCry) {
                window.GameSoundGenerator.playPokemonCry();
            }
            
            // Обновляем UI коллекции
            const collectionModal = document.getElementById('collection-modal');
            if (collectionModal && collectionModal.style.display === 'block') {
                if (this.game && this.game.uiManager) {
                    this.game.uiManager.createCollectionUI();
                }
            }
        }
    }
    
    getRandomPokemonByPokeball(pokeballType) {
        const rates = GAME_CONFIG.POKEBALL_RATES[pokeballType];
        const pokemonList = Object.entries(GAME_CONFIG.POKEMON_SPRITES);
        
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (const [rarity, chance] of Object.entries(rates)) {
            cumulative += chance;
            if (random <= cumulative) {
                const filteredPokemon = pokemonList.filter(([id, data]) => data.rarity === rarity);
                if (filteredPokemon.length > 0) {
                    const randomIndex = Math.floor(Math.random() * filteredPokemon.length);
                    return parseInt(filteredPokemon[randomIndex][0]);
                }
            }
        }
        
        // Если ничего не выпало, возвращаем первого покемона
        return 1;
    }
    
    showPokemonSelectionForEnergy() {
        const availablePokemon = this.pokemonManager.collection.filter(p => p.energy < p.maxEnergy);
        
        if (availablePokemon.length === 0) {
            if (this.game && this.game.showNotification) {
                this.game.showNotification('Нет покемонов, нуждающихся в восстановлении!', 'info');
            }
            return;
        }
        
        // Создаем временное модальное окно для выбора покемона
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Выберите покемона для восстановления</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="available-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
                        ${availablePokemon.map(p => `
                            <div class="pokemon-card selectable" data-id="${p.id}">
                                <canvas id="pokemon-canvas-${p.id}" width="100" height="100"></canvas>
                                <h4>${p.name}</h4>
                                <div class="pokemon-stats">
                                    <div>Энергия: ${Math.round((p.energy / p.maxEnergy) * 100)}%</div>
                                </div>
                                <button class="restore-btn">Восстановить</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Рисуем покемонов
        availablePokemon.forEach(p => {
            const canvas = document.getElementById(`pokemon-canvas-${p.id}`);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                GameUtils.drawPokemon(
                    ctx,
                    this.atlasManager,
                    p.id,
                    GAME_CONFIG,
                    0, 0,
                    100, 100
                );
            }
        });
        
        // Обработчики
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        const restoreBtns = modal.querySelectorAll('.restore-btn');
        restoreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.pokemon-card');
                const pokemonId = parseInt(card.dataset.id);
                const pokemon = this.pokemonManager.getPokemonById(pokemonId);
                
                if (pokemon) {
                    pokemon.energy = pokemon.maxEnergy;
                    
                    // Воспроизводим звук восстановления
                    if (window.GameSoundGenerator && window.GameSoundGenerator.playEnergyRestore) {
                        window.GameSoundGenerator.playEnergyRestore();
                    }
                    
                    if (this.game && this.game.showNotification) {
                        this.game.showNotification(`Энергия ${pokemon.name} восстановлена!`, 'success');
                    }
                    
                    modal.remove();
                }
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

window.ShopSystem = ShopSystem;