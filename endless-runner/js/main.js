// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create and initialize game
        window.game = new Game();
        await window.game.initialize();

        console.log('Game ready to start');

    } catch (error) {
        console.error('Failed to start game:', error);
        
        // Show error message on canvas
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = '24px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Failed to start game', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText('Please refresh the page', canvas.width / 2, canvas.height / 2 + 20);
    }
});

// Handle window errors
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Window Error:', {
        message: msg,
        url: url,
        lineNo: lineNo,
        columnNo: columnNo,
        error: error
    });
    
    // Show error message if game is not initialized
    if (!window.game || !window.game.gameManager) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#e74c3c';
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('An error occurred', canvas.width / 2, canvas.height / 2 - 20);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px "Press Start 2P"';
            ctx.fillText('Please refresh the page', canvas.width / 2, canvas.height / 2 + 20);
        }
    }
    
    return false;
};

// Handle unhandled promise rejections
window.onunhandledrejection = function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
};
