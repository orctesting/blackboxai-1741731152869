const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to create and save an image
function createImage(filename, width, height, drawFunction) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Draw the sprite
    drawFunction(ctx, width, height);
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`assets/images/${filename}.png`, buffer);
}

// Create orc sprite
createImage('orc', 64, 64, (ctx, w, h) => {
    // Body
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(10, 10, w-20, h-20);
    
    // Face details
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(20, 20, 10, 10); // eye
    ctx.fillRect(40, 20, 10, 10); // eye
    ctx.fillRect(25, 40, 20, 5);  // mouth
});

// Create carrot enemy
createImage('vegetable_carrot', 48, 48, (ctx, w, h) => {
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w-10, h-10);
    ctx.lineTo(10, h-10);
    ctx.closePath();
    ctx.fill();
});

// Create broccoli enemy
createImage('vegetable_broccoli', 48, 48, (ctx, w, h) => {
    // Stem
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(w/2-5, h/2, 10, h/2);
    
    // Top
    ctx.beginPath();
    ctx.arc(w/2, h/2, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#2ecc71';
    ctx.fill();
});

// Create boss sprite
createImage('boss', 96, 96, (ctx, w, h) => {
    // Body
    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(10, 10, w-20, h-20);
    
    // Details
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(30, 30, 15, 15); // eye
    ctx.fillRect(60, 30, 15, 15); // eye
    ctx.fillRect(35, 60, 35, 8);  // mouth
});

// Create HP item
createImage('item_hp', 32, 32, (ctx, w, h) => {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(w/2, h/2, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Cross symbol
    ctx.fillStyle = '#fff';
    ctx.fillRect(w/2-2, h/2-8, 4, 16);
    ctx.fillRect(w/2-8, h/2-2, 16, 4);
});

// Create attack item
createImage('item_attack', 32, 32, (ctx, w, h) => {
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(w/2, 5);
    ctx.lineTo(w-5, h-5);
    ctx.lineTo(w/2, h-10);
    ctx.lineTo(5, h-5);
    ctx.closePath();
    ctx.fill();
});

// Create background layers
createImage('background', 800, 600, (ctx, w, h) => {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Add some clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for(let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * (h/2), 30, 0, Math.PI * 2);
        ctx.fill();
    }
});

createImage('middleground', 800, 600, (ctx, w, h) => {
    // Mountains
    ctx.fillStyle = '#34495e';
    for(let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 200, h);
        ctx.lineTo(i * 200 + 100, h/2);
        ctx.lineTo(i * 200 + 200, h);
        ctx.fill();
    }
});

createImage('foreground', 800, 600, (ctx, w, h) => {
    // Ground
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, h-100, w, 100);
    
    // Add some grass details
    ctx.fillStyle = '#27ae60';
    for(let i = 0; i < w; i += 30) {
        ctx.fillRect(i, h-100, 20, 5);
    }
});

console.log('All placeholder assets generated successfully!');
