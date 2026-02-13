// ==============================
// МЕНЕДЖЕР ПОКЕМОНОВ
// ==============================

class PokemonManager {
    constructor(atlasManager) {
        this.atlasManager = atlasManager;
        this.collection = [];
        this.team = [];
        this.maxTeamSize = GAME_CONFIG.MAX_TEAM_SIZE;
    }
    
    addToCollection(pokemonId) {
        const pokemonData = GAME_CONFIG.POKEMON_SPRITES[pokemonId];
        if (!pokemonData) return null;
        
        const newPokemon = {
            id: pokemonId,
            name: pokemonData.name,
            types: [...pokemonData.types],
            rarity: pokemonData.rarity,
            baseDamage: pokemonData.baseDamage,
            level: 1,
            currentDamage: pokemonData.baseDamage * GAME_CONFIG.RARITIES[pokemonData.rarity].damageMultiplier,
            energy: GAME_CONFIG.MAX_ENERGY,
            maxEnergy: GAME_CONFIG.MAX_ENERGY,
            isInTeam: false,
            atlasX: pokemonData.atlasX,
            atlasY: pokemonData.atlasY
        };
        
        this.collection.push(newPokemon);
        return newPokemon;
    }
    
    addToTeam(pokemonId) {
        const pokemon = this.getPokemonById(pokemonId);
        
        if (!pokemon) {
            return { success: false, message: 'Покемон не найден' };
        }
        
        if (pokemon.isInTeam) {
            return { success: false, message: 'Покемон уже в команде' };
        }
        
        if (this.team.length >= this.maxTeamSize) {
            return { success: false, message: 'Команда заполнена' };
        }
        
        if (pokemon.energy <= 0) {
            return { success: false, message: 'У покемона нет энергии' };
        }
        
        pokemon.isInTeam = true;
        this.team.push(pokemon);
        
        return { success: true, pokemon };
    }
    
    removeFromTeam(pokemonId) {
        const index = this.team.findIndex(p => p.id === pokemonId);
        
        if (index === -1) return false;
        
        const pokemon = this.team[index];
        pokemon.isInTeam = false;
        this.team.splice(index, 1);
        
        return true;
    }
    
    getPokemonById(pokemonId) {
        return this.collection.find(p => p.id === pokemonId);
    }
    
    getTeamDamage() {
        return this.team.reduce((sum, pokemon) => sum + pokemon.currentDamage, 0);
    }
    
    restoreEnergy() {
        this.collection.forEach(pokemon => {
            if (!pokemon.isInTeam && pokemon.energy < pokemon.maxEnergy) {
                pokemon.energy = Math.min(
                    pokemon.maxEnergy,
                    pokemon.energy + GAME_CONFIG.ENERGY_RESTORE_PER_SECOND
                );
            }
        });
    }
    
    useEnergy() {
        let totalDamage = 0;
        
        this.team.forEach(pokemon => {
            if (pokemon.energy > 0) {
                pokemon.energy = Math.max(0, pokemon.energy - GAME_CONFIG.ENERGY_DECAY_PER_ATTACK);
                totalDamage += pokemon.currentDamage;
            }
        });
        
        // Убираем из команды покемонов без энергии
        this.team = this.team.filter(pokemon => {
            if (pokemon.energy <= 0) {
                pokemon.isInTeam = false;
                return false;
            }
            return true;
        });
        
        return totalDamage;
    }
}

window.PokemonManager = PokemonManager;