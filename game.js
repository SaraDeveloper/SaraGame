const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');

// Game objects
const player = {
    x: 50,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    jumping: false,
    jumpHeight: 15,
    gravity: 0.6,
    velocity: 0
};

let obstacles = [];
let gameOver = false;
let score = 0;
const obstacleSpeed = 5;

// Initialize first obstacle
function createObstacle() {
    return {
        x: canvas.width,
        y: canvas.height - 30,
        width: 30,
        height: 30
    };
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update player
        if (player.jumping) {
            player.velocity += player.gravity;
            player.y += player.velocity;
            
            // Check if player has landed
            if (player.y > canvas.height - player.height) {
                player.y = canvas.height - player.height;
                player.jumping = false;
                player.velocity = 0;
            }
        }
        
        // Draw player
        ctx.fillStyle = 'black';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Update and draw obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            obstacle.x -= obstacleSpeed;
            
            // Draw obstacle
            ctx.fillStyle = 'yellow';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Check collision
            if (checkCollision(player, obstacle)) {
                gameOver = true;
            }
            
            // Remove obstacles that are off screen
            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(i, 1);
                score++;
            }
        }
        
        // Add new obstacles
        if (obstacles.length === 0 || 
            obstacles[obstacles.length - 1].x < canvas.width - 300) {
            obstacles.push(createObstacle());
        }
        
        // Draw score
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(5, 5, 150, 40);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial bold';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 15, 35);
        
        requestAnimationFrame(gameLoop);
    } else {
        // Game over screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp' && !player.jumping) {
        player.jumping = true;
        player.velocity = -player.jumpHeight;
    }
});

// Restart game
function restartGame() {
    player.y = canvas.height - player.height;
    player.jumping = false;
    player.velocity = 0;
    obstacles = [];
    gameOver = false;
    score = 0;
    gameLoop();
}

restartBtn.addEventListener('click', restartGame);

// Start the game
restartGame(); 