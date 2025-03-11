class Player {
    constructor(canvas) {
        // Canvas dimensions
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Player dimensions
        this.width = 64;
        this.height = 64;

        // Initial position (adjusted for proper ground level)
        this.x = 100;  // Fixed x position for runner
        this.y = canvas.height - this.height - 100;  // Raised higher from ground
        this.groundLevel = canvas.height - this.height - 100;  // Store ground level

        // Physics
        this.gravity = 0.5;
        this.jumpForce = -12;
        this.velocityY = 0;
        this.velocityX = 1;  // Base movement speed
        this.isGrounded = true;

        // Power-up effects
        this.activeEffects = new Set();

        // Stats
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.attack = 10;
        this.level = 1;
        this.isInvulnerable = false;
        this.invulnerabilityDuration = 1000; // ms

        // Animation
        this.sprite = new Image();
        this.sprite.src = 'assets/images/orc.png';
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 8;  // Number of frames in sprite sheet
        this.frameTimer = 0;
        this.frameInterval = 1000/60;  // 60 fps
        
        // Load sprite with error handling
        this.sprite.onerror = () => {
            console.error('Error loading player sprite');
            // Use fallback rectangle if image fails to load
            this.useFallbackSprite = true;
        };
    }

    update(deltaTime) {
        try {
            // Apply gravity
            if (!this.isGrounded) {
                this.velocityY += this.gravity;
                this.y += this.velocityY;
            }

            // Ground collision with stored ground level
            if (this.y > this.groundLevel) {
                this.y = this.groundLevel;
                this.velocityY = 0;
                this.isGrounded = true;
            }

            // Animation timing
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // Check for enemy collisions and attack
            this.checkEnemyCollisions();

        } catch (error) {
            console.error('Error updating player:', error);
        }
    }

    checkEnemyCollisions() {
        if (window.game && window.game.gameManager) {
            const hitbox = this.getHitbox();
            
            // Check regular enemies
            window.game.gameManager.enemies.forEach(enemy => {
                if (Collision.checkCollision(hitbox, enemy.getHitbox())) {
                    // Player deals damage to enemy
                    if (enemy.takeDamage(this.attack)) {
                        // Enemy defeated
                        window.game.gameManager.onEnemyDefeated(enemy);
                        const enemyIndex = window.game.gameManager.enemies.indexOf(enemy);
                        if (enemyIndex > -1) {
                            window.game.gameManager.enemies.splice(enemyIndex, 1);
                        }
                    }
                }
            });

            // Check boss collision
            const boss = window.game.gameManager.boss;
            if (boss && Collision.checkCollision(hitbox, boss.getHitbox())) {
                if (boss.takeDamage(this.attack)) {
                    window.game.gameManager.onBossDefeated();
                }
            }
        }
    }

    draw() {
        try {
            if (this.useFallbackSprite) {
                // Fallback rectangle if sprite fails to load
                this.ctx.fillStyle = '#e74c3c';
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
            console.error('Error drawing player:', error);
        }
    }

    drawHealthBar() {
        const barWidth = 50;
        const barHeight = 5;
        const barX = this.x + (this.width - barWidth) / 2;
        const barY = this.y - 10;

        // Background (empty health)
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Foreground (current health)
        const currentHealthWidth = (this.hp / this.maxHp) * barWidth;
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(barX, barY, currentHealthWidth, barHeight);
    }

    bindKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isGrounded) {
                this.jump();
                // Prevent page scroll on spacebar
                e.preventDefault();
            }
        });
    }

    jump() {
        if (this.isGrounded) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
            
            // Jump animation
            this.frameY = 1;  // Use jump animation frame
            setTimeout(() => {
                if (!this.isGrounded) {
                    this.frameY = 0;  // Return to running animation
                }
            }, 300);
        }
    }

    takeDamage(amount) {
        if (!this.isInvulnerable) {
            this.hp = Math.max(0, this.hp - amount);
            this.setInvulnerable();
            return true;
        }
        return false;
    }

    setInvulnerable() {
        this.isInvulnerable = true;
        setTimeout(() => {
            this.isInvulnerable = false;
        }, this.invulnerabilityDuration);
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    levelUp(stat) {
        this.level++;
        switch(stat) {
            case 'hp':
                this.maxHp += 20;
                this.hp = this.maxHp;  // Fully heal on HP upgrade
                break;
            case 'attack':
                this.attack += 5;
                break;
            default:
                console.warn('Invalid stat upgrade');
        }
    }

    getHitbox() {
        return {
            x: this.x + 10,  // Smaller hitbox than sprite
            y: this.y + 5,
            width: this.width - 20,
            height: this.height - 10
        };
    }

    reset() {
        this.hp = this.maxHp;
        this.y = this.groundLevel;  // Use stored ground level
        this.velocityY = 0;
        this.velocityX = 1;
        this.isGrounded = true;
        this.isInvulnerable = false;
        this.activeEffects.clear();
    }

    // Add effect tracking methods
    addEffect(effectType, duration) {
        if (duration > 0) {
            this.activeEffects.add(effectType);
            setTimeout(() => {
                this.activeEffects.delete(effectType);
            }, duration);
        }
    }

    hasEffect(effectType) {
        return this.activeEffects.has(effectType);
    }
}
