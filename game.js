const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');
const menuContainer = document.getElementById('menu-container');
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');


// Responsive canvas sizing
function resizeCanvas() {
    const isMobile = window.innerWidth <= 768;
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isMobile) {
        if (isLandscape) {
            // Mobile landscape: maintain aspect ratio and fit to screen
            const targetAspectRatio = 2; // 1000/500 = 2:1 aspect ratio
            const maxWidth = window.innerWidth - 20;
            const maxHeight = window.innerHeight - 20;
            
            // Calculate dimensions that maintain aspect ratio
            let gameWidth = maxWidth;
            let gameHeight = gameWidth / targetAspectRatio;
            
            // If height is too tall, scale down based on height
            if (gameHeight > maxHeight) {
                gameHeight = maxHeight;
                gameWidth = gameHeight * targetAspectRatio;
            }
            
            canvas.width = gameWidth;
            canvas.height = gameHeight;
        } else {
            // Mobile portrait: use most of the width and reasonable height
            canvas.width = window.innerWidth - 10;
            canvas.height = window.innerHeight * 0.8;
        }
    } else {
        // Desktop: use original size or fit to container
        const maxWidth = Math.min(1000, window.innerWidth - 40);
        const maxHeight = Math.min(500, window.innerHeight * 0.7);
        canvas.width = maxWidth;
        canvas.height = maxHeight;
    }
    
    // Update canvas CSS to match the new dimensions
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
}

// Calculate responsive sizes based on canvas
function getResponsiveSize(baseSize, canvasDimension) {
    const scale = Math.min(canvas.width / 1000, canvas.height / 500);
    return Math.max(baseSize * scale, baseSize * 0.5); // Minimum 50% of original size
}

// Initialize canvas size
resizeCanvas();

// Handle window resize and orientation change
window.addEventListener('resize', () => {
    if (canvas.style.display !== 'none') {
        resizeCanvas();
        // Update player size when canvas resizes
        player.width = getResponsiveSize(100, canvas.width);
        player.height = getResponsiveSize(100, canvas.height);
    }
});

// Handle orientation change specifically
window.addEventListener('orientationchange', () => {
    // Wait a bit for the orientation change to complete
    setTimeout(() => {
        if (canvas.style.display !== 'none') {
            resizeCanvas();
            // Update player size when canvas resizes
            player.width = getResponsiveSize(100, canvas.width);
            player.height = getResponsiveSize(100, canvas.height);
        }
    }, 100);
});

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
    tutorialBox.style.position = 'fixed';
    tutorialBox.style.top = '50%';
    tutorialBox.style.left = '50%';
    tutorialBox.style.transform = 'translate(-50%, -50%)';
    tutorialBox.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    tutorialBox.style.padding = window.innerWidth <= 768 ? '20px' : '20px';
    tutorialBox.style.borderRadius = '10px';
    tutorialBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    tutorialBox.style.zIndex = '10000';
    tutorialBox.style.maxWidth = window.innerWidth <= 768 ? '85vw' : '400px';
    tutorialBox.style.width = window.innerWidth <= 768 ? '85vw' : '400px';
    tutorialBox.style.textAlign = 'center';
    tutorialBox.style.touchAction = 'manipulation';
    tutorialBox.style.pointerEvents = 'auto';
    tutorialBox.style.maxHeight = window.innerWidth <= 768 ? '80vh' : 'auto';
    tutorialBox.style.overflow = 'auto';

    const title = document.createElement('h2');
    title.textContent = 'How to Play';
    title.style.marginBottom = '15px';
    title.style.color = '#333';

    const instructions = document.createElement('div');
    instructions.innerHTML = `
        <p style="margin-bottom: 10px;">🐰 Help the rabbit avoid the cactuses!</p>
        <p style="margin-bottom: 10px;">⌨️ Press <strong>SPACE</strong> or <strong>UP ARROW</strong> to jump</p>
        <p style="margin-bottom: 10px;">📱 <strong>TAP</strong> the screen to jump on mobile devices</p>
        <p style="margin-bottom: 10px;">🥕 Collect carrots to gain extra lives</p>
        <p style="margin-bottom: 10px;">❤️ You start with 5 lives</p>
        <p style="margin-bottom: 15px;">🎯 Score points by passing obstacles</p>
    `;
    instructions.style.textAlign = 'left';
    instructions.style.color = '#444';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Start Playing!';
    closeButton.style.padding = window.innerWidth <= 768 ? '15px 25px' : '10px 20px';
    closeButton.style.backgroundColor = '#4CAF50';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '8px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = window.innerWidth <= 768 ? '20px' : '16px';
    closeButton.style.marginTop = '15px';
    closeButton.style.width = window.innerWidth <= 768 ? '100%' : 'auto';
    closeButton.style.touchAction = 'manipulation';
    closeButton.style.pointerEvents = 'auto';
    closeButton.style.minHeight = '50px'; // Larger touch target
    closeButton.style.fontWeight = 'bold';
    closeButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = '#45a049';
    });

    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = '#4CAF50';
    });

    // Function to close tutorial and start game
    const closeTutorial = () => {
        tutorialBox.remove();
        restartBtn.style.display = 'none';
        
        // Apply difficulty settings
        const settings = difficultySettings[difficulty];
        player.speed = settings.playerSpeed;
        player.jumpHeight = settings.jumpHeight;
        player.maxJumps = settings.maxJumps;
        
        // Start the game
        restartGame();
    };

    // Add both click and touch events
    closeButton.addEventListener('click', closeTutorial);
    closeButton.addEventListener('touchstart', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeTutorial();
    });

    tutorialBox.appendChild(title);
    tutorialBox.appendChild(instructions);
    tutorialBox.appendChild(closeButton);
    
    // Add touch event to the entire tutorial box as fallback
    tutorialBox.addEventListener('touchstart', (event) => {
        // Only close if touching the button area
        const rect = closeButton.getBoundingClientRect();
        const touch = event.touches[0];
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            event.preventDefault();
            event.stopPropagation();
            closeTutorial();
        }
    });
    
    document.body.appendChild(tutorialBox);
    
    // Add a fallback - tap anywhere to start (after 3 seconds)
    setTimeout(() => {
        const skipTutorial = (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeTutorial();
            document.removeEventListener('touchstart', skipTutorial);
            document.removeEventListener('click', skipTutorial);
        };
        
        document.addEventListener('touchstart', skipTutorial);
        document.addEventListener('click', skipTutorial);
        
        // Show a hint after 3 seconds
        setTimeout(() => {
            if (tutorialBox.parentNode) {
                const hint = document.createElement('div');
                hint.textContent = 'Tap anywhere to start!';
                hint.style.position = 'fixed';
                hint.style.bottom = '20px';
                hint.style.left = '50%';
                hint.style.transform = 'translateX(-50%)';
                hint.style.backgroundColor = 'rgba(0,0,0,0.8)';
                hint.style.color = 'white';
                hint.style.padding = '10px 20px';
                hint.style.borderRadius = '20px';
                hint.style.fontSize = '16px';
                hint.style.zIndex = '10001';
                document.body.appendChild(hint);
                
                setTimeout(() => hint.remove(), 3000);
            }
        }, 3000);
    }, 1000);
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
// CARROT_SIZE will be calculated dynamically based on canvas size
function getCarrotSize() {
    return getResponsiveSize(50, canvas.width);
}

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
    width: getResponsiveSize(100, canvas.width),
    height: getResponsiveSize(100, canvas.height),
    jumping: false,
    jumpHeight: 15, // Fixed reasonable jump height
    gravity: 0.6,  // Increased gravity for better control
    velocity: 0,
    jumpCount: 0,
    maxJumps: 2,
    speed: 5,
    facingLeft: false,
    deathTimer: 0,
    lives: 5,
    isInvulnerable: false,
    invulnerabilityTimer: 0,
    invulnerabilityDuration: 500 // Reduced to 0.5 seconds
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
            width: getCarrotSize(),
            height: getCarrotSize(),
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
            const countdownFontSize = Math.max(24, Math.min(48, canvas.width / 20));
            ctx.font = `${countdownFontSize}px Arial`;
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
            
            // Handle invulnerability effect BEFORE drawing the player
            ctx.save(); // Save the context state
            if (player.isInvulnerable) {
                const currentTime = Date.now();
                if (currentTime - player.invulnerabilityTimer >= player.invulnerabilityDuration) {
                    player.isInvulnerable = false;
                } else {
                    const flashInterval = 100;
                    if (Math.floor((currentTime - player.invulnerabilityTimer) / flashInterval) % 2 === 0) {
                        ctx.globalAlpha = 0.0; // Completely invisible
                    }
                }
            }

            // Draw the player sprite
            const currentSprite = player.jumping ? 
                rabbitSprites.jumping[jumpingFrame] : 
                rabbitSprites.walking[walkingFrame];

            if (currentSprite && currentSprite.complete) {
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
            }
            ctx.restore(); // Restore the context state after drawing player

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
            const scoreFontSize = Math.max(16, Math.min(24, canvas.width / 40));
            ctx.font = `${scoreFontSize}px Arial bold`;
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${score}`, 15, 35);
            ctx.fillText(`Level: ${level}`, 15, 65);
            ctx.fillText(`Mode: ${currentDifficulty}`, 15, 95);

            // Hearts display
            const heartSize = Math.max(20, Math.min(30, canvas.width / 30));
            const heartSpacing = Math.max(25, Math.min(35, canvas.width / 25));
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
            const highestScoreFontSize = Math.max(14, Math.min(20, canvas.width / 50));
            ctx.font = `${highestScoreFontSize}px Arial`;
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
            const gameOverFontSize = Math.max(24, Math.min(48, canvas.width / 20));
            ctx.font = `${gameOverFontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
            const gameOverScoreFontSize = Math.max(16, Math.min(24, canvas.width / 40));
            ctx.font = `${gameOverScoreFontSize}px Arial`;
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

// Handle touch input for mobile devices
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevent default touch behavior
    event.stopPropagation(); // Stop event from bubbling up
    
    console.log('Touch detected!'); // Debug log
    
    if (player.jumpCount < player.maxJumps) {
        if (!player.jumping) {
            player.jumping = true;
            player.jumpCount = 1;
        } else {
            player.jumpCount++;
        }
        player.velocity = -player.jumpHeight;
        console.log('Player jumped!'); // Debug log
    }
}, { passive: false });

canvas.addEventListener('touchend', (event) => {
    event.preventDefault(); // Prevent default touch behavior
    event.stopPropagation(); // Stop event from bubbling up
    
    if (player.velocity < -8) {
        player.velocity = -8;
    }
}, { passive: false });

// Also add touch events to the document as backup
document.addEventListener('touchstart', (event) => {
    // Only handle if the game is running and canvas is visible
    if (canvas.style.display !== 'none' && !gameOver) {
        event.preventDefault();
        console.log('Document touch detected!'); // Debug log
        
        if (player.jumpCount < player.maxJumps) {
            if (!player.jumping) {
                player.jumping = true;
                player.jumpCount = 1;
            } else {
                player.jumpCount++;
            }
            player.velocity = -player.jumpHeight;
            console.log('Player jumped from document touch!'); // Debug log
        }
    }
}, { passive: false });

// Add click event as additional fallback
canvas.addEventListener('click', (event) => {
    console.log('Canvas clicked!'); // Debug log
    if (player.jumpCount < player.maxJumps) {
        if (!player.jumping) {
            player.jumping = true;
            player.jumpCount = 1;
        } else {
            player.jumpCount++;
        }
        player.velocity = -player.jumpHeight;
        console.log('Player jumped from click!'); // Debug log
    }
});

// Add click event to document as well
document.addEventListener('click', (event) => {
    // Only handle if the game is running and canvas is visible
    if (canvas.style.display !== 'none' && !gameOver) {
        console.log('Document clicked!'); // Debug log
        
        if (player.jumpCount < player.maxJumps) {
            if (!player.jumping) {
                player.jumping = true;
                player.jumpCount = 1;
            } else {
                player.jumpCount++;
            }
            player.velocity = -player.jumpHeight;
            console.log('Player jumped from document click!'); // Debug log
        }
    }
});

// Function to spawn initial carrot
function spawnInitialCarrot() {
    const carrotX = camera.x + canvas.width / 2; // Place carrot in middle of screen
    const carrotY = canvas.height - 250; // Higher placement for initial carrot
    carrots.push({
        x: carrotX,
        y: carrotY,
        width: getCarrotSize(),
        height: getCarrotSize(),
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