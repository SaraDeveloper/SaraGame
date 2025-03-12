const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');

// Load cloud background
const cloudBackground = new Image();
cloudBackground.onload = () => {
    console.log('Cloud background loaded successfully');
    // Create initial clouds when image loads
    createClouds();
};
cloudBackground.onerror = (e) => {
    console.error('Error loading cloud background:', e);
};
cloudBackground.src = 'assets/cloud.webp';

// Cloud array to store cloud positions
let clouds = [];
let lastTimestamp = 0;

// Function to create clouds
function createClouds() {
    clouds = [];
    // Create 5 clouds at random positions
    for (let i = 0; i < 5; i++) {
        const width = Math.random() * (400 - 200) + 200; // Random width between 200 and 400
        const height = width * 0.6; // Maintain aspect ratio
        
        // Calculate y position ensuring bottom of cloud is above screen height/2
        const maxY = (canvas.height / 2) - height; // Maximum y position to keep bottom above middle
        const y = Math.random() * maxY; // Random y between 0 and maxY
        
        // Calculate speed based on size - smaller clouds move faster
        const speedFactor = 1 - ((width - 200) / 200); // Will be 1 for smallest clouds, 0 for largest
        const baseSpeed = 0.5 + (speedFactor * 1); // Base speed between 0.5 and 1.5 pixels per frame
        
        clouds.push({
            x: Math.random() * canvas.width * 2,
            y: y,
            width: width,
            height: height,
            speed: baseSpeed
        });
    }
    lastTimestamp = performance.now();
}

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

// Add camera object
const camera = {
    x: 0,
    moveThreshold: 0.7 // When player reaches 70% of screen width, camera starts moving
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
    
    let startX = camera.x + canvas.width + 100; // Position obstacles ahead of the camera view
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
        
        // Draw sky background
        ctx.fillStyle = '#87CEEB'; // Light blue sky
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw clouds
        if (cloudBackground.complete) {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTimestamp;
            lastTimestamp = currentTime;

            clouds.forEach((cloud, index) => {
                // Update cloud position independently of camera
                cloud.x -= cloud.speed * deltaTime / 16; // Normalize to ~60fps

                // Draw cloud with parallax effect
                const screenX = cloud.x - camera.x * 0.2; // Small camera influence for depth
                
                // Draw the cloud
                ctx.drawImage(cloudBackground, screenX, cloud.y, cloud.width, cloud.height);
                
                // If cloud moves off screen to the left, move it to the right
                if (screenX + cloud.width < 0) {
                    cloud.x = camera.x + canvas.width + Math.random() * 200;
                }
            });
        }
        
        // Handle level transition
        if (score >= level * 20 && countdown === 0) {
            level++;
            countdown = 3;
            countdownStart = Date.now();
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

        // Update player horizontal position relative to camera
        if (isMovingLeft) {
            player.x = Math.max(camera.x + 50, player.x - player.speed);
        }
        if (isMovingRight) {
            player.x = Math.min(camera.x + canvas.width - player.width, player.x + player.speed);
        }

        // Update camera position only when player reaches threshold
        const playerScreenX = player.x - camera.x;
        if (playerScreenX > canvas.width * camera.moveThreshold) {
            camera.x += playerScreenX - (canvas.width * camera.moveThreshold);
        }
        
        // Update player vertical position (jumping)
        if (player.jumping) {
            player.velocity += player.gravity;
            player.y += player.velocity;
            
            // Prevent player from going above the screen
            if (player.y < 0) {
                player.y = 0;
                player.velocity = 0;
            }
            
            // Check if player has landed
            if (player.y > canvas.height - player.height) {
                player.y = canvas.height - player.height;
                player.jumping = false;
                player.velocity = 0;
                player.jumpCount = 0;
            }
        }
        
        // Draw player relative to camera
        ctx.fillStyle = 'black';
        ctx.fillRect(player.x - camera.x, player.y, player.width, player.height);
        
        // Clean up off-screen obstacles
        obstacles = obstacles.filter(obs => obs.x > camera.x - obs.width);
        
        // Draw obstacles relative to camera
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            
            // Draw obstacle relative to camera position
            ctx.fillStyle = 'yellow';
            ctx.fillRect(obstacle.x - camera.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Check collision using actual positions
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
            obstacles[obstacles.length - 1].x < camera.x + canvas.width + 100) {
            const newObstacles = createObstacle();
            obstacles.push(...newObstacles);
        }
        
        // Draw score and level (fixed to screen)
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

// Modify restartGame to reset camera
function restartGame() {
    camera.x = 0;
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
    createClouds(); // Reset cloud positions
    gameLoop();
}

restartBtn.addEventListener('click', restartGame);

// Start the game
restartGame(); 