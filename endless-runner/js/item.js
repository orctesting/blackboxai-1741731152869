class Item {
    constructor(canvas, x, y, type) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Item dimensions
        this.width = 32;
        this.height = 32;

        // Position (spawn at enemy death location)
        this.x = x;
        this.y = y;

        // Movement
        this.fallSpeed = 2;
        this.bounceHeight = 4;
        this.bounceSpeed = 0.1;
        this.time = 0;

        // Type and effect
        this.type = type || this.getRandomType();
        this.effect = this.getEffect();
        
        // Animation
        this.sprite = new Image();
        this.sprite.src = `assets/images/item_${this.type}.png`;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 4;  // Number of frames in sprite sheet
        this.frameTimer = 0;
        this.frameInterval = 1000/15;  // 15 fps for floating effect
        
        // Lifetime
        this.lifetime = 7000;  // Items disappear after 7 seconds
        this.creationTime = Date.now();
        this.fadeStart = this.lifetime - 1000;  // Start fading 1 second before disappearing
        this.alpha = 1;

        // Error handling for sprite loading
        this.sprite.onerror = () => {
            console.error(`Error loading ${this.type} item sprite`);
            this.useFallbackSprite = true;
        };
    }

    getRandomType() {
        const types = [
            { type: 'hp', weight: 0.4 },
            { type: 'attack', weight: 0.3 },
            { type: 'speed', weight: 0.2 },
            { type: 'mega', weight: 0.1 }
        ];
        
        // Weighted random selection
        const totalWeight = types.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of types) {
            if (random < item.weight) return item.type;
            random -= item.weight;
        }
        
        return types[0].type; // Fallback to hp
    }

    getEffect() {
        switch(this.type) {
            case 'hp':
                return {
                    type: 'heal',
                    value: 30,
                    message: '+30 HP',
                    color: '#e74c3c',
                    duration: 0  // Instant effect
                };
            case 'attack':
                return {
                    type: 'attack',
                    value: 5,
                    message: '+5 Attack',
                    color: '#f1c40f',
                    duration: 10000  // 10 seconds
                };
            case 'speed':
                return {
                    type: 'speed',
                    value: 1.5,  // 50% speed boost
                    message: 'Speed Boost!',
                    color: '#3498db',
                    duration: 5000  // 5 seconds
                };
            case 'mega':
                return {
                    type: 'mega',
                    value: 2,  // Double damage
                    message: 'MEGA POWER!',
                    color: '#9b59b6',
                    duration: 8000  // 8 seconds
                };
            default:
                return {
                    type: 'heal',
                    value: 10,
                    message: '+10 HP',
                    color: '#e74c3c',
                    duration: 0
                };
        }
    }

    update(deltaTime) {
        try {
            this.time += deltaTime;

            // Floating movement
            this.y += Math.sin(this.time * this.bounceSpeed) * this.bounceHeight * deltaTime/16;
            
            // Slowly fall to the ground
            this.y += this.fallSpeed * deltaTime/16;

            // Keep within canvas bounds
            this.y = Math.min(this.y, this.canvas.height - this.height - 50);

            // Animation timing
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // Handle fading
            const timeElapsed = Date.now() - this.creationTime;
            if (timeElapsed > this.fadeStart) {
                this.alpha = 1 - ((timeElapsed - this.fadeStart) / (this.lifetime - this.fadeStart));
            }

        } catch (error) {
            console.error('Error updating item:', error);
        }
    }

    draw() {
        try {
            this.ctx.save();
            this.ctx.globalAlpha = this.alpha;

            if (this.useFallbackSprite) {
                // Fallback shapes if sprite fails to load
                this.ctx.fillStyle = this.type === 'hp' ? '#e74c3c' : '#f1c40f';
                this.ctx.beginPath();
                this.ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            } else {
                // Draw sprite with glow effect
                this.ctx.shadowColor = this.type === 'hp' ? '#e74c3c' : '#f1c40f';
                this.ctx.shadowBlur = 10;
                
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

            // Draw floating effect text
            this.drawFloatingText();

            this.ctx.restore();

        } catch (error) {
            console.error('Error drawing item:', error);
        }
    }

    drawFloatingText() {
        const text = this.effect.message;
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.fillStyle = this.type === 'hp' ? '#e74c3c' : '#f1c40f';
        this.ctx.textAlign = 'center';
        
        // Draw text with outline
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(text, this.x + this.width/2, this.y - 10);
        this.ctx.fillText(text, this.x + this.width/2, this.y - 10);
    }

    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isExpired() {
        return Date.now() - this.creationTime >= this.lifetime;
    }

    applyEffect(player) {
        const effect = this.effect;
        
        switch(effect.type) {
            case 'heal':
                player.heal(effect.value);
                break;
            case 'attack':
                const originalAttack = player.attack;
                player.attack += effect.value;
                if (effect.duration > 0) {
                    setTimeout(() => {
                        player.attack = originalAttack;
                    }, effect.duration);
                }
                break;
            case 'speed':
                player.velocityX *= effect.value;
                setTimeout(() => {
                    player.velocityX /= effect.value;
                }, effect.duration);
                break;
            case 'mega':
                const origAttack = player.attack;
                player.attack *= effect.value;
                player.isInvulnerable = true;
                setTimeout(() => {
                    player.attack = origAttack;
                    player.isInvulnerable = false;
                }, effect.duration);
                break;
        }

        // Show floating text effect
        this.showFloatingEffect(effect);
    }

    showFloatingEffect(effect) {
        // Create floating text element
        const text = document.createElement('div');
        text.className = 'floating-text';
        text.style.position = 'absolute';
        text.style.left = `${this.x + this.width/2}px`;
        text.style.top = `${this.y}px`;
        text.style.color = effect.color;
        text.style.fontFamily = '"Press Start 2P", cursive';
        text.style.fontSize = '16px';
        text.style.pointerEvents = 'none';
        text.style.textShadow = '2px 2px 2px rgba(0,0,0,0.5)';
        text.textContent = effect.message;

        document.body.appendChild(text);

        // Animate
        let startY = this.y;
        let opacity = 1;
        const animate = () => {
            startY -= 1;
            opacity -= 0.02;
            text.style.top = `${startY}px`;
            text.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(text);
            }
        };

        requestAnimationFrame(animate);
    }
}
