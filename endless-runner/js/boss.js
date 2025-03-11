class Boss {
    constructor(canvas, playerLevel) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Boss dimensions (larger than regular enemies)
        this.width = 96;
        this.height = 96;

        // Position boss at the right side of the canvas
        this.x = canvas.width - this.width - 50;  // Slight offset from right edge
        this.y = canvas.height - this.height - 50;

        // Movement
        this.baseSpeed = 3;
        this.speed = this.baseSpeed;
        this.verticalSpeed = 4;
        this.verticalDirection = 1;
        this.movementPattern = 'sine';  // Can be 'sine' or 'charge'
        this.sineAmplitude = 50;
        this.sineFrequency = 0.02;
        this.time = 0;
        this.originalY = this.y;

        // Stats (scaled with player level)
        this.level = playerLevel;
        this.maxHp = 100 + (playerLevel * 50);
        this.hp = this.maxHp;
        this.damage = 20 + (playerLevel * 5);
        this.points = 50 + (playerLevel * 10);

        // Attack patterns
        this.attackCooldown = 3000;  // 3 seconds between attacks
        this.lastAttackTime = 0;
        this.isCharging = false;
        this.chargeSpeed = 12;
        this.chargeDuration = 1000;  // 1 second charge duration
        this.chargeStartTime = 0;

        // Animation
        this.sprite = new Image();
        this.sprite.src = 'assets/images/boss.png';
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 6;  // Number of frames in sprite sheet
        this.frameTimer = 0;
        this.frameInterval = 1000/30;  // 30 fps
        
        // States
        this.phase = 1;  // Boss fight has multiple phases
        this.isStunned = false;
        this.isInvulnerable = false;

        // Error handling for sprite loading
        this.sprite.onerror = () => {
            console.error('Error loading boss sprite');
            this.useFallbackSprite = true;
        };
    }

    update(deltaTime, playerX, playerY) {
        try {
            this.time += deltaTime;

            // Update animation
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // Skip movement if stunned
            if (this.isStunned) return;

            // Handle different movement patterns
            if (this.isCharging) {
                this.handleChargeMovement(deltaTime);
            } else {
                this.handleNormalMovement(deltaTime);
            }

            // Check if it's time for a new attack
            if (this.time - this.lastAttackTime >= this.attackCooldown) {
                this.initiateAttack(playerX, playerY);
            }

            // Phase transition check
            this.checkPhaseTransition();

        } catch (error) {
            console.error('Error updating boss:', error);
        }
    }

    handleNormalMovement(deltaTime) {
        switch (this.movementPattern) {
            case 'sine':
                // Sinusoidal movement
                this.y = this.originalY + Math.sin(this.time * this.sineFrequency) * this.sineAmplitude;
                // Gentle horizontal movement
                this.x += Math.sin(this.time * 0.001) * this.speed * 0.5;
                break;
            default:
                // Default movement pattern
                this.y += this.verticalSpeed * this.verticalDirection;
                if (this.y <= 50 || this.y >= this.canvas.height - this.height - 50) {
                    this.verticalDirection *= -1;
                }
        }

        // Keep boss within canvas bounds
        this.x = Math.max(this.canvas.width / 2, Math.min(this.canvas.width - this.width - 20, this.x));
        this.y = Math.max(50, Math.min(this.canvas.height - this.height - 50, this.y));
    }

    handleChargeMovement(deltaTime) {
        const chargeElapsed = this.time - this.chargeStartTime;
        
        if (chargeElapsed >= this.chargeDuration) {
            this.isCharging = false;
            this.speed = this.baseSpeed;
            return;
        }

        // Charge movement
        this.x -= this.chargeSpeed;
        
        // If charge goes too far left, reset position
        if (this.x <= 0) {
            this.x = this.canvas.width - this.width - 50;
            this.isCharging = false;
        }
    }

    initiateAttack(playerX, playerY) {
        this.lastAttackTime = this.time;
        
        // Different attack patterns based on phase
        switch (this.phase) {
            case 1:
                this.isCharging = true;
                this.chargeStartTime = this.time;
                break;
            case 2:
                // More complex attack pattern for phase 2
                this.isCharging = true;
                this.chargeStartTime = this.time;
                this.chargeSpeed *= 1.5;
                break;
            case 3:
                // Final phase attack pattern
                this.isCharging = true;
                this.chargeStartTime = this.time;
                this.chargeSpeed *= 2;
                this.attackCooldown *= 0.7;
                break;
        }
    }

    checkPhaseTransition() {
        const healthPercentage = this.hp / this.maxHp;
        
        if (healthPercentage <= 0.3 && this.phase < 3) {
            this.phase = 3;
            this.enterPhase(3);
        } else if (healthPercentage <= 0.6 && this.phase < 2) {
            this.phase = 2;
            this.enterPhase(2);
        }
    }

    enterPhase(phase) {
        // Temporary invulnerability during phase transition
        this.isInvulnerable = true;
        setTimeout(() => {
            this.isInvulnerable = false;
        }, 1000);

        // Phase-specific modifications
        switch (phase) {
            case 2:
                this.speed *= 1.3;
                this.sineFrequency *= 1.5;
                break;
            case 3:
                this.speed *= 1.5;
                this.damage *= 1.3;
                this.sineAmplitude *= 1.5;
                break;
        }
    }

    draw() {
        try {
            if (this.useFallbackSprite) {
                // Fallback shape if sprite fails to load
                this.ctx.fillStyle = '#8e44ad';
                this.ctx.fillRect(this.x, this.y, this.width, this.height);
            } else {
                // Draw sprite with potential phase-specific effects
                this.ctx.save();
                
                // Phase-specific visual effects
                if (this.phase > 1) {
                    this.ctx.shadowColor = this.phase === 3 ? '#e74c3c' : '#f1c40f';
                    this.ctx.shadowBlur = 20;
                }

                // Draw the boss sprite
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

                this.ctx.restore();
            }

            // Draw HP bar
            this.drawHealthBar();

            // Draw phase indicator
            this.drawPhaseIndicator();

        } catch (error) {
            console.error('Error drawing boss:', error);
        }
    }

    drawHealthBar() {
        const barWidth = this.width * 1.2;
        const barHeight = 8;
        const barX = this.x + (this.width - barWidth) / 2;
        const barY = this.y - 20;

        // Background (empty health)
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Foreground (current health)
        const currentHealthWidth = (this.hp / this.maxHp) * barWidth;
        this.ctx.fillStyle = this.phase === 3 ? '#e74c3c' : 
                            this.phase === 2 ? '#f1c40f' : '#27ae60';
        this.ctx.fillRect(barX, barY, currentHealthWidth, barHeight);
    }

    drawPhaseIndicator() {
        const radius = 5;
        const spacing = 15;
        const startX = this.x + this.width / 2 - ((this.phase * spacing) / 2);
        const y = this.y - 30;

        for (let i = 0; i < this.phase; i++) {
            this.ctx.beginPath();
            this.ctx.arc(startX + (i * spacing), y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fill();
            this.ctx.closePath();
        }
    }

    takeDamage(amount) {
        if (this.isInvulnerable) return false;
        
        this.hp -= amount;
        
        // Visual feedback
        this.isStunned = true;
        setTimeout(() => {
            this.isStunned = false;
        }, 200);

        return this.hp <= 0;
    }

    getHitbox() {
        return {
            x: this.x + 10,
            y: this.y + 10,
            width: this.width - 20,
            height: this.height - 20
        };
    }

    reset() {
        this.x = this.canvas.width - this.width - 50;
        this.y = this.canvas.height - this.height - 50;
        this.hp = this.maxHp;
        this.phase = 1;
        this.isStunned = false;
        this.isInvulnerable = false;
        this.isCharging = false;
        this.speed = this.baseSpeed;
        this.lastAttackTime = 0;
    }
}
