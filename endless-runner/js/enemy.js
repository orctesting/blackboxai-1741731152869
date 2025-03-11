class Enemy {
    constructor(canvas, type = 'carrot') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.type = type;

        // Enemy dimensions
        this.width = 48;
        this.height = 48;

        // Position enemy at the right side of the canvas
        this.x = canvas.width;
        this.groundLevel = canvas.height - this.height - 100; // Match player's ground level
        this.y = this.groundLevel;

        // Set type-specific stats
        if (type === 'carrot') {
            this.speed = 6;
            this.hp = 25;
            this.damage = 8;
            this.points = 100;
        } else if (type === 'broccoli') {
            this.speed = 4;
            this.hp = 40;
            this.damage = 12;
            this.points = 150;
        }
        
        // Animation
        this.sprite = new Image();
        this.sprite.src = `assets/images/vegetable_${this.type}.png`;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 4;  // Number of frames in sprite sheet
        this.frameTimer = 0;
        this.frameInterval = 1000/30;  // 30 fps

        // Error handling for sprite loading
        this.sprite.onerror = () => {
            console.error(`Error loading ${this.type} sprite`);
            this.useFallbackSprite = true;
        };

        // Initialize random behavior
        this.initializeBehavior();
    }

    initializeBehavior() {
        // Different behaviors based on enemy type
        switch(this.type) {
            case 'carrot':
                this.speed *= 1.2; // Carrots are faster
                this.hp *= 0.8;    // But weaker
                break;
            case 'broccoli':
                this.speed *= 0.8; // Broccoli are slower
                this.hp *= 1.2;    // But tougher
                break;
        }

        // Random vertical movement
        this.hasVerticalMovement = Math.random() > 0.5;
        if (this.hasVerticalMovement) {
            this.verticalSpeed = 2;
            this.verticalDirection = 1;
            this.verticalDistance = 0;
            this.maxVerticalDistance = 50;
        }
    }

    update(deltaTime) {
        try {
            // Basic movement
            this.x -= this.speed;

            // Vertical movement if enabled
            if (this.hasVerticalMovement) {
                this.y += this.verticalSpeed * this.verticalDirection;
                this.verticalDistance += Math.abs(this.verticalSpeed);

                if (this.verticalDistance >= this.maxVerticalDistance) {
                    this.verticalDirection *= -1;  // Reverse direction
                    this.verticalDistance = 0;
                }
            }

            // Animation timing
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // Ensure enemy stays within vertical bounds
            const minY = this.groundLevel - 100;  // Can jump up to 100px
            const maxY = this.groundLevel;  // Can't go below ground
            this.y = Math.max(minY, Math.min(maxY, this.y));

        } catch (error) {
            console.error('Error updating enemy:', error);
        }
    }

    draw() {
        try {
            if (this.useFallbackSprite) {
                // Fallback shapes if sprite fails to load
                this.ctx.fillStyle = this.type === 'carrot' ? '#e67e22' : '#27ae60';
                this.ctx.fillRect(this.x, this.y, this.width, this.height);
            } else {
                // Draw sprite
                this.ctx.drawImage(
                    this.sprite,
                    this.frameX * this.width,
                    this.frameY * this.height,
                    this.width,
                    this.height,
                    this.x,
                    this.y,
                    this.width,
                    this.height
                );
            }

            // Draw HP bar
            this.drawHealthBar();

        } catch (error) {
            console.error('Error drawing enemy:', error);
        }
    }

    drawHealthBar() {
        const barWidth = 40;
        const barHeight = 4;
        const barX = this.x + (this.width - barWidth) / 2;
        const barY = this.y - 8;

        // Background (empty health)
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Foreground (current health)
        const maxHp = this.type === 'carrot' ? 24 : 36; // Based on type modifiers
        const currentHealthWidth = (this.hp / maxHp) * barWidth;
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(barX, barY, currentHealthWidth, barHeight);
    }

    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }

    getHitbox() {
        return {
            x: this.x + 5,  // Smaller hitbox than sprite
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }

    isOffscreen() {
        return this.x + this.width < 0;
    }

    // Method to handle enemy death effects
    onDeath() {
        // Return true if should drop item (20% chance)
        return Math.random() < 0.2;
    }
}

// Enemy spawner utility
class EnemySpawner {
    constructor(canvas) {
        this.canvas = canvas;
        this.minSpawnTime = 2000;  // Start with slower spawns
        this.maxSpawnTime = 4000;
        this.nextSpawnTime = this.getRandomSpawnTime();
        this.timer = 0;
        
        // Difficulty scaling
        this.baseMinTime = 2000;
        this.baseMaxTime = 4000;
        this.minSpawnTimeLimit = 500;  // Fastest possible spawn rate
        this.maxSpawnTimeLimit = 1500;
        this.difficultyScaling = 0.9;  // 10% faster per level

        // Enemy variety
        this.enemyTypes = ['carrot', 'broccoli'];
        this.currentPattern = 'random';  // Can be 'random', 'alternating', or 'wave'
        this.patternCount = 0;
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.nextSpawnTime) {
            this.timer = 0;
            this.nextSpawnTime = this.getRandomSpawnTime();
            return true;  // Time to spawn new enemy
        }
        return false;
    }

    getRandomSpawnTime() {
        return Math.random() * (this.maxSpawnTime - this.minSpawnTime) + this.minSpawnTime;
    }

    // Adjust difficulty based on player level with smoother progression
    adjustDifficulty(level) {
        // Calculate new spawn times with exponential scaling
        const scaleFactor = Math.pow(this.difficultyScaling, level - 1);
        this.minSpawnTime = Math.max(
            this.minSpawnTimeLimit,
            this.baseMinTime * scaleFactor
        );
        this.maxSpawnTime = Math.max(
            this.maxSpawnTimeLimit,
            this.baseMaxTime * scaleFactor
        );

        // Adjust enemy stats based on level
        Enemy.prototype.baseHp = 30 + (level * 5);
        Enemy.prototype.baseDamage = 10 + (level * 2);
        Enemy.prototype.baseSpeed = 5 + (level * 0.5);
    }

    // Get random enemy type
    getEnemyType() {
        return this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
    }
}
