// ==============================
// МЕНЕДЖЕР ИНТЕРФЕЙСА
// ==============================

class UIManager {
    constructor(game, atlasManager) {
        this.game = game;
        this.atlasManager = atlasManager;
        this.modals = {};
        this.initModals();
    }
    
    initModals() {
        const modals = ['pokeball', 'collection', 'shop', 'team'];
        
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
    
    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'block';
            
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
    
    createCollectionUI() {
        const collectionGrid = document.getElementById('collection-grid');
        if (!collectionGrid) return;
        
        collectionGrid.innerHTML = '';
        
        const collection = this.game.pokemonManager.collection;
        
        if (collection.length === 0) {
            collectionGrid.innerHTML = '<div class="empty-collection"><i class="fas fa-box-open"></i><p>Коллекция пуста! Откройте покеболы в магазине.</p></div>';
            return;
        }
        
        collection.forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.dataset.id = pokemon.id;
            
            const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
            const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
            
            // Создаем canvas для покемона
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            canvas.className = 'pokemon-canvas';
            
            GameUtils.drawPokemon(
                canvas.getContext('2d'),
                this.atlasManager,
                pokemon.id,
                GAME_CONFIG,
                0, 0,
                120, 120
            );
            
            card.innerHTML = `
                ${canvas.outerHTML}
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
        
        // Текущая команда
        const teamSection = document.createElement('div');
        teamSection.className = 'current-team';
        teamSection.innerHTML = '<h3>Текущая команда</h3>';
        
        const teamSlots = document.createElement('div');
        teamSlots.className = 'team-slots';
        
        team.forEach(pokemon => {
            const slot = this.createTeamSlot(pokemon, true);
            teamSlots.appendChild(slot);
        });
        
        for (let i = team.length; i < this.game.pokemonManager.maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i>';
            teamSlots.appendChild(emptySlot);
        }
        
        teamSection.appendChild(teamSlots);
        teamSelection.appendChild(teamSection);
        
        // Доступные покемоны
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
        
        this.addTeamSelectionHandlers();
    }
    
    createTeamSlot(pokemon, isSelected) {
        const slot = document.createElement('div');
        slot.className = `team-slot ${isSelected ? 'selected' : ''}`;
        slot.dataset.id = pokemon.id;
        
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        
        GameUtils.drawPokemon(
            canvas.getContext('2d'),
            this.atlasManager,
            pokemon.id,
            GAME_CONFIG,
            0, 0,
            64, 64
        );
        
        slot.innerHTML = `
            ${canvas.outerHTML}
            <div class="pokemon-info">
                <span class="pokemon-name">${pokemon.name}</span>
                <span class="pokemon-damage">Урон: ${pokemon.currentDamage}</span>
            </div>
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
        
        return slot;
    }
    
    createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card selectable';
        card.dataset.id = pokemon.id;
        
        const rarity = GAME_CONFIG.RARITIES[pokemon.rarity];
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        
        GameUtils.drawPokemon(
            canvas.getContext('2d'),
            this.atlasManager,
            pokemon.id,
            GAME_CONFIG,
            0, 0,
            100, 100
        );
        
        card.innerHTML = `
            ${canvas.outerHTML}
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
    
    updateTeamDisplay() {
        const teamSlots = document.getElementById('team-slots');
        if (!teamSlots) return;
        
        teamSlots.innerHTML = '';
        const team = this.game.pokemonManager.team;
        
        team.forEach(pokemon => {
            const slot = document.createElement('div');
            slot.className = 'team-slot';
            
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            
            GameUtils.drawPokemon(
                canvas.getContext('2d'),
                this.atlasManager,
                pokemon.id,
                GAME_CONFIG,
                0, 0,
                64, 64
            );
            
            slot.innerHTML = `
                ${canvas.outerHTML}
                <div class="energy-bar" style="width: ${(pokemon.energy / pokemon.maxEnergy) * 100}%"></div>
            `;
            teamSlots.appendChild(slot);
        });
        
        for (let i = team.length; i < this.game.pokemonManager.maxTeamSize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i>';
            teamSlots.appendChild(emptySlot);
        }
    }
    
    updateUI() {
        this.updateTeamDisplay();
        this.game.battleSystem.updateUI();
        this.game.shopSystem.updateMoneyDisplay();
        this.game.shopSystem.updatePokeballsDisplay();
    }
    
    initEventListeners() {
        const attackButton = document.getElementById('attack-button');
        if (attackButton) {
            attackButton.addEventListener('click', () => {
                this.game.manualAttack();
            });
        }
        
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

window.UIManager = UIManager;