// ==============================
// tutorial.js
// ==============================

class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.currentStep = 1;
        this.isTutorialActive = true;
        this.modal = document.getElementById('tutorial');
        
        this.steps = {
            1: { 
                id: 'step-1', 
                next: 2,
                message: 'Привет, тренер! Сейчас я покажу тебе, как играть.'
            },
            2: { 
                id: 'step-2', 
                next: 3,
                message: 'Для начала получи своего первого покемона! Кликни на красный покебол вверху.'
            },
            3: { 
                id: 'step-3', 
                next: 4,
                message: 'Отличная работа! Теперь посмотри свою коллекцию.'
            },
            4: { 
                id: 'step-4', 
                next: 5,
                message: 'Выбери покемона для битвы!'
            },
            5: { 
                id: 'step-5', 
                next: null,
                message: 'Теперь готовься к битве! Кликай по врагу, чтобы атаковать.'
            }
        };
        
        // Проверяем наличие модального окна
        if (!this.modal) {
            console.error('❌ Модальное окно туториала не найдено');
            return;
        }
        
        this.init();
    }
    
    init() {
        // Проверяем, проходил ли уже туториал
        const completed = localStorage.getItem('pokemon_tutorial_completed');
        if (completed) {
            this.modal.style.display = 'none';
            this.isTutorialActive = false;
            // Разблокируем кнопку атаки
            const attackButton = document.getElementById('attack-button');
            if (attackButton) attackButton.disabled = false;
            return;
        }
        
        // Показываем первый шаг
        this.showStep(1);
        this.setupEventListeners();
    }
    
    showStep(stepNumber) {
        // Скрываем все шаги
        for (let i = 1; i <= 5; i++) {
            const stepEl = document.getElementById(`step-${i}`);
            if (stepEl) {
                stepEl.classList.remove('active');
            }
        }
        
        // Показываем нужный шаг
        const currentStep = document.getElementById(`step-${stepNumber}`);
        if (currentStep) {
            currentStep.classList.add('active');
        } else {
            console.error(`❌ Шаг ${stepNumber} не найден`);
        }
        
        this.currentStep = stepNumber;
    }
    
    setupEventListeners() {
        // Удаляем старые обработчики
        const nextBtns = document.querySelectorAll('.next-btn');
        const finishBtns = document.querySelectorAll('.finish-btn');
        
        // Создаем новые обработчики с правильным контекстом
        this.nextStepHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.nextStep();
        };
        
        this.finishHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.finishTutorial();
        };
        
        // Назначаем обработчики на все кнопки next
        nextBtns.forEach(btn => {
            btn.removeEventListener('click', this.nextStepHandler);
            btn.addEventListener('click', this.nextStepHandler);
        });
        
        // Назначаем обработчики на все кнопки finish
        finishBtns.forEach(btn => {
            btn.removeEventListener('click', this.finishHandler);
            btn.addEventListener('click', this.finishHandler);
        });
    }
    
    nextStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;
        
        console.log('Tutorial: переход с шага', this.currentStep, 'на шаг', step.next);
        
        // Выполняем действия в зависимости от шага
        switch(this.currentStep) {
            case 2: // Открыть покебол
                // Даем инструкцию, но не открываем автоматически
                this.game.showNotification('Кликни на красный покебол вверху!', 'info');
                break;
                
            case 3: // Посмотреть коллекцию
                setTimeout(() => {
                    if (this.game && this.game.uiManager) {
                        this.game.uiManager.showModal('collection');
                    }
                }, 500);
                break;
                
            case 4: // Выбрать команду
                setTimeout(() => {
                    if (this.game && this.game.uiManager) {
                        this.game.uiManager.showModal('team');
                    }
                }, 500);
                break;
        }
        
        // Переходим к следующему шагу
        if (step.next) {
            this.showStep(step.next);
        }
    }
    
    finishTutorial() {
        console.log('Tutorial: завершение обучения');
        
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        
        this.isTutorialActive = false;
        localStorage.setItem('pokemon_tutorial_completed', 'true');
        
        // Добавляем стартового покемона, если его нет
        if (this.game && this.game.pokemonManager && this.game.pokemonManager.collection.length === 0) {
            this.game.addStarterPokemon();
        }
        
        // Обновляем UI
        if (this.game && this.game.uiManager) {
            this.game.uiManager.updateUI();
        }
        
        // Показываем приветственное сообщение
        if (this.game && this.game.showNotification) {
            this.game.showNotification('Добро пожаловать в мир покемонов!', 'success');
        }
    }
}

// Экспортируем в глобальную область
window.TutorialSystem = TutorialSystem;