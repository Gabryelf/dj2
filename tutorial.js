// ==============================
// УЛУЧШЕННЫЙ ТУТОРИАЛ С ПРАКТИЧЕСКИМИ ЗАДАНИЯМИ
// ==============================

class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.currentStep = 1;
        this.isTutorialActive = true;
        this.modal = document.getElementById('tutorial');
        this.highlightedElements = [];
        this.waitingForAction = false;
        this.actionCompleted = false;
        
        this.steps = {
            1: { 
                id: 'step-1', 
                next: 2,
                message: 'Привет, тренер! Добро пожаловать в мир покемонов! Сейчас я научу тебя основам игры.',
                action: null,
                highlight: null
            },
            2: { 
                id: 'step-2', 
                next: 3,
                message: 'Вот твой первый покебол! Кликни на него, чтобы получить своего первого покемона.',
                action: 'click-pokeball',
                highlight: '.pokeball-item[data-type="NORMAL"]',
                highlightText: 'Кликни сюда!'
            },
            3: { 
                id: 'step-3', 
                next: 4,
                message: 'Отлично! Ты получил покемона. Теперь давай посмотрим на твою коллекцию.',
                action: 'open-collection',
                highlight: '#collection-menu',
                highlightText: 'Открой коллекцию'
            },
            4: { 
                id: 'step-4', 
                next: 5,
                message: 'В коллекции ты можешь увидеть всех своих покемонов. А теперь добавь его в команду!',
                action: 'add-to-team',
                highlight: '.pokemon-card.selectable .add-to-team-btn',
                highlightText: 'Добавь в команду'
            },
            5: { 
                id: 'step-5', 
                next: 6,
                message: 'Покемон в команде! Ты можешь увидеть его внизу экрана. Кликни на него, чтобы открыть управление командой.',
                action: 'click-team-slot',
                highlight: '.team-slot:not(.empty)',
                highlightText: 'Кликни на покемона'
            },
            6: { 
                id: 'step-6', 
                next: 7,
                message: 'Здесь ты можешь менять команду. А теперь попробуй атаковать дикого покемона!',
                action: 'attack-enemy',
                highlight: '.enemy-card',
                highlightText: 'Атакуй!'
            },
            7: { 
                id: 'step-7', 
                next: 8,
                message: 'Отличная атака! После победы ты получаешь награду. А теперь давай посмотрим на карту.',
                action: 'open-map',
                highlight: '#map-menu',
                highlightText: 'Открой карту'
            },
            8: { 
                id: 'step-8', 
                next: 9,
                message: 'Это карта региона Канто. Ты находишься в Паллет Тауне. Кликни на соседнюю локацию, чтобы отправиться в путешествие!',
                action: 'travel-to-location',
                highlight: '.available-location',
                highlightText: 'Выбери локацию'
            },
            9: { 
                id: 'step-9', 
                next: null,
                message: 'Поздравляю! Ты освоил основы игры. Теперь исследуй мир, лови покемонов и становись лучшим тренером!',
                action: null,
                highlight: null
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
            return;
        }
        
        // Показываем первый шаг
        this.showStep(1);
        this.setupEventListeners();
    }
    
    showStep(stepNumber) {
        // Скрываем все шаги
        for (let i = 1; i <= 9; i++) {
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
        const step = this.steps[stepNumber];
        
        // Убираем предыдущие выделения
        this.clearHighlights();
        
        // Если есть элемент для выделения
        if (step && step.highlight) {
            this.highlightElement(step.highlight, step.highlightText);
        }
        
        // Если шаг требует действия, ждем его
        if (step && step.action) {
            this.waitingForAction = true;
            this.actionCompleted = false;
            this.setupActionListener(step.action);
        } else {
            this.waitingForAction = false;
        }
    }
    
    highlightElement(selector, text) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`⚠️ Элемент для выделения не найден: ${selector}`);
            return;
        }
        
        // Создаем подсветку
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        
        const rect = element.getBoundingClientRect();
        highlight.style.top = rect.top + 'px';
        highlight.style.left = rect.left + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
        
        // Добавляем текст
        const textEl = document.createElement('div');
        textEl.className = 'tutorial-highlight-text';
        textEl.textContent = text || 'Кликни сюда';
        textEl.style.top = (rect.top - 40) + 'px';
        textEl.style.left = rect.left + 'px';
        
        document.body.appendChild(highlight);
        document.body.appendChild(textEl);
        
        this.highlightedElements.push(highlight);
        this.highlightedElements.push(textEl);
        
        // Добавляем пульсирующую анимацию
        element.classList.add('tutorial-pulse');
        this.highlightedElements.push(element);
    }
    
    clearHighlights() {
        this.highlightedElements.forEach(el => {
            if (el && el.parentNode) {
                if (el.classList) {
                    el.classList.remove('tutorial-pulse');
                }
                el.parentNode.removeChild(el);
            }
        });
        this.highlightedElements = [];
    }
    
    setupActionListener(action) {
        switch(action) {
            case 'click-pokeball':
                this.waitForPokeballClick();
                break;
            case 'open-collection':
                this.waitForCollectionOpen();
                break;
            case 'add-to-team':
                this.waitForAddToTeam();
                break;
            case 'click-team-slot':
                this.waitForTeamSlotClick();
                break;
            case 'attack-enemy':
                this.waitForAttack();
                break;
            case 'open-map':
                this.waitForMapOpen();
                break;
            case 'travel-to-location':
                this.waitForTravel();
                break;
        }
    }
    
    waitForPokeballClick() {
        const handler = (e) => {
            const pokeball = e.target.closest('.pokeball-item');
            if (pokeball) {
                document.removeEventListener('click', handler);
                setTimeout(() => {
                    this.actionCompleted = true;
                    this.checkActionComplete();
                }, 2000); // Ждем анимацию открытия
            }
        };
        document.addEventListener('click', handler);
    }
    
    waitForCollectionOpen() {
        const handler = (e) => {
            const btn = e.target.closest('#collection-menu');
            if (btn) {
                document.removeEventListener('click', handler);
                this.actionCompleted = true;
                this.checkActionComplete();
            }
        };
        document.addEventListener('click', handler);
    }
    
    waitForAddToTeam() {
        const handler = (e) => {
            const btn = e.target.closest('.add-to-team-btn');
            if (btn) {
                document.removeEventListener('click', handler);
                setTimeout(() => {
                    this.actionCompleted = true;
                    this.checkActionComplete();
                }, 500);
            }
        };
        document.addEventListener('click', handler);
    }
    
    waitForTeamSlotClick() {
        const handler = (e) => {
            const slot = e.target.closest('.team-slot:not(.empty)');
            if (slot) {
                document.removeEventListener('click', handler);
                this.actionCompleted = true;
                this.checkActionComplete();
            }
        };
        document.addEventListener('click', handler);
    }
    
    waitForAttack() {
        const handler = (e) => {
            const enemy = e.target.closest('.enemy-card');
            if (enemy) {
                document.removeEventListener('click', handler);
                this.actionCompleted = true;
                this.checkActionComplete();
            }
        };
        document.addEventListener('click', handler);
    }
    
    waitForMapOpen() {
        const handler = (e) => {
            const btn = e.target.closest('#map-menu');
            if (btn) {
                document.removeEventListener('click', handler);
                this.actionCompleted = true;
                this.checkActionComplete();
            }
        };
        document.addEventListener('click', handler);
    }
    
    waitForTravel() {
        // Ждем клика на локацию на карте
        const handler = (e) => {
            const canvas = e.target.closest('#map-canvas');
            if (canvas) {
                // Проверяем, кликнули ли на доступную локацию
                setTimeout(() => {
                    if (this.game.locationSystem.transitionInProgress) {
                        document.removeEventListener('click', handler);
                        this.actionCompleted = true;
                        this.checkActionComplete();
                    }
                }, 500);
            }
        };
        document.addEventListener('click', handler);
    }
    
    checkActionComplete() {
        if (this.actionCompleted && this.waitingForAction) {
            this.waitingForAction = false;
            this.nextStep();
        }
    }
    
    setupEventListeners() {
        // Кнопки в туториале
        const nextBtns = document.querySelectorAll('.next-btn');
        const finishBtns = document.querySelectorAll('.finish-btn');
        
        this.nextStepHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const step = this.steps[this.currentStep];
            
            // Если шаг требует действия и оно не выполнено
            if (step && step.action && !this.actionCompleted) {
                this.game.showNotification('Сначала выполни задание!', 'warning');
                return;
            }
            
            this.nextStep();
        };
        
        this.finishHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.finishTutorial();
        };
        
        nextBtns.forEach(btn => {
            btn.removeEventListener('click', this.nextStepHandler);
            btn.addEventListener('click', this.nextStepHandler);
        });
        
        finishBtns.forEach(btn => {
            btn.removeEventListener('click', this.finishHandler);
            btn.addEventListener('click', this.finishHandler);
        });
    }
    
    nextStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;
        
        console.log('Tutorial: переход с шага', this.currentStep, 'на шаг', step.next);
        
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
        
        this.clearHighlights();
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

// Добавляем стили для туториала
const tutorialStyles = document.createElement('style');
tutorialStyles.textContent = `
    .tutorial-highlight {
        position: fixed;
        border: 4px solid var(--accent-warning);
        border-radius: 8px;
        box-shadow: 0 0 30px rgba(253, 203, 110, 0.5);
        pointer-events: none;
        z-index: 10001;
        animation: tutorialPulse 1.5s ease-in-out infinite;
    }
    
    .tutorial-highlight-text {
        position: fixed;
        background: var(--accent-warning);
        color: var(--bg-primary);
        padding: 8px 16px;
        border-radius: 100px;
        font-weight: 600;
        font-size: 0.9rem;
        pointer-events: none;
        z-index: 10001;
        white-space: nowrap;
        animation: tutorialTextPulse 1.5s ease-in-out infinite;
    }
    
    .tutorial-pulse {
        animation: elementPulse 1.5s ease-in-out infinite !important;
    }
    
    @keyframes tutorialPulse {
        0%, 100% {
            border-color: var(--accent-warning);
            box-shadow: 0 0 30px rgba(253, 203, 110, 0.5);
        }
        50% {
            border-color: #ffaa00;
            box-shadow: 0 0 50px rgba(255, 170, 0, 0.8);
        }
    }
    
    @keyframes tutorialTextPulse {
        0%, 100% {
            transform: scale(1);
            background: var(--accent-warning);
        }
        50% {
            transform: scale(1.05);
            background: #ffaa00;
        }
    }
    
    @keyframes elementPulse {
        0%, 100% {
            filter: brightness(1);
        }
        50% {
            filter: brightness(1.2);
        }
    }
`;
document.head.appendChild(tutorialStyles);

window.TutorialSystem = TutorialSystem;