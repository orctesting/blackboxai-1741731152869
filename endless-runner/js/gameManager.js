class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Game state
        this.gameState = 'start'; // start, playing, levelUp, gameOver
        this.score = 0;
        this.enemiesDefeated = 0;
        this.lastTime = 0;
        this.animationFrameId = null;

        // Initialize game objects
        this.player = new Player(canvas);
        this.enemySpawner = new EnemySpawner(canvas);
        this.levelUpMenu = new LevelUpMenu(canvas, this.player);
        
        // Game object collections
        this.enemies = [];
        this.items = [];
        this.boss = null;

        // Boss fight state
        this.bossDefeated = true;  // Start true so first boss spawns after 10 enemies
        this.bossSpawnDelay = 2000;  // 2 seconds delay before boss spawn
        this.bossSpawnTimer = 0;

        // Background parallax
        this.backgrounds = this.initializeBackgrounds();

        // Event listeners
        this.bindEvents();
    }

    initializeBackgrounds() {
        const layers = [
            { src: 'assets/images/background.png', speed: 1 },
            { src: 'assets/images/middleground.png', speed: 2 },
            { src: 'assets/images/foreground.png', speed: 3 }
        ];

        return layers.map(layer => {
            const img = new Image();
            img.src = layer.src;
            return {
                image: img,
                x1: 0,
                x2: this.canvas.width,
                speed: layer.speed,
                width: this.canvas.width
            };
        });
    }

    bindEvents() {
        // Start game button
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        // Restart game button
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });

        // Space bar for jump
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameState === 'playing') {
                this.player.jump();
            }
        });
    }

    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameHUD').classList.remove('hidden');
        this.animate(0);
    }

    restartGame() {
        // Reset game state
        this.score = 0;
        this.enemiesDefeated = 0;
        this.enemies = [];
        this.items = [];
        this.boss = null;
        this.bossDefeated = true;
        this.bossSpawnTimer = 0;

        // Reset player
        this.player.reset();

        // Hide game over screen
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        // Start new game
        this.gameState = 'playing';
        this.animate(0);
    }

    animate(currentTime) {
        try {
            // Calculate delta time
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw based on game state
            switch (this.gameState) {
                case 'playing':
                    this.updateGame(deltaTime);
                    this.drawGame();
                    break;
                case 'levelUp':
                    this.drawGame();  // Draw game state in background
                    this.levelUpMenu.update();
                    this.levelUpMenu.draw();
                    break;
            }

            // Update HUD
            this.updateHUD();

            // Continue animation loop
            this.animationFrameId = requestAnimationFrame((time) => this.animate(time));

        } catch (error) {
            console.error('Error in game loop:', error);
            this.handleGameError();
        }
    }

    updateGame(deltaTime) {
        // Update backgrounds
        this.updateBackgrounds(deltaTime);

        // Update player
        this.player.update(deltaTime);

        // Spawn and update enemies
        this.updateEnemies(deltaTime);

        // Update items
        this.updateItems(deltaTime);

        // Update boss if present
        this.updateBoss(deltaTime);

        // Check collisions
        this.checkCollisions();

        // Check for level up
        this.checkLevelUp();
    }

    updateBackgrounds(deltaTime) {
        this.backgrounds.forEach(bg => {
            // Move background layers
            bg.x1 -= bg.speed;
            bg.x2 -= bg.speed;

            // Reset positions when off screen
            if (bg.x1 <= -bg.width) bg.x1 = bg.width;
            if (bg.x2 <= -bg.width) bg.x2 = bg.width;
        });
    }

    updateEnemies(deltaTime) {
            // Spawn new enemies if no boss is present
            if (!this.boss && this.enemySpawner.update(deltaTime)) {
                const enemyType = this.enemySpawner.getEnemyType();
                const enemy = new Enemy(this.canvas, enemyType);
                
                // Add some vertical variation to spawn position
                if (Math.random() < 0.3) {  // 30% chance to spawn higher
                    enemy.y -= Math.random() * 50 + 50;  // Jump 50-100px
                }
                
                this.enemies.push(enemy);
            }

        // Update existing enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(deltaTime);
            return !enemy.isOffscreen();
        });
    }

    updateItems(deltaTime) {
        this.items = this.items.filter(item => {
            item.update(deltaTime);
            return !item.isExpired();
        });
    }

    updateBoss(deltaTime) {
        if (this.boss) {
            this.boss.update(deltaTime, this.player.x, this.player.y);
        } else if (!this.bossDefeated && this.enemies.length === 0) {
            // Start boss spawn timer
            this.bossSpawnTimer += deltaTime;
            if (this.bossSpawnTimer >= this.bossSpawnDelay) {
                this.spawnBoss();
            }
        }
    }

    spawnBoss() {
        this.boss = new Boss(this.canvas, this.player.level);
        this.bossSpawnTimer = 0;
    }

    checkCollisions() {
        const playerHitbox = this.player.getHitbox();

        // Check enemy collisions
        this.enemies.forEach(enemy => {
            if (Collision.checkCollision(playerHitbox, enemy.getHitbox())) {
                if (this.player.takeDamage(enemy.damage)) {
                    // Player took damage
                    this.checkGameOver();
                }
            }
        });

        // Check boss collision
        if (this.boss && Collision.checkCollision(playerHitbox, this.boss.getHitbox())) {
            if (this.player.takeDamage(this.boss.damage)) {
                this.checkGameOver();
            }
        }

        // Check item collisions
        this.items = this.items.filter(item => {
            if (Collision.checkCollision(playerHitbox, item.getHitbox())) {
                item.applyEffect(this.player);
                return false;  // Remove collected item
            }
            return true;
        });
    }

    checkLevelUp() {
        if (this.enemiesDefeated >= 10 && this.bossDefeated) {
            this.bossDefeated = false;
            this.enemiesDefeated = 0;
            this.gameState = 'levelUp';
            this.levelUpMenu.show();
        }
    }

    checkGameOver() {
        if (this.player.hp <= 0) {
            this.gameState = 'gameOver';
            document.getElementById('finalScore').textContent = this.score;
            document.getElementById('gameOverScreen').classList.remove('hidden');
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    drawGame() {
        // Draw backgrounds
        this.drawBackgrounds();

        // Draw items
        this.items.forEach(item => item.draw());

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw());

        // Draw boss if present
        if (this.boss) {
            this.boss.draw();
        }

        // Draw player
        this.player.draw();
    }

    drawBackgrounds() {
        this.backgrounds.forEach(bg => {
            if (bg.image.complete) {  // Check if image is loaded
                this.ctx.drawImage(bg.image, bg.x1, 0, bg.width, this.canvas.height);
                this.ctx.drawImage(bg.image, bg.x2, 0, bg.width, this.canvas.height);
            }
        });
    }

    updateHUD() {
        // Update score and level display
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('levelDisplay').textContent = this.player.level;
        document.getElementById('hpDisplay').textContent = this.player.hp;
        document.getElementById('attackDisplay').textContent = this.player.attack;

        // Update power-up indicators
        this.updatePowerUpIndicators();
    }

    updatePowerUpIndicators() {
        // Remove existing indicators
        const existingIndicators = document.querySelectorAll('.power-up-indicator');
        existingIndicators.forEach(indicator => indicator.remove());

        // Create container if it doesn't exist
        let container = document.getElementById('powerUpIndicators');
        if (!container) {
            container = document.createElement('div');
            container.id = 'powerUpIndicators';
            container.style.position = 'fixed';
            container.style.top = '120px';
            container.style.left = '20px';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '5px';
            document.body.appendChild(container);
        }

        // Add indicator for each active effect
        if (this.player.hasEffect('attack')) {
            this.createPowerUpIndicator('Attack Boost', '#f1c40f', container);
        }
        if (this.player.hasEffect('speed')) {
            this.createPowerUpIndicator('Speed Boost', '#3498db', container);
        }
        if (this.player.hasEffect('mega')) {
            this.createPowerUpIndicator('MEGA POWER', '#9b59b6', container);
        }
    }

    createPowerUpIndicator(text, color, container) {
        const indicator = document.createElement('div');
        indicator.className = 'power-up-indicator';
        indicator.style.backgroundColor = color;
        indicator.style.color = 'white';
        indicator.style.padding = '5px 10px';
        indicator.style.borderRadius = '5px';
        indicator.style.fontFamily = '"Press Start 2P", cursive';
        indicator.style.fontSize = '12px';
        indicator.style.opacity = '0.8';
        indicator.style.animation = 'pulse 2s infinite';
        indicator.textContent = text;

        // Add pulse animation style if not already added
        if (!document.getElementById('powerUpAnimations')) {
            const style = document.createElement('style');
            style.id = 'powerUpAnimations';
            style.textContent = `
                @keyframes pulse {
                    0% { opacity: 0.8; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                    100% { opacity: 0.8; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(indicator);
    }

    handleGameError() {
        console.error('A critical error occurred. Attempting to restart game...');
        this.restartGame();
    }

    // Public methods for game state management
    onEnemyDefeated(enemy) {
        // Update score and counter
        this.score += enemy.points;
        this.enemiesDefeated++;
        
        // Update score display immediately
        document.getElementById('scoreDisplay').textContent = this.score;

        // Spawn item with position adjustment
        if (enemy.onDeath()) {
            const itemY = enemy.y + (enemy.height / 2);  // Center of enemy
            this.items.push(new Item(this.canvas, enemy.x, itemY));
        }

        // Check for level up
        if (this.enemiesDefeated >= 10 && this.bossDefeated) {
            this.bossDefeated = false;
            this.enemiesDefeated = 0;
            this.gameState = 'levelUp';
            this.levelUpMenu.show();
        }
    }

    onBossDefeated() {
        // Update score
        this.score += this.boss.points * this.player.level;  // Scale boss points with level
        document.getElementById('scoreDisplay').textContent = this.score;

        // Clear boss and update state
        this.boss = null;
        this.bossDefeated = true;

        // Spawn multiple items as boss reward
        const numItems = Math.min(3 + Math.floor(Math.random() * 3), 5);  // 3-5 items
        for (let i = 0; i < numItems; i++) {
            const offsetX = (i - numItems/2) * 50;  // Spread items horizontally
            const itemX = this.canvas.width/2 + offsetX;
            const itemY = this.canvas.height - 150;  // Above ground
            this.items.push(new Item(this.canvas, itemX, itemY));
        }
    }

    onLevelUpComplete() {
        this.gameState = 'playing';
        this.enemySpawner.adjustDifficulty(this.player.level);
    }
}
