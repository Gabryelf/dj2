// Глобальные переменные
let score = 0;
let imageIndex = 0;
const thresholds = [10, 25, 50, 100, 200];
const pokemonImages = [
    "images/1.png",
    "images/2.png",
    "images/3.png",
    "images/4.png",
    "images/5.png",
    "images/6.png"
];
const pokemonNames = [
    "Пикачу",
    "Чармандер",
    "Сквиртл",
    "Бульбазавр",
    "Иви",
    "Мяут"
];
const pokemonDescriptions = [
    "Электрический покемон. Милый и дружелюбный!",
    "Огненный покемон. Любит тренироваться!",
    "Водный покемон. Отличный пловец!",
    "Травяной покемон. Очень сильный и выносливый!",
    "Нормальный покемон. Может эволюционировать в разных покемонов!",
    "Нормальный покемон. Любит блестящие предметы!"
];

// Получение элементов DOM
const scoreElement = document.getElementById('current-score');
const nextLevelElement = document.getElementById('next-level');
const pokemonImage = document.getElementById('main-pokemon');
const pokemonNameElement = document.getElementById('pokemon-name');
const pokemonDescriptionElement = document.getElementById('pokemon-description');
const clickButton = document.getElementById('click-btn');
const progressFill = document.getElementById('progress-fill');
const progressPercent = document.getElementById('progress-percent');
const progressInfo = document.getElementById('progress-info');

// Функция инициализации игры
function initializeGame() {
    console.log("Игра инициализируется...");
    updateDisplay();
    createSoundControls();
}

// Функция обработки клика
function handleClick() {
    score++;
    updateDisplay();
    checkLevelUp();
    createClickEffect();
}

// Функция обновления дисплея
function updateDisplay() {
    // Обновление счета
    scoreElement.textContent = score;
    
    // Расчет прогресса
    let nextThreshold = thresholds[imageIndex] || 999;
    let progress = Math.min((score / nextThreshold) * 100, 100);
    
    // Обновление прогресс-бара
    if (progressFill) {
        progressFill.style.width = progress + "%";
    }
    
    // Обновление текста прогресса
    if (progressPercent) {
        progressPercent.textContent = Math.round(progress) + "%";
    }
    
    if (progressInfo) {
        progressInfo.textContent = score + " из " + nextThreshold + " очков";
    }
    
    // Обновление следующего уровня
    if (nextLevelElement) {
        nextLevelElement.textContent = nextThreshold;
    }
}

// Функция проверки повышения уровня
function checkLevelUp() {
    if (imageIndex < thresholds.length && score >= thresholds[imageIndex]) {
        imageIndex++;
        changePokemon();
        
        // Создаем эффект при открытии нового покемона
        const celebration = document.createElement('div');
        celebration.textContent = '🎉 Новый покемон открыт! 🎉';
        celebration.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff416c, #ff4b2b);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideDown 0.5s ease-out;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(255, 65, 108, 0.4);
        `;
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.style.animation = 'slideUp 0.5s ease-out forwards';
            setTimeout(() => celebration.remove(), 500);
        }, 2000);
    }
}

function changePokemon() {
    if (imageIndex < pokemonImages.length) {
        const nextImageIndex = Math.min(imageIndex, pokemonImages.length - 1);
        pokemonImage.src = pokemonImages[nextImageIndex];
        pokemonImage.alt = pokemonNames[nextImageIndex];
        
        if (pokemonNameElement) {
            pokemonNameElement.textContent = pokemonNames[nextImageIndex];
        }
        
        if (pokemonDescriptionElement) {
            pokemonDescriptionElement.textContent = pokemonDescriptions[nextImageIndex];
        }
        
        pokemonImage.style.animation = 'none';
        setTimeout(() => {
            pokemonImage.style.animation = 'pulse 0.5s ease';
        }, 10);
    }
}


// Эта функция проверяет доступность звукового генератора
function initSoundSystem() {
    // Проверяем, что GameSoundGenerator загружен
    if (typeof GameSoundGenerator === 'undefined') {
        console.warn('⚠️ Sound generator not loaded! Check script order in HTML');
        return false;
    }
    
    // Инициализируем звуковую систему
    GameSoundGenerator.init();
    
    // Активируем после первого клика пользователя
    document.addEventListener('click', function activateSound() {
        GameSoundGenerator.activate();
        document.removeEventListener('click', activateSound);
    }, { once: true });
    
    return true;
}

// Функция создания эффекта клика

function createClickEffect() {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = '+1';
    
    const rect = clickButton.getBoundingClientRect();
    effect.style.left = rect.left + rect.width / 2 + 'px';
    effect.style.top = rect.top + 'px';
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 1000);
}

function addPoints(points) {
    const newScore = parseInt(points);
    if (!isNaN(newScore) && newScore > 0) {
        score += newScore;
        updateDisplay();
        checkLevelUp();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен");
    
    clickButton.addEventListener('click', handleClick);
    
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            handleClick();
            
            clickButton.classList.add('active');
            setTimeout(() => clickButton.classList.remove('active'), 100);
        }
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        @keyframes slideDown {
            from { top: -100px; opacity: 0; }
            to { top: 20px; opacity: 1; }
        }
        @keyframes slideUp {
            from { top: 20px; opacity: 1; }
            to { top: -100px; opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    initializeGame();
    
    console.log("Готово! Для тестирования используйте команду cheat(число) в консоли");
});

window.cheat = function(points) {
    addPoints(points);
    console.log(`Добавлено ${points} очков! Текущий счет: ${score}`);
};

console.log("Pokemon Clicker Game загружен!");
console.log("Доступные команды в консоли:");
console.log("  cheat(число) - добавить очки");
console.log("  score - текущий счет (в консоли)");
Object.defineProperty(window, 'score', {
    get: function() { return score; },
    set: function(value) { 
        score = value; 
        updateDisplay();
        checkLevelUp();
    }
});