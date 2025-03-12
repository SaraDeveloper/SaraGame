const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');

// Game objects
const player = {
    x: 70,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    jumping: false,
    jumpHeight: 25,
    gravity: 0.6,
    velocity: 0,
    jumpCount: 0,
    maxJumps: 2,
    speed: 5  // Horizontal movement speed
};

let obstacles = [];
let gameOver = false;
let score = 0;
let level = 1;
let countdown = 0;
let countdownStart = 0;
let isMovingLeft = false;
let isMovingRight = false;

// Initialize obstacles
function createObstacle() {
    const minGap = 250;
    const maxGap = 500;
    const lastObstacle = obstacles[obstacles.length - 1];
    const randomGap = Math.random() * (maxGap - minGap) + minGap;
    
    // Randomly decide if we want to create multiple obstacles
    const numObstacles = Math.random() < 0.3 ? 2 : 1;
    const newObstacles = [];
    
    let startX = canvas.width - 100; // Position obstacles towards the right
    if (lastObstacle) {
        startX = lastObstacle.x + randomGap;
    }
    
    for (let i = 0; i < numObstacles; i++) {
        newObstacles.push({
            x: startX + (i * 80),
            y: canvas.height - 40,
            width: 40,
            height: 40
        });
    }
    
    return newObstacles;
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Handle level transition
        if (score >= level * 20 && countdown === 0) {
            level++;
            countdown = 3;
            countdownStart = Date.now();
            // Reset player position for new level
            player.x = 70;
        }
        
        // Show countdown if active
        if (countdown > 0) {
            const elapsed = (Date.now() - countdownStart) / 1000;
            if (elapsed >= 1) {
                countdown--;
                countdownStart = Date.now();
            }
            
            // Draw countdown
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Level ${level}`, canvas.width / 2, canvas.height / 2 - 40);
            ctx.fillText(`Starting in: ${countdown}`, canvas.width / 2, canvas.height / 2 + 20);
            
            requestAnimationFrame(gameLoop);
            return;
        }
        
        // Update player horizontal position
        if (isMovingLeft && player.x > 0) {
            player.x -= player.speed;
        }
        if (isMovingRight && player.x < canvas.width - player.width) {
            player.x += player.speed;
        }
        
        // Update player vertical position (jumping)
        if (player.jumping) {
            player.velocity += player.gravity;
            player.y += player.velocity;
            
            // Check if player has landed
            if (player.y > canvas.height - player.height) {
                player.y = canvas.height - player.height;
                player.jumping = false;
                player.velocity = 0;
                player.jumpCount = 0;
            }
        }
        
        // Draw player
        ctx.fillStyle = 'black';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Draw obstacles (now stationary)
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            
            // Draw obstacle
            ctx.fillStyle = 'yellow';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Check collision
            if (checkCollision(player, obstacle)) {
                gameOver = true;
            }
            
            // Check if player has passed the obstacle
            if (!obstacle.passed && player.x > obstacle.x + obstacle.width) {
                obstacle.passed = true;
                score++;
            }
        }
        
        // Add new obstacles
        if (obstacles.length === 0 || 
            obstacles[obstacles.length - 1].x < canvas.width - 300) {
            const newObstacles = createObstacle();
            obstacles.push(...newObstacles);
        }
        
        // Draw score and level
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(5, 5, 200, 70);
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial bold';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 15, 35);
        ctx.fillText(`Level: ${level}`, 15, 65);
        
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
        ctx.fillText(`Level: ${level}`, canvas.width / 2, canvas.height / 2 + 70);
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
    if ((event.code === 'ArrowUp' || event.code === 'Space') && player.jumpCount < player.maxJumps) {
        if (!player.jumping) {
            player.jumping = true;
            player.jumpCount = 1;
        } else {
            player.jumpCount++;
        }
        player.velocity = -player.jumpHeight;
        event.preventDefault();
    } else if (event.code === 'ArrowLeft') {
        isMovingLeft = true;
        event.preventDefault();
    } else if (event.code === 'ArrowRight') {
        isMovingRight = true;
        event.preventDefault();
    }
});

document.addEventListener('keyup', (event) => {
    if ((event.code === 'ArrowUp' || event.code === 'Space') && player.velocity < -8) {
        player.velocity = -8;
    } else if (event.code === 'ArrowLeft') {
        isMovingLeft = false;
    } else if (event.code === 'ArrowRight') {
        isMovingRight = false;
    }
});

// Restart game
function restartGame() {
    player.x = 70;
    player.y = canvas.height - player.height;
    player.jumping = false;
    player.velocity = 0;
    player.jumpCount = 0;
    obstacles = [];
    gameOver = false;
    score = 0;
    level = 1;
    countdown = 0;
    isMovingLeft = false;
    isMovingRight = false;
    gameLoop();
}

restartBtn.addEventListener('click', restartGame);

// Start the game
restartGame(); 