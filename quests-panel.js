// ==============================
// ПАНЕЛЬ КВЕСТОВ В ЛОКАЦИЯХ
// ==============================

class QuestsPanel {
    constructor(game, locationSystem) {
        this.game = game;
        this.locationSystem = locationSystem;
        this.panel = null;
        this.isOpen = false;
        
        this.createPanel();
    }
    
    createPanel() {
        // Создаем панель квестов
        this.panel = document.createElement('div');
        this.panel.id = 'quests-panel';
        this.panel.className = 'quests-panel';
        this.panel.innerHTML = `
            <div class="quests-header">
                <h3><i class="fas fa-scroll"></i> Задания в локации</h3>
                <span class="close-quests">&times;</span>
            </div>
            <div class="quests-content" id="quests-content">
                <!-- Квесты загружаются динамически -->
            </div>
            <div class="quests-footer">
                <div class="reset-info">
                    <i class="fas fa-clock"></i>
                    <span>Обновляются каждый день</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
        
        // Кнопка закрытия
        const closeBtn = this.panel.querySelector('.close-quests');
        closeBtn.addEventListener('click', () => this.hide());
        
        // Создаем кнопку для открытия панели в локации
        this.createQuestButton();
    }
    
    createQuestButton() {
        // Добавляем кнопку квеста в интерфейс
        const enemyCard = document.querySelector('.enemy-card');
        if (enemyCard) {
            const questBtn = document.createElement('div');
            questBtn.className = 'quest-button';
            questBtn.innerHTML = `
                <i class="fas fa-scroll"></i>
                <span>Задания</span>
            `;
            questBtn.addEventListener('click', () => this.toggle());
            enemyCard.appendChild(questBtn);
        }
    }
    
    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    show() {
        if (!this.panel) return;
        
        this.panel.classList.add('open');
        this.isOpen = true;
        this.updateQuests();
    }
    
    hide() {
        if (!this.panel) return;
        
        this.panel.classList.remove('open');
        this.isOpen = false;
    }
    
    updateQuests() {
        const content = document.getElementById('quests-content');
        if (!content) return;
        
        const quests = this.locationSystem.getCurrentQuests();
        const location = this.locationSystem.locations[this.locationSystem.currentLocation];
        
        let html = `<div class="location-name">${location.name} ${location.icon}</div>`;
        
        if (quests.length === 0) {
            html += '<div class="no-quests">Нет заданий в этой локации</div>';
        } else {
            quests.forEach(quest => {
                const progressPercent = (quest.progress / quest.target) * 100;
                
                html += `
                    <div class="quest-item ${quest.completed ? 'completed' : ''} ${quest.claimed ? 'claimed' : ''}">
                        <div class="quest-header">
                            <h4>${quest.name}</h4>
                            <span class="quest-reward"><i class="fas fa-coins"></i> ${quest.reward}</span>
                        </div>
                        <p class="quest-description">${quest.description}</p>
                        <div class="quest-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <div class="progress-text">
                                ${quest.progress}/${quest.target}
                            </div>
                        </div>
                        ${quest.completed && !quest.claimed ? 
                            `<button class="claim-reward-btn" data-quest-id="${quest.id}">
                                <i class="fas fa-gift"></i> Получить награду
                            </button>` : 
                            quest.claimed ? 
                                '<span class="claimed-badge"><i class="fas fa-check"></i> Награда получена</span>' : 
                                ''
                        }
                    </div>
                `;
            });
        }
        
        content.innerHTML = html;
        
        // Добавляем обработчики для кнопок получения награды
        content.querySelectorAll('.claim-reward-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questId = e.currentTarget.dataset.questId;
                this.locationSystem.claimQuestReward(questId);
                this.updateQuests();
            });
        });
    }
}

window.QuestsPanel = QuestsPanel;