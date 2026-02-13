// ==============================
// ГЕНЕРАТОР ЗВУКОВ ДЛЯ ИГРЫ
// ==============================

const GameSoundGenerator = {
    audioContext: null,
    isInitialized: false,
    enabled: true,
    
    // Инициализация аудиоконтекста
    init: function() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            console.log('🎵 Аудиоконтекст инициализирован');
        } catch (error) {
            console.error('Не удалось создать аудиоконтекст:', error);
        }
    },
    
    // Активация звуков (после первого клика пользователя)
    activate: function() {
        this.enabled = true;
        if (!this.audioContext) {
            this.init();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },
    
    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
    
    _createOscillator: function(type, frequency, startTime, duration) {
        if (!this.audioContext || !this.enabled) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // Плавное затухание
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        return oscillator;
    },
    
    _createSound: function(options = {}) {
        if (!this.audioContext || !this.enabled) {
            this.init();
            if (!this.audioContext) return;
        }
        
        const {
            type = 'sine',
            frequency = 440,
            duration = 0.1,
            volume = 0.3,
            startTime = this.audioContext.currentTime
        } = options;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, startTime);
            
            gainNode.gain.setValueAtTime(volume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        } catch (error) {
            console.warn('Ошибка создания звука:', error);
        }
    },
    
    // ===== ЗВУКИ ДЛЯ ИГРЫ =====
    
    // Звук атаки
    playAttack: function() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        
        // Два звука для эффекта удара
        this._createSound({
            type: 'sawtooth',
            frequency: 200,
            duration: 0.1,
            volume: 0.2,
            startTime: now
        });
        
        this._createSound({
            type: 'square',
            frequency: 100,
            duration: 0.15,
            volume: 0.15,
            startTime: now + 0.02
        });
    },
    
    // Звук победы
    playVictory: function() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        
        // Веселая мелодия из 3 нот
        this._createSound({
            type: 'sine',
            frequency: 523.25, // До
            duration: 0.2,
            volume: 0.25,
            startTime: now
        });
        
        this._createSound({
            type: 'sine',
            frequency: 659.25, // Ми
            duration: 0.2,
            volume: 0.25,
            startTime: now + 0.2
        });
        
        this._createSound({
            type: 'sine',
            frequency: 783.99, // Соль
            duration: 0.3,
            volume: 0.3,
            startTime: now + 0.4
        });
    },
    
    // Звук открытия покебола
    playPokeballOpen: function() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        
        // Звук открытия
        this._createSound({
            type: 'sine',
            frequency: 800,
            duration: 0.1,
            volume: 0.2,
            startTime: now
        });
        
        this._createSound({
            type: 'sine',
            frequency: 600,
            duration: 0.15,
            volume: 0.2,
            startTime: now + 0.05
        });
        
        // Финальный звук появления
        this._createSound({
            type: 'triangle',
            frequency: 1200,
            duration: 0.2,
            volume: 0.25,
            startTime: now + 0.15
        });
    },
    
    // Звук крика покемона
    playPokemonCry: function() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        
        // Случайный звук покемона
        const baseFreq = Math.random() * 300 + 200;
        
        for (let i = 0; i < 3; i++) {
            this._createSound({
                type: i % 2 === 0 ? 'sawtooth' : 'square',
                frequency: baseFreq * (1 + i * 0.2),
                duration: 0.1,
                volume: 0.15,
                startTime: now + i * 0.1
            });
        }
    },
    
    // Звук монет
    playCoin: function() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        
        this._createSound({
            type: 'sine',
            frequency: 800,
            duration: 0.05,
            volume: 0.15,
            startTime: now
        });
        
        this._createSound({
            type: 'sine',
            frequency: 1200,
            duration: 0.1,
            volume: 0.15,
            startTime: now + 0.05
        });
    },
    
    // Звук восстановления энергии
    playEnergyRestore: function() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        
        for (let i = 0; i < 4; i++) {
            this._createSound({
                type: 'sine',
                frequency: 400 + i * 200,
                duration: 0.08,
                volume: 0.1,
                startTime: now + i * 0.08
            });
        }
    },
    
    // Звук добавления в команду
    playAddToTeam: function() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        
        this._createSound({
            type: 'triangle',
            frequency: 600,
            duration: 0.1,
            volume: 0.2,
            startTime: now
        });
        
        this._createSound({
            type: 'triangle',
            frequency: 800,
            duration: 0.15,
            volume: 0.2,
            startTime: now + 0.1
        });
    },
    
    // Звук ошибки
    playError: function() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        
        this._createSound({
            type: 'sawtooth',
            frequency: 200,
            duration: 0.2,
            volume: 0.2,
            startTime: now
        });
        
        this._createSound({
            type: 'sawtooth',
            frequency: 150,
            duration: 0.3,
            volume: 0.15,
            startTime: now + 0.1
        });
    }
};

// Экспортируем для использования
if (typeof window !== 'undefined') {
    window.GameSoundGenerator = GameSoundGenerator;
}