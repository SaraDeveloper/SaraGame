const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');
const menuContainer = document.getElementById('menu-container');
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');

// Debug flag
const DEBUG = false; // Set to true to see hitboxes and debug info

// Difficulty settings
const difficultySettings = {
    easy: {
        obstacleSpeed: 5,
        obstacleFrequency: 800,
        playerSpeed: 6,
        jumpHeight: 25,
        maxJumps: 2
    },
    medium: {
        obstacleSpeed: 5,
        obstacleFrequency: 400,
        playerSpeed: 5,
        jumpHeight: 30,
        maxJumps: 2
    },
    hard: {
        obstacleSpeed: 7,
        obstacleFrequency: 300,
        playerSpeed: 4,
        jumpHeight: 35,
        maxJumps: 1
    }
};

let currentDifficulty = null;

// Handle difficulty selection
function startGame(difficulty) {
    currentDifficulty = difficulty;
    menuContainer.style.display = 'none';
    canvas.style.display = 'block';
    
    // Show tutorial box
    const tutorialBox = document.createElement('div');
    tutorialBox.id = 'tutorial-box';
    tutorialBox.style.position = 'absolute';
    tutorialBox.style.top = '50%';
    tutorialBox.style.left = '50%';
    tutorialBox.style.transform = 'translate(-50%, -50%)';
    tutorialBox.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    tutorialBox.style.padding = '20px';
    tutorialBox.style.borderRadius = '10px';
    tutorialBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    tutorialBox.style.zIndex = '1000';
    tutorialBox.style.maxWidth = '400px';
    tutorialBox.style.textAlign = 'center';

    const title = document.createElement('h2');
    title.textContent = 'How to Play';
    title.style.marginBottom = '15px';
    title.style.color = '#333';

    const instructions = document.createElement('div');
    instructions.innerHTML = `
        <p style="margin-bottom: 10px;">🐰 Help the rabbit avoid the cactuses!</p>
        <p style="margin-bottom: 10px;">⌨️ Press <strong>SPACE</strong> or <strong>UP ARROW</strong> to jump</p>
        <p style="margin-bottom: 10px;">🥕 Collect carrots to gain extra lives</p>
        <p style="margin-bottom: 10px;">❤️ You start with 5 lives</p>
        <p style="margin-bottom: 15px;">🎯 Score points by passing obstacles</p>
    `;
    instructions.style.textAlign = 'left';
    instructions.style.color = '#444';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Start Playing!';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#4CAF50';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px';
    closeButton.style.marginTop = '10px';

    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = '#45a049';
    });

    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = '#4CAF50';
    });

    closeButton.addEventListener('click', () => {
        tutorialBox.remove();
        restartBtn.style.display = 'none';
        
        // Apply difficulty settings
        const settings = difficultySettings[difficulty];
        player.speed = settings.playerSpeed;
        player.jumpHeight = settings.jumpHeight;
        player.maxJumps = settings.maxJumps;
        
        // Start the game
        restartGame();
    });

    tutorialBox.appendChild(title);
    tutorialBox.appendChild(instructions);
    tutorialBox.appendChild(closeButton);
    document.body.appendChild(tutorialBox);
}

easyBtn.addEventListener('click', () => startGame('easy'));
mediumBtn.addEventListener('click', () => startGame('medium'));
hardBtn.addEventListener('click', () => startGame('hard'));

// Load rabbit sprites
const rabbitSprites = {
    walking: [],
    jumping: []
};

// Load heart images
const heartImage = new Image();
heartImage.onload = () => console.log('Heart image loaded successfully');
heartImage.onerror = (e) => console.error('Error loading heart image:', e);
heartImage.src = 'assets/lives/heart.png';

const emptyHeartImage = new Image();
emptyHeartImage.onload = () => console.log('Empty heart image loaded successfully');
emptyHeartImage.onerror = (e) => console.error('Error loading empty heart image:', e);
emptyHeartImage.src = 'assets/lives/empty_heart.png';

// Load walking sprites
for (let i = 1; i <= 4; i++) {
    const sprite = new Image();
    sprite.src = `assets/rabbit_walking/${i}.png`;
    sprite.onload = () => console.log(`Rabbit walking sprite ${i} loaded successfully`);
    sprite.onerror = (e) => console.error(`Error loading rabbit walking sprite ${i}:`, e);
    rabbitSprites.walking.push(sprite);
}

// Load jumping sprites
for (let i = 1; i <= 13; i++) {
    const sprite = new Image();
    sprite.src = `assets/rabbit_jumping/${i}.png`;
    sprite.onload = () => console.log(`Rabbit jumping sprite ${i} loaded successfully`);
    sprite.onerror = (e) => console.error(`Error loading rabbit jumping sprite ${i}:`, e);
    rabbitSprites.jumping.push(sprite);
}

// Animation frame counter
let walkingFrame = 0;
let jumpingFrame = 0;
let lastFrameUpdate = 0;
const WALK_FRAME_INTERVAL = 100; // Change walking frame every 100ms
const JUMP_FRAME_INTERVAL = 50; // Change jumping frame faster (every 50ms)

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

// Load cactus image
const cactusImage = new Image();
cactusImage.onload = () => {
    console.log('Cactus image loaded successfully');
};
cactusImage.onerror = (e) => {
    console.error('Error loading cactus image:', e);
};
cactusImage.src = 'assets/cactus.png';

// Load carrot image
const carrotImage = new Image();
carrotImage.onload = () => {
    console.log('Carrot image loaded successfully');
};
carrotImage.onerror = (e) => {
    console.error('Error loading carrot image:', e);
};
carrotImage.src = 'assets/carrot.png';

// Cloud array to store cloud positions
let clouds = [];
let carrots = [];
let lastTimestamp = 0;
let lastCarrotSpawn = 0;
const CARROT_SPAWN_INTERVAL = 15000; // Every 15 seconds
const CARROT_SIZE = 50;

// Function to create clouds
function createClouds() {
    clouds = [];
    // Create 5 clouds at random positions
    for (let i = 0; i < 5; i++) {
        const width = Math.random() * (400 - 200) + 200;
        const height = width * 0.6;
        const maxY = (canvas.height / 2) - height;
        const y = Math.random() * maxY;
        const speedFactor = 1 - ((width - 200) / 200);
        const baseSpeed = 0.5 + (speedFactor * 1);
        
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
    y: canvas.height - 100,
    width: 100,
    height: 100,
    jumping: false,
    jumpHeight: 25,
    gravity: 0.4,  // Reduced from 0.6 to make jumps longer
    velocity: 0,
    jumpCount: 0,
    maxJumps: 2,
    speed: 5,
    facingLeft: false,
    deathTimer: 0,
    lives: 5,
    isInvulnerable: false,
    invulnerabilityTimer: 0,
    invulnerabilityDuration: 1500 // 1.5 seconds of invulnerability after getting hit
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
let animationFrameId = null;  // Add this line to track the animation frame

// Add highest score variable and function to get it
let highestScore = parseInt(localStorage.getItem('highestScore')) || 0;

// Update highest score display in menu
document.getElementById('highest-score').textContent = `Highest Score: ${highestScore}`;

function updateHighestScore(currentScore) {
    if (currentScore > highestScore) {
        highestScore = currentScore;
        localStorage.setItem('highestScore', highestScore);
        // Update the display in menu
        document.getElementById('highest-score').textContent = `Highest Score: ${highestScore}`;
    }
}

// Initialize obstacles
function createObstacle() {
    const settings = difficultySettings[currentDifficulty];
    const minGap = settings.obstacleFrequency - 100;
    const maxGap = settings.obstacleFrequency + 100;
    const lastObstacle = obstacles[obstacles.length - 1];
    const randomGap = Math.random() * (maxGap - minGap) + minGap;
    
    // Check if we should spawn a carrot
    const currentTime = Date.now();
    if (currentTime - lastCarrotSpawn >= CARROT_SPAWN_INTERVAL) {
        // Position carrot ahead of the camera view
        const carrotX = camera.x + canvas.width + (randomGap / 2);
        // Random height between 250-300px from bottom (higher placement)
        const carrotY = canvas.height - (Math.random() * 50 + 250);
        carrots.push({
            x: carrotX,
            y: carrotY,
            width: CARROT_SIZE,
            height: CARROT_SIZE,
            collected: false,
            speed: settings.obstacleSpeed
        });
        lastCarrotSpawn = currentTime;
        console.log('Spawned carrot at:', carrotX, carrotY);
    }
    
    // Randomly decide if we want to create multiple obstacles
    const numObstacles = Math.random() < (currentDifficulty === 'hard' ? 0.4 : 0.3) ? 2 : 1;
    const newObstacles = [];
    
    let startX = camera.x + canvas.width + 100; // Position obstacles ahead of the camera view
    if (lastObstacle) {
        startX = lastObstacle.x + randomGap;
    }
    
    for (let i = 0; i < numObstacles; i++) {
        // Random size calculation with larger ranges
        const minHeight = 80;  // Increased minimum height
        const maxHeight = 150; // Increased maximum height
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        // More varied width calculation
        const minWidthRatio = 0.4;  // Width will be at least 40% of height
        const maxWidthRatio = 0.8;  // Width can be up to 80% of height
        const widthRatio = Math.random() * (maxWidthRatio - minWidthRatio) + minWidthRatio;
        const width = height * widthRatio;
        
        newObstacles.push({
            x: startX + (i * (width + 60)), // Increased spacing between obstacles
            y: canvas.height - height,
            width: width,
            height: height,
            speed: settings.obstacleSpeed
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
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw clouds
        if (cloudBackground.complete) {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTimestamp;
            lastTimestamp = currentTime;

            clouds.forEach((cloud, index) => {
                cloud.x -= cloud.speed * deltaTime / 16;
                const screenX = cloud.x - camera.x * 0.2;
                ctx.drawImage(cloudBackground, screenX, cloud.y, cloud.width, cloud.height);
                if (screenX + cloud.width < 0) {
                    cloud.x = camera.x + canvas.width + Math.random() * 200;
                }
            });
        }
        
        // Handle level transition
        if (score >= level * (currentDifficulty === 'easy' ? 15 : currentDifficulty === 'medium' ? 20 : 25) && countdown === 0) {
            level++;
            countdown = 3;
            countdownStart = Date.now();
            
            const speedIncrease = currentDifficulty === 'easy' ? 0.3 : 
                                currentDifficulty === 'medium' ? 0.5 : 0.7;
            obstacles.forEach(obs => obs.speed += speedIncrease);
        }
        
        // Show countdown if active
        if (countdown > 0) {
            const elapsed = (Date.now() - countdownStart) / 1000;
            if (elapsed >= 1) {
                countdown--;
                countdownStart = Date.now();
            }
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Level ${level}`, canvas.width / 2, canvas.height / 2 - 40);
            ctx.fillText(`Starting in: ${countdown}`, canvas.width / 2, canvas.height / 2 + 20);
        } else {
            // Regular game updates
            // Update camera position
            const playerScreenX = player.x - camera.x;
            let isCameraMoving = false;
            if (playerScreenX > canvas.width * camera.moveThreshold) {
                const cameraMove = playerScreenX - (canvas.width * camera.moveThreshold);
                camera.x += cameraMove;
                isCameraMoving = true;
            }
            
            // Update player vertical position
            if (player.jumping) {
                player.velocity += player.gravity;
                player.y += player.velocity;
                
                if (player.y < 0) {
                    player.y = 0;
                    player.velocity = 0;
                }
                
                if (player.y > canvas.height - player.height) {
                    player.y = canvas.height - player.height;
                    player.jumping = false;
                    player.velocity = 0;
                    player.jumpCount = 0;
                }
            }

            // Draw player with animation
            const currentTime = performance.now();
            
            if (player.jumping) {
                if (currentTime - lastFrameUpdate > JUMP_FRAME_INTERVAL) {
                    if (player.velocity < 0) {
                        jumpingFrame = Math.min(Math.floor((player.jumpHeight + player.velocity) / player.jumpHeight * 6), 5);
                    } else {
                        jumpingFrame = Math.min(Math.floor(6 + (player.velocity / player.jumpHeight * 6)), 12);
                    }
                    lastFrameUpdate = currentTime;
                }
            } else {
                if (currentTime - lastFrameUpdate > WALK_FRAME_INTERVAL) {
                    walkingFrame = (walkingFrame + 1) % 4;
                    lastFrameUpdate = currentTime;
                }
            }

            // Draw the player sprite
            const currentSprite = player.jumping ? 
                rabbitSprites.jumping[jumpingFrame] : 
                rabbitSprites.walking[walkingFrame];

            if (currentSprite && currentSprite.complete) {
                ctx.save();
                if (player.facingLeft) {
                    ctx.scale(-1, 1);
                    ctx.drawImage(currentSprite, 
                        -(player.x - camera.x + player.width),
                        player.y, 
                        player.width, 
                        player.height
                    );
                } else {
                    ctx.drawImage(currentSprite, 
                        player.x - camera.x, 
                        player.y, 
                        player.width, 
                        player.height
                    );
                }
                ctx.restore();
            }

            // Update and draw carrots
            carrots = carrots.filter(carrot => {
                if (carrot.collected) return false;
                if (carrot.x < camera.x - carrot.width) return false;
                
                // Update carrot position
                carrot.x -= carrot.speed;
                
                // Draw carrot
                if (carrotImage.complete) {
                    ctx.save();
                    ctx.drawImage(carrotImage, 
                        carrot.x - camera.x, 
                        carrot.y, 
                        carrot.width, 
                        carrot.height
                    );
                    ctx.restore();
                    
                    // Debug visualization of carrot hitbox
                    if (DEBUG) {
                        ctx.strokeStyle = 'red';
                        ctx.strokeRect(
                            carrot.x - camera.x, 
                            carrot.y, 
                            carrot.width, 
                            carrot.height
                        );
                    }
                }
                
                // Check if rabbit collected the carrot
                if (checkCollision(player, carrot)) {
                    if (player.lives < 5) {
                        player.lives++;
                        carrot.collected = true;
                        console.log('Carrot collected! Lives:', player.lives); // Debug log
                        return false;
                    }
                }
                
                return true;
            });

            // Update and draw obstacles
            obstacles = obstacles.filter(obs => obs.x > camera.x - obs.width);
            
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obstacle = obstacles[i];
                obstacle.x -= obstacle.speed;
                
                if (cactusImage.complete) {
                    ctx.drawImage(cactusImage, 
                        obstacle.x - camera.x, 
                        obstacle.y, 
                        obstacle.width, 
                        obstacle.height
                    );
                }
                
                if (checkCollision(player, obstacle)) {
                    if (!player.isInvulnerable) {
                        player.lives--;
                        if (player.lives <= 0) {
                            player.deathTimer = Date.now();
                            gameOver = true;
                        } else {
                            player.isInvulnerable = true;
                            player.invulnerabilityTimer = Date.now();
                        }
                    }
                }
                
                if (!obstacle.passed && player.x > obstacle.x + obstacle.width) {
                    obstacle.passed = true;
                    score++;
                }
            }

            // Handle invulnerability effect
            if (player.isInvulnerable) {
                const currentTime = Date.now();
                if (currentTime - player.invulnerabilityTimer >= player.invulnerabilityDuration) {
                    player.isInvulnerable = false;
                } else {
                    const flashInterval = 150;
                    if (Math.floor((currentTime - player.invulnerabilityTimer) / flashInterval) % 2 === 0) {
                        ctx.globalAlpha = 0.5;
                    }
                }
            }

            // Reset globalAlpha
            ctx.globalAlpha = 1.0;

            // Create new obstacles if needed
            if (obstacles.length === 0 || 
                obstacles[obstacles.length - 1].x < camera.x + canvas.width + 100) {
                const newObstacles = createObstacle();
                obstacles.push(...newObstacles);
            }

            // Draw UI elements
            // Score box
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(5, 5, 200, 100);
            ctx.fillStyle = 'black';
            ctx.font = '24px Arial bold';
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${score}`, 15, 35);
            ctx.fillText(`Level: ${level}`, 15, 65);
            ctx.fillText(`Mode: ${currentDifficulty}`, 15, 95);

            // Hearts display
            const heartSize = 30;
            const heartSpacing = 35;
            const totalHeartsWidth = (heartSize + heartSpacing) * 5 - heartSpacing;
            const heartsStartX = (canvas.width - totalHeartsWidth) / 2;
            const heartsY = 15;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(heartsStartX - 10, 5, totalHeartsWidth + 20, heartSize + 20);

            for (let i = 0; i < 5; i++) {
                const image = i < player.lives ? heartImage : emptyHeartImage;
                if (image && image.complete) {
                    ctx.drawImage(image, 
                        heartsStartX + (i * (heartSize + heartSpacing)), 
                        heartsY, 
                        heartSize, 
                        heartSize
                    );
                }
            }

            // Highest score
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(5, canvas.height - 40, 200, 35);
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.fillText(`Highest Score: ${highestScore}`, 15, canvas.height - 15);
        }
    } else {
        // Game over screen
        const timeSinceDeath = Date.now() - player.deathTimer;
        
        if (timeSinceDeath >= 1000) {
            updateHighestScore(score);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
            ctx.font = '24px Arial';
            ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
            ctx.fillText(`Highest Score: ${highestScore}`, canvas.width / 2, canvas.height / 2 + 80);
            
            restartBtn.style.display = 'block';
        }
    }
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Collision detection
function checkCollision(rect1, rect2) {
    // Add padding to make collision less sensitive
    const padding = 15; // pixels of padding around the hitbox
    return (rect1.x + padding) < (rect2.x + rect2.width - padding) &&
           (rect1.x + rect1.width - padding) > (rect2.x + padding) &&
           (rect1.y + padding) < (rect2.y + rect2.height - padding) &&
           (rect1.y + rect1.height - padding) > (rect2.y + padding);
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
    }
});

document.addEventListener('keyup', (event) => {
    if ((event.code === 'ArrowUp' || event.code === 'Space') && player.velocity < -8) {
        player.velocity = -8;
    }
});

// Function to spawn initial carrot
function spawnInitialCarrot() {
    const carrotX = camera.x + canvas.width / 2; // Place carrot in middle of screen
    const carrotY = canvas.height - 250; // Higher placement for initial carrot
    carrots.push({
        x: carrotX,
        y: carrotY,
        width: CARROT_SIZE,
        height: CARROT_SIZE,
        collected: false,
        speed: difficultySettings[currentDifficulty].obstacleSpeed
    });
    console.log('Spawned initial carrot at:', carrotX, carrotY);
}

// Modify restartGame to reset camera
function restartGame() {
    if (!currentDifficulty) {
        // If no difficulty selected, show menu
        menuContainer.style.display = 'block';
        canvas.style.display = 'none';
        restartBtn.style.display = 'none';
        return;
    }

    // Cancel any existing animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    const settings = difficultySettings[currentDifficulty];
    camera.x = 0;
    player.x = 70;
    player.y = canvas.height - player.height;
    player.jumping = false;
    player.velocity = 0;
    player.jumpCount = 0;
    player.speed = settings.playerSpeed;
    player.jumpHeight = settings.jumpHeight;
    player.maxJumps = settings.maxJumps;
    player.lives = 5;
    player.isInvulnerable = false;
    player.invulnerabilityTimer = 0;
    obstacles = [];
    carrots = [];
    lastCarrotSpawn = Date.now(); // Reset spawn timer to current time
    gameOver = false;
    score = 0;
    level = 1;
    countdown = 0;
    isMovingLeft = false;
    isMovingRight = false;
    createClouds(); // Reset cloud positions
    restartBtn.style.display = 'none'; // Hide the restart button
    gameLoop();
}

restartBtn.addEventListener('click', restartGame);

// Start the game
restartGame(); 