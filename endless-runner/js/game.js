class Game {
    constructor() {
        // Initialize canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Game state
        this.isRunning = false;
        this.lastTime = 0;
        this.gameManager = null;

        // Asset loading state
        this.assetsLoaded = false;
        this.assetLoadErrors = [];

        // Bind event listeners
        this.bindEvents();
    }

    bindEvents() {
        // Handle start button click
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', () => {
                if (this.gameManager) {
                    this.startGame();
                }
            });
        }

        // Handle restart button click
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                if (this.gameManager) {
                    this.restartGame();
                }
            });
        }
    }

    async loadAssets() {
        try {
            const assetPaths = [
                'assets/images/orc.png',
                'assets/images/vegetable_carrot.png',
                'assets/images/vegetable_broccoli.png',
                'assets/images/boss.png',
                'assets/images/item_hp.png',
                'assets/images/item_attack.png',
                'assets/images/background.png',
                'assets/images/middleground.png',
                'assets/images/foreground.png'
            ];

            const loadPromises = assetPaths.map(path => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(path);
                    img.onerror = () => {
                        console.warn(`Failed to load asset: ${path}`);
                        this.assetLoadErrors.push(path);
                        resolve(path); // Resolve anyway to continue game
                    };
                    img.src = path;
                });
            });

            await Promise.all(loadPromises);
            this.assetsLoaded = true;
            console.log('All assets loaded');

        } catch (error) {
            console.error('Error loading assets:', error);
            this.assetsLoaded = true; // Continue anyway with fallback sprites
        }
    }

    async initialize() {
        try {
            // Show loading message
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '24px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);

            // Load assets
            await this.loadAssets();

            // Initialize game manager
            this.gameManager = new GameManager(this.canvas);

            // Show start screen
            const startScreen = document.getElementById('startScreen');
            if (startScreen) {
                startScreen.classList.remove('hidden');
            }

            console.log('Game initialized successfully');

        } catch (error) {
            console.error('Error initializing game:', error);
            this.showErrorScreen('Failed to initialize game. Please refresh the page.');
        }
    }

    startGame() {
        // Hide start screen
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.add('hidden');
        }

        // Show HUD
        const gameHUD = document.getElementById('gameHUD');
        if (gameHUD) {
            gameHUD.classList.remove('hidden');
        }

        // Start game loop
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        try {
            // Calculate delta time
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw game
            if (this.gameManager) {
                this.gameManager.update(deltaTime);
                this.gameManager.draw();
            }

            // Continue game loop
            requestAnimationFrame((time) => this.gameLoop(time));

        } catch (error) {
            console.error('Error in game loop:', error);
            this.handleGameError();
        }
    }

    restartGame() {
        if (this.gameManager) {
            this.gameManager.restartGame();
        }

        // Hide game over screen
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }

        // Show HUD
        const gameHUD = document.getElementById('gameHUD');
        if (gameHUD) {
            gameHUD.classList.remove('hidden');
        }

        // Restart game loop
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    handleGameError() {
        console.error('A critical error occurred. Attempting to restart game...');
        this.restartGame();
    }

    showErrorScreen(message) {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = '24px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Error', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px "Press Start 2P"';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
    }
}
