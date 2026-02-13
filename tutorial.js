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
                message: 'Для начала получи своего первого покемона!'
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
                message: 'Теперь готовься к битве!'
            }
        };
        
        this.init();
    }
    
    init() {
        if (!this.modal) return;
        
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
        }
        
        this.currentStep = stepNumber;
    }
    
    setupEventListeners() {
        // Удаляем старые обработчики, если они были
        const oldNextBtn = document.querySelector('.next-btn');
        const oldFinishBtn = document.querySelector('.finish-btn');
        
        if (oldNextBtn) {
            oldNextBtn.removeEventListener('click', this.nextStepHandler);
            oldFinishBtn.removeEventListener('click', this.finishHandler);
        }
        
        // Создаем новые обработчики с правильным контекстом
        this.nextStepHandler = (e) => {
            e.preventDefault();
            this.nextStep();
        };
        
        this.finishHandler = (e) => {
            e.preventDefault();
            this.finishTutorial();
        };
        
        // Назначаем обработчики на все кнопки next и finish
        const nextBtns = document.querySelectorAll('.next-btn');
        nextBtns.forEach(btn => {
            btn.addEventListener('click', this.nextStepHandler);
        });
        
        const finishBtns = document.querySelectorAll('.finish-btn');
        finishBtns.forEach(btn => {
            btn.addEventListener('click', this.finishHandler);
        });
    }
    
    nextStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;
        
        console.log('Tutorial: переход с шага', this.currentStep, 'на шаг', step.next);
        
        // Выполняем действия в зависимости от шага
        switch(this.currentStep) {
            case 1: // Начать обучение
                // Просто переходим к следующему шагу
                break;
                
            case 2: // Открыть покебол
                // Открываем модальное окно с покеболами
                if (this.game && this.game.uiManager) {
                    this.game.uiManager.showModal('pokeball');
                }
                break;
                
            case 3: // Посмотреть коллекцию
                if (this.game && this.game.uiManager) {
                    this.game.uiManager.showModal('collection');
                }
                break;
                
            case 4: // Выбрать команду
                if (this.game && this.game.uiManager) {
                    this.game.uiManager.showModal('team');
                }
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
        
        // Разблокируем кнопку атаки
        const attackButton = document.getElementById('attack-button');
        if (attackButton) {
            attackButton.disabled = false;
        }
        
        // Добавляем стартового покемона, если его нет
        if (this.game && this.game.pokemonManager.collection.length === 0) {
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

window.TutorialSystem = TutorialSystem;