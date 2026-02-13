// ==============================
// МЕНЕДЖЕР ПОКЕМОНОВ
// ==============================

class PokemonManager {
    constructor() {
        this.collection = [];
        this.team = [];
        this.maxTeamSize = GAME_CONFIG.MAX_TEAM_SIZE;
        this.pokemonTemplates = GAME_CONFIG.POKEMON_IMAGES;
    }
    
    // Генерирует нового покемона по ID
    generatePokemon(pokemonId) {
        const template = this.pokemonTemplates[pokemonId];
        if (!template) return null;
        
        const rarity = GAME_CONFIG.RARITIES[template.rarity];
        
        return {
            id: pokemonId,
            name: template.name,
            rarity: template.rarity,
            types: template.types,
            baseDamage: template.baseDamage,
            currentDamage: template.baseDamage * rarity.damageMultiplier,
            level: 1,
            experience: 0,
            maxExperience: 100,
            image: template.image,
            energy: GAME_CONFIG.MAX_ENERGY,
            maxEnergy: GAME_CONFIG.MAX_ENERGY,
            isInTeam: false,
            obtainedAt: Date.now()
        };
    }
    
    // Добавляет покемона в коллекцию
    addToCollection(pokemonData) {
        const pokemon = this.generatePokemon(pokemonData.id || pokemonData);
        if (pokemon) {
            this.collection.push(pokemon);
            return pokemon;
        }
        return null;
    }
    
    // Добавляет покемона в команду
    addToTeam(pokemonId) {
        if (this.team.length >= this.maxTeamSize) {
            return { success: false, message: 'Команда полна!' };
        }
        
        const pokemon = this.collection.find(p => p.id === pokemonId);
        if (!pokemon) {
            return { success: false, message: 'Покемон не найден!' };
        }
        
        if (pokemon.isInTeam) {
            return { success: false, message: 'Покемон уже в команде!' };
        }
        
        if (pokemon.energy <= 0) {
            return { success: false, message: 'У покемона нет энергии!' };
        }
        
        pokemon.isInTeam = true;
        this.team.push(pokemon);
        
        return { success: true, pokemon };
    }
    
    // Удаляет покемона из команды
    removeFromTeam(pokemonId) {
        const pokemonIndex = this.team.findIndex(p => p.id === pokemonId);
        if (pokemonIndex !== -1) {
            const pokemon = this.team[pokemonIndex];
            pokemon.isInTeam = false;
            this.team.splice(pokemonIndex, 1);
            return true;
        }
        return false;
    }
    
    // Получает общий урон команды
    getTeamDamage() {
        let totalDamage = 0;
        for (const pokemon of this.team) {
            if (pokemon.energy > 0) {
                totalDamage += pokemon.currentDamage;
            }
        }
        return totalDamage;
    }
    
    // Наносит урон (тратит энергию)
    applyDamage() {
        for (const pokemon of this.team) {
            if (pokemon.energy > 0) {
                pokemon.energy -= GAME_CONFIG.ENERGY_DECAY_PER_ATTACK;
                
                // Если энергия закончилась, убираем из команды
                if (pokemon.energy <= 0) {
                    pokemon.energy = 0;
                    pokemon.isInTeam = false;
                    this.team = this.team.filter(p => p.id !== pokemon.id);
                    this.showNotification(`${pokemon.name} устал и вернулся в коллекцию!`, 'warning');
                }
            }
        }
    }
    
    // Восстанавливает энергию всем покемонам вне команды
    restoreEnergy() {
        for (const pokemon of this.collection) {
            if (!pokemon.isInTeam && pokemon.energy < pokemon.maxEnergy) {
                pokemon.energy = Math.min(
                    pokemon.maxEnergy,
                    pokemon.energy + GAME_CONFIG.ENERGY_RESTORE_PER_SECOND
                );
            }
        }
    }
    
    // Получает покемона по ID
    getPokemonById(id) {
        return this.collection.find(p => p.id === id);
    }
    
    // Получает всех покемонов определенной редкости
    getPokemonsByRarity(rarity) {
        return this.collection.filter(p => p.rarity === rarity);
    }
    
    // Улучшает покемона
    levelUpPokemon(pokemonId) {
        const pokemon = this.getPokemonById(pokemonId);
        if (!pokemon) return false;
        
        pokemon.level++;
        pokemon.currentDamage *= 1.1; // +10% урона за уровень
        pokemon.experience = 0;
        pokemon.maxExperience = Math.floor(pokemon.maxExperience * 1.5);
        
        return true;
    }
    
    // Добавляет опыт покемону
    addExperience(pokemonId, exp) {
        const pokemon = this.getPokemonById(pokemonId);
        if (!pokemon) return false;
        
        pokemon.experience += exp;
        if (pokemon.experience >= pokemon.maxExperience) {
            this.levelUpPokemon(pokemonId);
            this.showNotification(`${pokemon.name} достиг уровня ${pokemon.level}!`, 'info');
        }
        
        return true;
    }
    
    // Восстанавливает энергию покемона
    restorePokemonEnergy(pokemonId) {
        const pokemon = this.getPokemonById(pokemonId);
        if (!pokemon) return false;
        
        pokemon.energy = pokemon.maxEnergy;
        return true;
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

// Экспорт менеджера покемонов
window.PokemonManager = PokemonManager;