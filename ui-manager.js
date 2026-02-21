// ==============================
// МЕНЕДЖЕР ИНТЕРФЕЙСА С ПОДДЕРЖКОЙ СЛИЯНИЯ
// ==============================

class UIManager {
    constructor(game, imageManager) {
        this.game = game;
        this.imageManager = imageManager;
        this.modals = {};
        this.activeTab = 'collection';
        this.isProcessingPokeball = false; // Флаг для предотвращения двойных кликов
        this.initModals();
        this.createMergeModal();
        this.setupPokeballClickHandlers();
    }
    
    initModals() {
        const modals = ['collection', 'shop', 'team'];
        
        modals.forEach(modalName => {
            const modal = document.getElementById(`${modalName}-modal`);
            if (modal) {
                this.modals[modalName] = modal;
                
                const closeBtn = modal.querySelector('.close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }
                
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
                
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }
            }
        });
    }
    
    setupPokeballClickHandlers() {
        const pokeballItems = document.querySelectorAll('.pokeball-item');
        pokeballItems.forEach(item => {
            // Удаляем старые обработчики
            item.removeEventListener('click', this.pokeballClickHandler);
            // Создаем новый обработчик с привязкой к контексту
            this.pokeballClickHandler = (e) => {
                e.stopPropagation();
                const type = item.dataset.type;
                this.handlePokeballClick(type);
            };
            // Добавляем новый обработчик
            item.addEventListener('click', this.pokeballClickHandler);
        });
    }
    
    handlePokeballClick(type) {
        // Предотвращаем множественные клики
        if (this.isProcessingPokeball) {
            console.log('⏳ Уже обрабатывается открытие покебола');
            return;
        }
        
        const count = this.game.shopSystem.pokeballs[type];
        
        if (count > 0) {
            this.isProcessingPokeball = true;
            this.openPokeballWithAnimation(type);
        } else {
            this.showModal('shop');
            this.game.showNotification('Купите покеболы в магазине!', 'warning');
        }
    }
    
    async openPokeballWithAnimation(type) {
        try {
            // Создаем черный оверлей
            const overlay = document.createElement('div');
            overlay.className = 'pokeball-open-overlay';
            document.body.appendChild(overlay);
            
            // Создаем анимацию покебола
            const animContainer = document.createElement('div');
            animContainer.className = 'pokeball-open-animation';
            
            const pokeballImg = await this.imageManager.getPokeballImage(type);
            const img = document.createElement('img');
            img.src = pokeballImg.src;
            animContainer.appendChild(img);
            overlay.appendChild(animContainer);
            
            // Ждем анимацию открытия
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Удаляем анимацию покебола
            overlay.remove();
            
            // Открываем покебол и получаем покемона
            const pokemon = this.game.shopSystem.openPokeball(type);
            
            if (pokemon) {
                // Показываем полученного покемона на черном фоне
                await this.showRevealedPokemon(pokemon);
                
                // Обновляем UI
                await this.updateUI();
                this.game.saveGame();
                
                // Воспроизводим звук
                if (typeof GameSoundGenerator !== 'undefined') {
                    GameSoundGenerator.playPokemonCry();
                }
            }
            
            // Сбрасываем флаг
            this.isProcessingPokeball = false;
            
        } catch (e) {
            console.error('Ошибка анимации покебола:', e);
            this.isProcessingPokeball = false;
        }
    }
    
    async showRevealedPokemon(pokemon) {
        return new Promise(async (resolve) => {
            // Создаем черный оверлей для показа покемона
            const overlay = document.createElement('div');
            overlay.className = 'pokemon-reveal-overlay';
            
            const revealContainer = document.createElement('div');
            revealContainer.className = 'pokemon-reveal-animation';
            
            try {
                const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
                const img = document.createElement('img');
                img.src = pokemonImg.src;
                revealContainer.appendChild(img);
                
                // Добавляем имя покемона
                const nameDiv = document.createElement('div');
                nameDiv.className = 'pokemon-name-reveal';
                nameDiv.textContent = pokemon.name;
                revealContainer.appendChild(nameDiv);
                
                overlay.appendChild(revealContainer);
                document.body.appendChild(overlay);
                
                // Показываем уведомление
                this.game.showNotification(`Вы получили ${pokemon.name}!`, 'success');
                
                // Удаляем через 2 секунды
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 2000);
                
            } catch (e) {
                console.error('Ошибка показа покемона:', e);
                overlay.remove();
                resolve();
            }
        });
    }
    
    createMergeModal() {
        if (document.getElementById('merge-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'merge-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content merge-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-merge"></i> Слияние покемонов!</h2>
                    <span class="close-merge">&times;</span>
                </div>
                <div class="modal-body merge-body">
                    <div class="merge-animation">
                        <div class="merge-pokemon original"></div>
                        <div class="merge-plus">+</div>
                        <div class="merge-pokemon duplicate"></div>
                        <div class="merge-equals">=</div>
                        <div class="merge-pokemon result"></div>
                    </div>
                    <div class="merge-details">
                        <h3 class="merge-name"></h3>
                        <div class="merge-stats">
                            <div class="stat">
                                <span>Уровень</span>
                                <span class="level-change"></span>
                            </div>
                            <div class="stat">
                                <span>Урон</span>
                                <span class="damage-change"></span>
                            </div>
                            <div class="stat">
                                <span>Слияний</span>
                                <span class="merge-count"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.close-merge');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    showMergeAnimation(mergeData) {
        const modal = document.getElementById('merge-modal');
        if (!modal) return;
        
        const pokemon = mergeData.pokemon;
        
        const nameEl = modal.querySelector('.merge-name');
        nameEl.textContent = `${pokemon.name} #${pokemon.level}`;
        
        const levelChange = modal.querySelector('.level-change');
        levelChange.innerHTML = `${mergeData.oldLevel} → <span class="increase">${mergeData.newLevel}</span>`;
        
        const damageChange = modal.querySelector('.damage-change');
        damageChange.innerHTML = `${Math.floor(mergeData.oldDamage)} → <span class="increase">${Math.floor(mergeData.newDamage)}</span>`;
        
        const mergeCount = modal.querySelector('.merge-count');
        mergeCount.textContent = mergeData.mergeCount;
        
        this.loadPokemonImage(modal.querySelector('.original'), pokemon.id);
        this.loadPokemonImage(modal.querySelector('.duplicate'), pokemon.id);
        this.loadPokemonImage(modal.querySelector('.result'), pokemon.id);
        
        modal.style.display = 'flex';
        
        const elements = modal.querySelectorAll('.merge-pokemon, .merge-plus, .merge-equals');
        elements.forEach((el, i) => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = `mergeAppear 0.5s ease forwards ${i * 0.1}s`;
        });
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);
    }
    
    async loadPokemonImage(container, pokemonId) {
        try {
            const img = await this.imageManager.getPokemonImage(pokemonId);
            container.innerHTML = '';
            container.appendChild(img.cloneNode());
        } catch (e) {
            console.error('Ошибка загрузки изображения:', e);
        }
    }
    
    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'flex';
            this.setActiveTab(modalName);
            
            switch(modalName) {
                case 'collection':
                    this.createCollectionUI();
                    break;
                case 'shop':
                    this.game.shopSystem.createShopUI();
                    break;
                case 'team':
                    this.createTeamSelectionUI();
                    break;
            }
        }
    }
    
    setActiveTab(tabName) {
        this.activeTab = tabName;
        const tabs = ['collection', 'shop', 'team'];
        tabs.forEach(tab => {
            const btn = document.getElementById(`${tab}-menu`);
            if (btn) {
                if (tab === tabName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    }
    
    async createCollectionUI() {
        const collectionGrid = document.getElementById('collection-grid');
        if (!collectionGrid) return;
        
        collectionGrid.innerHTML = '';
        
        const collection = this.game.pokemonManager.collection;
        
        if (collection.length === 0) {
            collectionGrid.innerHTML = '<div class="empty-collection"><i class="fas fa-box-open"></i><p>Коллекция пуста! Откройте покеболы, кликнув на них в шапке.</p></div>';
            return;
        }
        
        collection.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
        
        for (const pokemon of collection) {
            const card = await this.createPokemonCard(pokemon);
            collectionGrid.appendChild(card);
        }
    }
    
    async createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.dataset.id = pokemon.id;
        
        const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        const img = document.createElement('img');
        img.className = 'pokemon-image';
        img.alt = pokemon.name;
        img.width = 100;
        img.height = 100;
        
        try {
            const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            console.error(`❌ Ошибка загрузки изображения для ${pokemon.name}:`, e);
        }
        
        card.innerHTML = `
            ${img.outerHTML}
            <h4>${pokemon.name}</h4>
            <div class="pokemon-rarity" style="color: ${rarity.color}; border-color: ${rarity.color}">
                ${rarity.name}
            </div>
            <div class="pokemon-stats">
                <div>Уровень: ${pokemon.level}</div>
                <div>Урон: ${Math.floor(pokemon.currentDamage)}</div>
                <div>Энергия: ${Math.floor(energyPercent)}%</div>
                <div>Слияний: ${pokemon.mergeCount || 0}</div>
            </div>
            ${pokemon.isInTeam ? '<div class="in-team">В команде</div>' : ''}
        `;
        
        return card;
    }
    
    async createTeamSelectionUI() {
        const teamSelection = document.getElementById('team-selection');
        if (!teamSelection) return;
        
        teamSelection.innerHTML = '';
        
        const collection = this.game.pokemonManager.collection;
        const team = this.game.pokemonManager.team;
        
        if (collection.length === 0) {
            teamSelection.innerHTML = '<p style="text-align: center;">Коллекция пуста!</p>';
            return;
        }
        
        // Текущая команда
        const teamSection = document.createElement('div');
        teamSection.className = 'current-team';
        teamSection.innerHTML = '<h3><i class="fas fa-users"></i> Текущая команда</h3>';
        
        const teamSlots = document.createElement('div');
        teamSlots.className = 'team-slots selection-slots';
        
        for (const pokemon of team) {
            const slot = await this.createTeamSlot(pokemon, true);
            teamSlots.appendChild(slot);
        }
        
        for (let i = team.length; i < this.game.pokemonManager.maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i><span>Пусто</span>';
            teamSlots.appendChild(emptySlot);
        }
        
        teamSection.appendChild(teamSlots);
        teamSelection.appendChild(teamSection);
        
        // Показываем общий урон команды
        const totalDamage = this.game.pokemonManager.getTeamDamage();
        const damageDiv = document.createElement('div');
        damageDiv.className = 'team-damage';
        damageDiv.innerHTML = `
            <span><i class="fas fa-crosshairs"></i> Общий урон команды:</span>
            <span id="team-total-damage">${Math.floor(totalDamage)}</span>
        `;
        teamSelection.appendChild(damageDiv);
        
        // Доступные покемоны
        const availableSection = document.createElement('div');
        availableSection.className = 'available-pokemon';
        availableSection.innerHTML = '<h3><i class="fas fa-dragon"></i> Доступные покемоны</h3>';
        
        const availableGrid = document.createElement('div');
        availableGrid.className = 'available-grid';
        
        const availablePokemon = collection.filter(p => !p.isInTeam && p.energy > 0);
        
        if (availablePokemon.length === 0) {
            availableGrid.innerHTML = '<p class="no-pokemon">Нет доступных покемонов</p>';
        } else {
            for (const pokemon of availablePokemon) {
                const pokemonCard = await this.createSelectablePokemonCard(pokemon);
                availableGrid.appendChild(pokemonCard);
            }
        }
        
        availableSection.appendChild(availableGrid);
        teamSelection.appendChild(availableSection);
        
        this.addTeamSelectionHandlers();
    }
    
    async createSelectablePokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card selectable';
        card.dataset.id = pokemon.id;
        
        const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        const img = document.createElement('img');
        img.className = 'pokemon-image';
        img.alt = pokemon.name;
        img.width = 80;
        img.height = 80;
        
        try {
            const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            console.error(`❌ Ошибка загрузки изображения для ${pokemon.name}:`, e);
        }
        
        card.innerHTML = `
            ${img.outerHTML}
            <h4>${pokemon.name}</h4>
            <div class="pokemon-rarity" style="color: ${rarity.color}; border-color: ${rarity.color}">
                Lv.${pokemon.level} ${rarity.name}
            </div>
            <div class="pokemon-stats">
                <div>Урон: ${Math.floor(pokemon.currentDamage)}</div>
                <div>Энергия: ${Math.floor(energyPercent)}%</div>
            </div>
            <button class="add-to-team-btn">➕ В команду</button>
        `;
        
        return card;
    }
    
    async createTeamSlot(pokemon, isSelected) {
        const slot = document.createElement('div');
        slot.className = `team-slot ${isSelected ? 'selected' : ''}`;
        slot.dataset.id = pokemon.id;
        
        const img = document.createElement('img');
        img.className = 'team-pokemon-image';
        img.alt = pokemon.name;
        img.width = 50;
        img.height = 50;
        
        try {
            const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            console.error(`❌ Ошибка загрузки изображения для ${pokemon.name}:`, e);
        }
        
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        slot.innerHTML = `
            ${img.outerHTML}
            <div class="pokemon-info">
                <span class="pokemon-name">${pokemon.name}</span>
                <span class="pokemon-level">Lv.${pokemon.level}</span>
            </div>
            <div class="energy-bar" style="--energy-width: ${energyPercent}%"></div>
        `;
        
        if (isSelected) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.game.removeFromTeam(pokemon.id);
                this.createTeamSelectionUI();
            });
            slot.appendChild(removeBtn);
        }
        
        const delay = Math.random() * 2;
        slot.style.setProperty('--i', delay);
        
        return slot;
    }
    
    addTeamSelectionHandlers() {
        const selectableCards = document.querySelectorAll('.pokemon-card.selectable');
        
        selectableCards.forEach(card => {
            const addButton = card.querySelector('.add-to-team-btn');
            if (addButton) {
                addButton.addEventListener('click', () => {
                    const pokemonId = parseInt(card.dataset.id);
                    this.game.addToTeam(pokemonId);
                    this.createTeamSelectionUI();
                });
            }
        });
    }
    
    async updateTeamDisplay() {
        const teamSlots = document.getElementById('team-slots');
        if (!teamSlots) return;
        
        teamSlots.innerHTML = '';
        const team = this.game.pokemonManager.team;
        
        for (const pokemon of team) {
            const slot = document.createElement('div');
            slot.className = 'team-slot';
            slot.style.setProperty('--i', Math.random() * 2);
            
            const img = document.createElement('img');
            img.className = 'team-pokemon-image';
            img.alt = pokemon.name;
            img.width = 50;
            img.height = 50;
            
            try {
                const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
                img.src = pokemonImg.src;
            } catch (e) {
                console.error(`❌ Ошибка загрузки изображения для ${pokemon.name}:`, e);
            }
            
            const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
            
            slot.innerHTML = `
                ${img.outerHTML}
                <div class="type-icons-mini">
                    ${this.getTypeIcons(pokemon.types, true)}
                </div>
                <div class="energy-bar" style="--energy-width: ${energyPercent}%"></div>
            `;
            teamSlots.appendChild(slot);
        }
        
        for (let i = team.length; i < this.game.pokemonManager.maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i><span>Пусто</span>';
            teamSlots.appendChild(emptySlot);
        }
    }
    
    getTypeIcons(types, mini = false) {
        const iconClass = mini ? 'type-icon-mini' : 'type-icon';
        return types.map(type => {
            const symbol = this.getTypeSymbol(type);
            return `<div class="${iconClass}" title="${type}">${symbol}</div>`;
        }).join('');
    }
    
    getTypeSymbol(type) {
        const symbols = {
            NORMAL: '⬤',
            FIRE: '🔥',
            WATER: '💧',
            GRASS: '🌿',
            ELECTRIC: '⚡',
            ICE: '❄️',
            FIGHTING: '👊',
            POISON: '☠️',
            GROUND: '⛰️',
            FLYING: '🦅',
            PSYCHIC: '🔮',
            BUG: '🐛',
            ROCK: '🪨',
            GHOST: '👻',
            DRAGON: '🐉'
        };
        return symbols[type] || '❓';
    }
    
    async updateUI() {
        await this.updateTeamDisplay();
        this.game.battleSystem.updateUI();
        this.game.shopSystem.updateMoneyDisplay();
        this.game.shopSystem.updatePokeballsDisplay();
        
        const team = this.game.pokemonManager.team;
        if (team.length > 0) {
            const maxLevel = Math.max(...team.map(p => p.level));
            document.getElementById('player-level').textContent = maxLevel;
        }
        
        // Обновляем обработчики покеболов после каждого обновления UI
        this.setupPokeballClickHandlers();
    }
    
    initEventListeners() {
        // Клик по врагу для атаки
        const enemyCard = document.querySelector('.enemy-card');
        if (enemyCard) {
            enemyCard.addEventListener('click', () => {
                this.game.manualAttack();
            });
        }
        
        // Навигационные кнопки
        const navButtons = {
            'collection-menu': 'collection',
            'shop-menu': 'shop',
            'team-menu': 'team'
        };
        
        for (const [buttonId, modalName] of Object.entries(navButtons)) {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.showModal(modalName);
                });
            }
        }
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                this.game.manualAttack();
            } else if (e.code === 'KeyC' && e.ctrlKey) {
                e.preventDefault();
                this.showModal('collection');
            } else if (e.code === 'KeyT' && e.ctrlKey) {
                e.preventDefault();
                this.showModal('team');
            } else if (e.code === 'KeyS' && e.ctrlKey) {
                e.preventDefault();
                this.showModal('shop');
            }
        });
    }
}

// Добавляем стили для анимации слияния
const mergeStyles = document.createElement('style');
mergeStyles.textContent = `
    .merge-modal .modal-content {
        max-width: 500px;
    }
    
    .merge-animation {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin: 30px 0;
    }
    
    .merge-pokemon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid var(--accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .merge-pokemon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    
    .merge-plus, .merge-equals {
        font-size: 2rem;
        color: var(--text-secondary);
        font-weight: bold;
    }
    
    .merge-details {
        text-align: center;
    }
    
    .merge-name {
        font-size: 1.5rem;
        margin-bottom: 20px;
        color: var(--accent-warning);
    }
    
    .merge-stats {
        display: flex;
        justify-content: center;
        gap: 30px;
    }
    
    .stat {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .stat span:first-child {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .stat .increase {
        color: var(--accent-success);
        font-weight: bold;
    }
    
    @keyframes mergeAppear {
        from {
            opacity: 0;
            transform: scale(0.5) rotate(-180deg);
        }
        to {
            opacity: 1;
            transform: scale(1) rotate(0);
        }
    }
`;
document.head.appendChild(mergeStyles);

window.UIManager = UIManager;