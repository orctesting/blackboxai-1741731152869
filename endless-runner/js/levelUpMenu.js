class LevelUpMenu {
    constructor(canvas, player) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = player;
        
        // Menu state
        this.isVisible = false;
        this.selectedOption = null;
        
        // Menu dimensions and position
        this.width = 400;
        this.height = 300;
        this.x = (canvas.width - this.width) / 2;
        this.y = (canvas.height - this.height) / 2;

        // Animation properties
        this.alpha = 0;
        this.scale = 0.8;
        this.animationDuration = 500; // ms
        this.animationStartTime = 0;

        // Upgrade options
        this.options = [
            {
                type: 'hp',
                title: 'Increase HP',
                description: '+20 Max HP',
                icon: '❤️',
                color: '#e74c3c'
            },
            {
                type: 'attack',
                title: 'Increase Attack',
                description: '+5 Attack Damage',
                icon: '⚔️',
                color: '#f1c40f'
            }
        ];

        // Button dimensions
        this.buttonWidth = 160;
        this.buttonHeight = 160;
        this.buttonSpacing = 20;

        // Hover state
        this.hoveredOption = null;

        // Bind event listeners
        this.bindEvents();
    }

    bindEvents() {
        // Mouse move handler for hover effects
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isVisible) return;

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.hoveredOption = this.getHoveredOption(mouseX, mouseY);
        });

        // Click handler for option selection
        this.canvas.addEventListener('click', (e) => {
            if (!this.isVisible) return;

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const clickedOption = this.getHoveredOption(mouseX, mouseY);
            if (clickedOption !== null) {
                this.selectOption(clickedOption);
            }
        });
    }

    show() {
        this.isVisible = true;
        this.animationStartTime = Date.now();
        this.alpha = 0;
        this.scale = 0.8;
        this.selectedOption = null;
        this.hoveredOption = null;
    }

    hide() {
        this.isVisible = false;
        this.selectedOption = null;
        this.hoveredOption = null;
    }

    update() {
        if (!this.isVisible) return;

        // Update animation
        const elapsed = Date.now() - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);

        // Ease-out function
        const eased = 1 - Math.pow(1 - progress, 3);

        this.alpha = eased;
        this.scale = 0.8 + (0.2 * eased);
    }

    draw() {
        if (!this.isVisible) return;

        try {
            this.ctx.save();

            // Draw semi-transparent background
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.alpha * 0.7})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Set up the menu transform
            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.scale(this.scale, this.scale);
            this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

            // Draw menu background
            this.ctx.fillStyle = `rgba(52, 73, 94, ${this.alpha})`;
            this.roundRect(this.x, this.y, this.width, this.height, 15);
            this.ctx.fill();

            // Draw menu title
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            this.ctx.font = '24px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('LEVEL UP!', this.canvas.width / 2, this.y + 50);

            // Draw player's current level
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.fillText(`Level ${this.player.level}`, this.canvas.width / 2, this.y + 80);

            // Draw upgrade options
            this.drawOptions();

            this.ctx.restore();

        } catch (error) {
            console.error('Error drawing level up menu:', error);
        }
    }

    drawOptions() {
        const startX = this.canvas.width / 2 - (this.buttonWidth + this.buttonSpacing);
        const startY = this.y + 120;

        this.options.forEach((option, index) => {
            const x = startX + (index * (this.buttonWidth + this.buttonSpacing));
            const y = startY;

            // Draw button background
            this.ctx.fillStyle = `rgba(44, 62, 80, ${this.alpha})`;
            if (this.hoveredOption === index) {
                this.ctx.fillStyle = `rgba(52, 73, 94, ${this.alpha})`;
            }
            this.roundRect(x, y, this.buttonWidth, this.buttonHeight, 10);
            this.ctx.fill();

            // Draw button border
            this.ctx.strokeStyle = option.color;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Draw icon
            this.ctx.font = '32px Arial';
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(option.icon, x + this.buttonWidth / 2, y + 50);

            // Draw title
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.fillText(option.title, x + this.buttonWidth / 2, y + 90);

            // Draw description
            this.ctx.font = '12px "Press Start 2P"';
            this.ctx.fillStyle = `rgba(189, 195, 199, ${this.alpha})`;
            this.ctx.fillText(option.description, x + this.buttonWidth / 2, y + 120);
        });
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    getHoveredOption(mouseX, mouseY) {
        const startX = this.canvas.width / 2 - (this.buttonWidth + this.buttonSpacing);
        const startY = this.y + 120;

        for (let i = 0; i < this.options.length; i++) {
            const x = startX + (i * (this.buttonWidth + this.buttonSpacing));
            const y = startY;

            if (
                mouseX >= x &&
                mouseX <= x + this.buttonWidth &&
                mouseY >= y &&
                mouseY <= y + this.buttonHeight
            ) {
                return i;
            }
        }

        return null;
    }

    selectOption(optionIndex) {
        const option = this.options[optionIndex];
        if (!option) return;

        // Apply the upgrade
        this.player.levelUp(option.type);
        
        // Hide the menu
        this.hide();

        // Return the selected option type
        return option.type;
    }
}
