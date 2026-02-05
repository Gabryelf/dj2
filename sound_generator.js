// ============ ГЕНЕРАТОР ЗВУКОВ ДЛЯ ИГРЫ ============
// Этот файл ТОЛЬКО для работы со звуками
// Он ничего не знает об игре, только создает звуки

const GameSoundGenerator = {
    audioContext: null,
    isInitialized: false,
    
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
    
    // ===== ОСНОВНОЙ МЕТОД ГЕНЕРАЦИИ =====
    createSound: function(options = {}) {
        if (!this.audioContext) this.init();
        if (!this.audioContext) return;
        
        const {
            type = 'sine',           // Форма волны
            frequency = 440,         // Частота в Гц
            duration = 0.1,          // Длительность в секундах
            volume = 0.3,            // Громкость 0-1
            fadeOut = true,          // Плавное затухание
            vibrato = false,         // Вибрато эффект
        } = options;
        
        try {
            // Основной осциллятор
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Настройки
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            // Вибрато (дрожание частоты)
            if (vibrato) {
                oscillator.frequency.setValueAtTime(frequency * 0.9, this.audioContext.currentTime + duration * 0.3);
                oscillator.frequency.setValueAtTime(frequency * 1.1, this.audioContext.currentTime + duration * 0.6);
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + duration * 0.9);
            }
            
            // Управление громкостью
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            
            // Плавное затухание
            if (fadeOut) {
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            }
            
            // Запуск
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('Ошибка создания звука:', error);
        }
    },
    
    // ===== ПУБЛИЧНЫЕ МЕТОДЫ (доступны извне) =====
    
    // Звук клика
    playClick: function() {
        this.createSound({
            type: 'sine',
            frequency: 800,
            duration: 0.1,
            volume: 0.2,
            fadeOut: true
        });
    },
    
    // Звук повышения уровня
    playLevelUp: function() {
        // Первая нота
        this.createSound({
            type: 'sine',
            frequency: 523.25,
            duration: 0.15,
            volume: 0.3
        });
        
        // Вторая нота (с задержкой)
        setTimeout(() => {
            this.createSound({
                type: 'sine',
                frequency: 659.25,
                duration: 0.15,
                volume: 0.3
            });
        }, 150);
        
        // Третья нота
        setTimeout(() => {
            this.createSound({
                type: 'sine',
                frequency: 783.99,
                duration: 0.2,
                volume: 0.4,
                vibrato: true
            });
        }, 300);
    },
    
    // 8-BIT звук клика
    play8BitClick: function() {
        this.createSound({
            type: 'square',
            frequency: 1200,
            duration: 0.08,
            volume: 0.15,
            fadeOut: false
        });
    },
    
    // Звук покемона
    playPokemonSound: function(pokemonType = 'normal') {
        const sounds = {
            electric: () => {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        this.createSound({
                            type: 'square',
                            frequency: 800 + (i * 200),
                            duration: 0.05,
                            volume: 0.1
                        });
                    }, i * 50);
                }
            },
            fire: () => {
                this.createSound({
                    type: 'sawtooth',
                    frequency: 300,
                    duration: 0.4,
                    volume: 0.2,
                    vibrato: true
                });
            },
            water: () => {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.createSound({
                            type: 'sine',
                            frequency: 200 + (i * 100),
                            duration: 0.1,
                            volume: 0.15
                        });
                    }, i * 100);
                }
            }
        };
        
        if (sounds[pokemonType]) {
            sounds[pokemonType]();
        } else {
            this.createSound({
                type: 'sine',
                frequency: Math.random() * 400 + 200,
                duration: 0.2,
                volume: 0.25,
                vibrato: true
            });
        }
    },
    
    // Достижение
    playAchievement: function() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.createSound({
                    type: index === notes.length - 1 ? 'square' : 'sine',
                    frequency: freq,
                    duration: 0.2,
                    volume: 0.25 + (index * 0.05),
                    vibrato: index === notes.length - 1
                });
            }, index * 200);
        });
    },
    
    // Ошибка
    playError: function() {
        this.createSound({
            type: 'sawtooth',
            frequency: 600,
            duration: 0.3,
            volume: 0.2
        });
        
        setTimeout(() => {
            this.createSound({
                type: 'sawtooth',
                frequency: 400,
                duration: 0.3,
                volume: 0.2
            });
        }, 100);
    },
    
    // Активация звуков (после первого клика пользователя)
    activate: function() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.init();
            if (this.audioContext) {
                this.audioContext.resume();
            }
        }
    }
};

// Экспортируем объект для использования в других файлах
// В браузере используем window, в Node.js был бы module.exports
if (typeof window !== 'undefined') {
    window.GameSoundGenerator = GameSoundGenerator;
}
