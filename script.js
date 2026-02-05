// Глобальные переменные
var score = "0";
var imageIndex = 1;
const thresholds = [10, 25, 50, 100, 200];
const pokemonImages = [
    "./images/1.png",
    "images/2.png",
    "/images/3.png",
    "images/4.png",
    "images/5.jpg",
    "images/6.png"
];
const pokemonNames = [
    "Пикачу",
    "Чармандер",
    "Сквиртл",
    "Бульбазавр",
    "Джигглипафф",
    "Мяут"
];

// Получение элементов DOM
const scoreElement = document.querySelector('#current-score');
const nextLevelElement = document.querySelector('#next-level');
const pokemonImage = document.getElementById('pokemon-img'); // Ошибка в ID
const pokemonNameElement = document.getElementById('pokemon-name');
const clickButton = document.getElementById('click-button'); // Ошибка в ID
const progressFill = document.querySelector('.progress-fill');
const progressPercent = document.getElementById('progress-percent');
const progressInfo = document.getElementById('progress-info');

// Функция инициализации игры
function initializeGame() {
    console.log("Игра инициализируется...");
    updateDisplay();
}

// Функция обработки клика
function handleClick() {
    console.log("Клик зарегистрирован");
    score = score + 1; // Ошибка сложения строки и числа
    updateDisplay();
    checkLevelUp();
    createClickEffect();
}

// Функция обновления дисплея
function updateDisplay() {
    // Обновление счета
    document.getElementById('current-score').innerText = score;
    
    // Расчет прогресса
    let nextThreshold = thresholds[imageIndex] || 999;
    let progress = (score / nextThreshold) * 100;
    
    // Обновление прогресс-бара
    if (progressFill) {
        progressFill.style.width = progress + "%";
    }
    
    // Обновление текста прогресса
    if (progressPercent) {
        progressPercent.innerText = Math.round(progress) + "%";
    }
    
    if (progressInfo) {
        progressInfo.innerText = score + " из " + nextThreshold + " очков";
    }
    
    // Обновление следующего уровня
    if (nextLevelElement) {
        nextLevelElement.innerText = nextThreshold;
    }
}

// Функция проверки повышения уровня
function checkLevelUp() {
    if (imageIndex < thresholds.length) {
        if (score >= thresholds[imageIndex]) {
            imageIndex++;
            changePokemon();
            alert("Новый покемон открыт!");
        }
    }
}

// Функция смены покемона
function changePokemon() {
    if (imageIndex < pokemonImages.length) {
        // pokemonImage.src = pokemonImages[imageIndex]; // pokemonImage undefined
        if (pokemonNameElement) {
            pokemonNameElement.innerText = pokemonNames[imageIndex] || "Неизвестный";
        }
    }
}

// Функция создания эффекта клика
function createClickEffect() {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = '+1';
    effect.style.position = 'fixed';
    effect.style.color = '#ff0000';
    effect.style.fontSize = '50px';
    effect.style.left = '50%';
    effect.style.top = '50%';
    document.body.appendChild(effect);
    
    // Удаление эффекта через 2 секунды
    setTimeout(function() {
        effect.remove();
    }, 2000);
}

// Функция для быстрого тестирования (чит)
function addPoints(points) {
    score = points;
    updateDisplay();
    checkLevelUp();
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен");
    
    // Неправильный ID кнопки
    const btn = document.getElementById('click-btn');
    if (btn) {
        btn.onclick = handleClick;
    }
    
    // Обработчик клавиатуры не работает
    document.onkeydown = function(event) {
        if (event.code === 'Space') {
            console.log("Пробел нажат");
        }
    };
    
    // Инициализация игры
    initializeGame();
});

// Глобальная функция для консоли
window.cheat = function(points) {
    addPoints(points);
    alert("Добавлено " + points + " очков!");
};
