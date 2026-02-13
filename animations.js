// ==============================
// animations.js
// ==============================

class AnimationManager {
    initCSSAnimations() {
        // Добавляем стили для анимаций, если их нет в CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes damageFloat {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
            }
            
            @keyframes enemyDamage {
                0% { filter: brightness(1); }
                50% { filter: brightness(1.5); background: rgba(255, 0, 0, 0.3); }
                100% { filter: brightness(1); }
            }
            
            .damage-number {
                position: fixed;
                font-size: 24px;
                font-weight: bold;
                pointer-events: none;
                z-index: 1000;
                animation: damageFloat 1s ease-out forwards;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            }
            
            .damage-number.critical {
                font-size: 32px;
                color: #ff4444;
                text-shadow: 0 0 10px #ff0000;
            }
            
            .enemy-damage-effect {
                animation: enemyDamage 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
    
    createDamageEffect(damage, x, y, isCritical = false) {
        const div = document.createElement('div');
        div.className = `damage-number ${isCritical ? 'critical' : ''}`;
        div.textContent = `-${damage}`;
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        
        document.body.appendChild(div);
        
        setTimeout(() => {
            if (div.parentNode) {
                div.parentNode.removeChild(div);
            }
        }, 1000);
    }
    
    animateEnemyChange(oldEnemy, newEnemy) {
        const enemyContainer = document.querySelector('.enemy-card');
        if (enemyContainer) {
            enemyContainer.classList.add('enemy-damage-effect');
            setTimeout(() => {
                enemyContainer.classList.remove('enemy-damage-effect');
            }, 300);
        }
    }
}

window.AnimationManager = AnimationManager;