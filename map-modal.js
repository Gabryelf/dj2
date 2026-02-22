// ==============================
// МОДАЛЬНОЕ ОКНО КАРТЫ
// ==============================

class MapModal {
    constructor(game, locationSystem) {
        this.game = game;
        this.locationSystem = locationSystem;
        this.modal = null;
        this.mapCanvas = null;
        this.ctx = null;
        this.isOpen = false;
        this.timerInterval = null;
        
        this.createModal();
    }
    
    createModal() {
        // Создаем модальное окно карты
        this.modal = document.createElement('div');
        this.modal.id = 'map-modal';
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content map-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-map"></i> Карта региона Канто</h2>
                    <div class="location-info">
                        <span id="current-location-name">Паллет Таун</span>
                        <span id="travel-timer" class="travel-timer" style="display: none;">
                            <i class="fas fa-hourglass-half"></i>
                            <span id="timer-display">00:00</span>
                        </span>
                    </div>
                    <span class="close-map">&times;</span>
                </div>
                <div class="modal-body map-body">
                    <canvas id="map-canvas" width="800" height="600"></canvas>
                    <div id="map-legend" class="map-legend">
                        <div class="legend-item">
                            <span class="legend-dot current"></span> Текущая локация
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot available"></span> Доступно
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot locked"></span> Закрыто
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        // Кнопка закрытия
        const closeBtn = this.modal.querySelector('.close-map');
        closeBtn.addEventListener('click', () => this.hide());
        
        // Закрытие по клику вне модального окна
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
        
        // Инициализация canvas
        this.mapCanvas = document.getElementById('map-canvas');
        if (this.mapCanvas) {
            this.ctx = this.mapCanvas.getContext('2d');
            this.mapCanvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        }
    }
    
    show() {
        if (!this.modal) return;
        
        this.modal.style.display = 'flex';
        this.isOpen = true;
        
        this.drawMap();
        this.updateLocationInfo();
        this.startTimerUpdate();
    }
    
    hide() {
        if (!this.modal) return;
        
        this.modal.style.display = 'none';
        this.isOpen = false;
        this.stopTimerUpdate();
    }
    
    drawMap() {
        if (!this.ctx || !this.mapCanvas) return;
        
        const ctx = this.ctx;
        const canvas = this.mapCanvas;
        
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем фон карты
        ctx.fillStyle = '#1a5f3a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем сетку
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.stroke();
        }
        
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Рисуем дороги между локациями
        ctx.strokeStyle = '#8b6b4d';
        ctx.lineWidth = 4;
        
        Object.entries(this.locationSystem.locations).forEach(([id, loc]) => {
            const from = loc.position;
            
            loc.neighbors.forEach(neighborId => {
                const neighbor = this.locationSystem.locations[neighborId];
                if (neighbor) {
                    const to = neighbor.position;
                    
                    ctx.beginPath();
                    ctx.moveTo(from.x * 8, from.y * 6);
                    ctx.lineTo(to.x * 8, to.y * 6);
                    ctx.strokeStyle = '#8b6b4d';
                    ctx.stroke();
                    
                    // Пунктир для неоткрытых дорог
                    if (!this.locationSystem.availableLocations.includes(neighborId) && 
                        !this.locationSystem.availableLocations.includes(id)) {
                        ctx.strokeStyle = '#555';
                        ctx.setLineDash([5, 5]);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                }
            });
        });
        
        // Рисуем локации
        Object.entries(this.locationSystem.locations).forEach(([id, loc]) => {
            const x = loc.position.x * 8;
            const y = loc.position.y * 6;
            
            // Определяем статус локации
            let status = 'locked';
            let color = '#666';
            let radius = 8;
            
            if (id === this.locationSystem.currentLocation) {
                status = 'current';
                color = '#ffd700';
                radius = 12;
            } else if (this.locationSystem.availableLocations.includes(id)) {
                status = 'available';
                color = '#4caf50';
                radius = 10;
            }
            
            // Рисуем точку локации
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Если идет переход в эту локацию
            if (this.locationSystem.transitionInProgress && 
                this.locationSystem.transitionTarget === id) {
                ctx.beginPath();
                ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
                ctx.strokeStyle = '#ff9800';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            
            // Название локации
            ctx.font = 'bold 12px Inter, Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(loc.name, x, y - radius - 5);
            
            // Иконка локации
            ctx.font = '16px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(loc.icon, x + 15, y - 5);
        });
    }
    
    handleCanvasClick(e) {
        if (!this.mapCanvas) return;
        
        const rect = this.mapCanvas.getBoundingClientRect();
        const scaleX = this.mapCanvas.width / rect.width;
        const scaleY = this.mapCanvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // Проверяем, кликнули ли на локацию
        Object.entries(this.locationSystem.locations).forEach(([id, loc]) => {
            const locX = loc.position.x * 8;
            const locY = loc.position.y * 6;
            const distance = Math.sqrt((x - locX) ** 2 + (y - locY) ** 2);
            
            if (distance < 20) {
                this.handleLocationClick(id);
            }
        });
    }
    
    handleLocationClick(locationId) {
        const location = this.locationSystem.locations[locationId];
        
        if (!location) return;
        
        if (locationId === this.locationSystem.currentLocation) {
            this.game.showNotification(`Вы уже находитесь в ${location.name}`, 'info');
            return;
        }
        
        // Пытаемся начать переход
        const result = this.locationSystem.startTravel(locationId);
        
        if (result) {
            this.updateLocationInfo();
            this.startTimerUpdate();
            this.drawMap();
        }
    }
    
    updateLocationInfo() {
        const locationName = document.getElementById('current-location-name');
        const timer = document.getElementById('travel-timer');
        
        if (locationName) {
            const current = this.locationSystem.locations[this.locationSystem.currentLocation];
            locationName.textContent = current ? current.name : 'Неизвестно';
        }
        
        if (timer) {
            timer.style.display = this.locationSystem.transitionInProgress ? 'inline-flex' : 'none';
        }
    }
    
    startTimerUpdate() {
        this.stopTimerUpdate();
        
        if (this.locationSystem.transitionInProgress) {
            this.timerInterval = setInterval(() => {
                this.updateTimer();
            }, 100);
        }
    }
    
    stopTimerUpdate() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        if (!this.locationSystem.transitionEndTime) {
            this.stopTimerUpdate();
            return;
        }
        
        const now = Date.now();
        const remaining = Math.max(0, this.locationSystem.transitionEndTime - now);
        
        if (remaining <= 0) {
            this.stopTimerUpdate();
            return;
        }
        
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            const seconds = Math.floor(remaining / 1000);
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        this.updateLocationInfo();
    }
}

window.MapModal = MapModal;