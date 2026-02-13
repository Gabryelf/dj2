// ==============================
// МЕНЕДЖЕР ИНТЕРФЕЙСА
// ==============================

class UIManager {
    constructor(game) {
        this.game = game;
        this.modals = {};
        this.initModals();
    }
    
    // Инициализация модальных окон
    initModals() {
        const modals = ['pokeball', 'collection', 'shop', 'team'];
        
        modals.forEach(modalName => {
            const modal = document.getElementById(`${modalName}-modal`);
            if (modal) {
                this.modals[modalName] = modal;
                
                // Закрытие по клику на крестик
                const closeBtn = modal.querySelector('.close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }
                
                // Закрытие по клику вне окна
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
                
                // Предотвращаем закрытие при клике внутри контента
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }
            }
        });
    }
    
    // Показывает модальное окно
    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'block';
            
            // Обновляем содержимое
            switch(modalName) {
                case 'pokeball':
                    this.game.shopSystem.createPokeballUI();
                    break;
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
    
    // Создает UI коллекции
    createCollectionUI() {
        const collectionGrid = document.getElementById('collection-grid');
        if (!collectionGrid) return;
        
        collectionGrid.innerHTML = '';
        
        const collection = this.game.pokemonManager.collection;
        
        if (collection.length === 0) {
            collectionGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Коллекция пуста! Откройте покеболы в магазине.</p>';
            return;
        }
        
        collection.forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.dataset.id = pokemon.id;
            
            const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
            const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
            
            card.innerHTML = `
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <h4>${pokemon.name}</h4>
                <div class="pokemon-rarity ${pokemon.rarity.toLowerCase()}">
                    ${rarity.name}
                </div>
                <div class="pokemon-stats">
                    <div>Урон: ${pokemon.currentDamage}</div>
                    <div>Уровень: ${pokemon.level}</div>
                    <div>Тип: ${pokemon.types.join(', ')}</div>
                    <div>Энергия: ${Math.round(energyPercent)}%</div>
                </div>
                ${pokemon.isInTeam ? '<div class="in-team">В команде</div>' : ''}
            `;
            
            collectionGrid.appendChild(card);
        });
    }
    
    // Создает UI выбора команды
    createTeamSelectionUI() {
        const teamSelection = document.getElementById('team-selection');
        if (!teamSelection) return;
        
        teamSelection.innerHTML = '';
        
        const collection = this.game.pokemonManager.collection;
        const team = this.game.pokemonManager.team;
        
        if (collection.length === 0) {
            teamSelection.innerHTML = '<p style="text-align: center;">Коллекция пуста!</p>';
            return;
        }
        
        // Показываем текущую команду
        const teamSection = document.createElement('div');
        teamSection.className = 'current-team';
        teamSection.innerHTML = '<h3>Текущая команда</h3>';
        
        const teamSlots = document.createElement('div');
        teamSlots.className = 'team-slots';
        
        team.forEach(pokemon => {
            const slot = this.createTeamSlot(pokemon, true);
            teamSlots.appendChild(slot);
        });
        
        // Добавляем пустые слоты
        for (let i = team.length; i < this.game.pokemonManager.maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i>';
            teamSlots.appendChild(emptySlot);
        }
        
        teamSection.appendChild(teamSlots);
        teamSelection.appendChild(teamSection);
        
        // Показываем доступных покемонов
        const availableSection = document.createElement('div');
        availableSection.className = 'available-pokemon';
        availableSection.innerHTML = '<h3>Доступные покемоны</h3>';
        
        const availableGrid = document.createElement('div');
        availableGrid.className = 'available-grid';
        
        const availablePokemon = collection.filter(p => !p.isInTeam && p.energy > 0);
        
        if (availablePokemon.length === 0) {
            availableGrid.innerHTML = '<p>Нет доступных покемонов (проверьте энергию)</p>';
        } else {
            availablePokemon.forEach(pokemon => {
                const pokemonCard = this.createPokemonCard(pokemon);
                availableGrid.appendChild(pokemonCard);
            });
        }
        
        availableSection.appendChild(availableGrid);
        teamSelection.appendChild(availableSection);
        
        // Добавляем обработчики событий
        this.addTeamSelectionHandlers();
    }
    
    // Создает слот команды
    createTeamSlot(pokemon, isSelected) {
        const slot = document.createElement('div');
        slot.className = `team-slot ${isSelected ? 'selected' : ''}`;
        slot.dataset.id = pokemon.id;
        
        slot.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <div class="pokemon-info">
                <span class="pokemon-name">${pokemon.name}</span>
                <span class="pokemon-damage">Урон: ${pokemon.currentDamage}</span>
            </div>
        `;
        
        // Добавляем кнопку удаления
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
        
        return slot;
    }
    
    // Создает карточку покемона
    createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card selectable';
        card.dataset.id = pokemon.id;
        
        const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <h4>${pokemon.name}</h4>
            <div class="pokemon-rarity ${pokemon.rarity.toLowerCase()}">
                ${rarity.name}
            </div>
            <div class="pokemon-stats">
                <div>Урон: ${pokemon.currentDamage}</div>
                <div>Энергия: ${Math.round(energyPercent)}%</div>
            </div>
            <button class="add-to-team-btn">Добавить в команду</button>
        `;
        
        return card;
    }
    
    // Добавляет обработчики для выбора команды
    addTeamSelectionHandlers() {
        const selectableCards = document.querySelectorAll('.pokemon-card.selectable');
        const teamSlots = document.querySelectorAll('.team-slot.empty');
        
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
    
    // Обновляет отображение команды на главном экране
    updateTeamDisplay() {
        const teamSlots = document.getElementById('team-slots');
        if (!teamSlots) return;
        
        teamSlots.innerHTML = '';
        const team = this.game.pokemonManager.team;
        
        team.forEach(pokemon => {
            const slot = document.createElement('div');
            slot.className = 'team-slot';
            slot.innerHTML = `
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <div class="energy-bar" style="width: ${(pokemon.energy / pokemon.maxEnergy) * 100}%"></div>
            `;
            teamSlots.appendChild(slot);
        });
        
        // Добавляем пустые слоты
        for (let i = team.length; i < this.game.pokemonManager.maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i>';
            teamSlots.appendChild(emptySlot);
        }
    }
    
    // Обновляет весь UI
    updateUI() {
        this.updateTeamDisplay();
        this.game.battleSystem.updateUI();
        this.game.shopSystem.updateMoneyDisplay();
        this.game.shopSystem.updatePokeballsDisplay();
    }
    
    // Инициализация обработчиков событий
    initEventListeners() {
        // Кнопка атаки
        const attackButton = document.getElementById('attack-button');
        if (attackButton) {
            attackButton.addEventListener('click', () => {
                this.game.manualAttack();
            });
        }
        
        // Кнопки действий
        const actionButtons = {
            'pokeball-menu': 'pokeball',
            'collection-menu': 'collection',
            'shop-menu': 'shop',
            'team-menu': 'team'
        };
        
        for (const [buttonId, modalName] of Object.entries(actionButtons)) {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.showModal(modalName);
                });
            }
        }
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.game.manualAttack();
            } else if (e.code === 'KeyP' && e.ctrlKey) {
                e.preventDefault();
                this.showModal('pokeball');
            } else if (e.code === 'KeyC' && e.ctrlKey) {
                e.preventDefault();
                this.showModal('collection');
            } else if (e.code === 'KeyT' && e.ctrlKey) {
                e.preventDefault();
                this.showModal('team');
            }
        });
    }
}

// Экспорт менеджера интерфейса
window.UIManager = UIManager;