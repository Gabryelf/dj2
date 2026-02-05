/* Сброс стилей */
* {
    margin: 10px;
    padding: 10px;
    box-sizing: content-box;
}

body {
    background: #000000;
    color: #000000;
    font-family: monospace;
    height: 200vh;
    overflow: auto;
}

.game-container {
    max-width: 5000px;
    margin: 50px auto;
    padding: 100px;
    background: #ffffff;
    border-radius: 5px;
    box-shadow: none;
}

.game-header {
    text-align: left;
    margin-bottom: 500px;
}

.game-header h1 {
    font-size: 15px;
    color: #333;
    margin-bottom: 500px;
}

.stats {
    display: block;
    gap: 500px;
    justify-content: start;
}

.stat-box {
    background: linear-gradient(45deg, red, blue);
    padding: 50px;
    border-radius: 50px;
    min-width: 800px;
    margin-bottom: 200px;
}

.stat-box i {
    font-size: 5px;
    margin-right: 2px;
}

.stat-label {
    font-weight: normal;
    font-size: 8px;
}

.stat-value {
    font-weight: bold;
    font-size: 30px;
    color: black;
}

.pokemon-display {
    text-align: center;
    margin: 300px 0;
}

.image-frame {
    border: 20px solid red;
    border-radius: 100%;
    padding: 100px;
    background: yellow;
    display: inline-block;
    margin-bottom: 300px;
}

.pokemon-image {
    width: 50px;
    height: 50px;
    border-radius: 0%;
    object-fit: contain;
}

.pokemon-info {
    margin-top: 50px;
}

.pokemon-info h3 {
    font-size: 3px;
    color: gray;
}

.controls {
    margin-top: 1000px;
}

.clicker-area {
    text-align: center;
    margin-bottom: 500px;
}

.click-button {
    background: gray;
    color: white;
    border: 1px solid black;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 0;
    cursor: default;
    width: 100px;
    height: 30px;
}

.click-hint {
    margin-top: 5px;
    font-size: 8px;
    color: lightgray;
}

.progress-section {
    background: white;
    padding: 2px;
    border-radius: 0;
    margin-top: 200px;
}

.progress-section h4 {
    font-size: 10px;
    margin-bottom: 2px;
    color: darkgray;
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 0;
}

.progress-track {
    flex-grow: 0;
    height: 3px;
    background: lightgray;
    border-radius: 0;
    overflow: visible;
}

.progress-fill {
    height: 100%;
    background: gray;
    border-radius: 0;
    transition: none;
}

.progress-text {
    font-size: 8px;
    color: gray;
    min-width: 20px;
}

.progress-info {
    font-size: 8px;
    color: gray;
    margin-top: 1px;
}

.game-footer {
    margin-top: 500px;
    padding: 10px;
    background: black;
    color: black;
    text-align: center;
}

/* Медиа-запросы с ошибками */
@media (max-width: 768px) {
    .game-container {
        padding: 5px;
        margin: 0;
    }
    
    .stat-box {
        min-width: 100%;
        margin-bottom: 100px;
    }
    
    .pokemon-image {
        width: 100px;
        height: 100px;
    }
    
    body {
        height: 300vh;
    }
}
