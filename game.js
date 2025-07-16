const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerrunning = new Image();
playerrunning.src = "https://kikinbruh.github.io/vysgame/images/figure.png";
let playerReady = false;
playerrunning.onload = () => {
  playerReady = true;
  gameLoop();
};

// Game variables
let player = { x: 50, y: 250, width: 30, height: 30, vy: 0, jumping: false };
let gravity = 0.2; // Even slower fall
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = getRandomInterval();
const obstacleSpeed = 3;     // how fast obstacles move left
let gameOver = false;
let jumpCount = 0; // instead of counter
let isJumpingAnim = false;
let jumpAnimFrame = 0;
let jumpAnimTimer = 0;
const jumpAnimFrameDuration = 12; // Slower animation (higher number = slower)
let score = 0;
const score_timer = 15;
let current_timer = 0;

// Keydown event listener (must be after player is defined)
window.addEventListener('keydown', (e) => {
  console.log("jump")
  if (e.code === 'Space' && jumpCount < 2) {
    e.preventDefault();
    player.vy = -6.5;   // Higher jump
    player.jumping = true;
    jumpCount++;
    isJumpingAnim = true;
    jumpAnimFrame = 0;
    jumpAnimTimer = 0;
  }
});

const jumpFrames = [];
const totalJumpFrames = 5;
let jumpFramesLoaded = 0;

  for (let i = 1; i <= totalJumpFrames; i++) {
    const img = new Image();
    img.src = `https://kikinbruh.github.io/vysgame/images/jumping_frames${i}.png`;
    img.onload = () => {
      jumpFramesLoaded++;
      if (jumpFramesLoaded === totalJumpFrames) {
        playerReady = true;
        gameLoop();
      }
    };
    jumpFrames.push(img);
  }

function drawPlayer() {
  if (playerReady) {
    if (isJumpingAnim) {
      ctx.drawImage(jumpFrames[jumpAnimFrame], player.x, player.y, player.width, player.height);
    } else {
      ctx.drawImage(playerrunning, player.x, player.y, player.width, player.height);
    }
  }
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Skóre: " + score, 30, 30);


  
  drawPlayer();

  player.vy += gravity;
  player.y += player.vy;

  if (isJumpingAnim) {
    jumpAnimTimer++;
    if (jumpAnimTimer >= jumpAnimFrameDuration) {
      jumpAnimTimer = 0;
      jumpAnimFrame++;
      if (jumpAnimFrame >= jumpFrames.length) {
        jumpAnimFrame = jumpFrames.length - 1; // Hold on last frame
      }
    }
  }
  if (player.y >= 250) {
    player.y = 250;
    player.vy = 0;
    player.jumping = false;
    jumpCount = 0;
    isJumpingAnim = false;
    jumpAnimFrame = 0;
  }

  // Spawn new obstacles
  obstacleTimer++;
  if (obstacleTimer >= obstacleInterval) {
    obstacleTimer = 0;
    const minHeight = 20;
    const maxHeight = 90;
    const doubleJumpMin = 50;
    const minWidth = 20;
    const maxDoubleWidth = 80;
    const maxSingleWidth = 40;
    const requiresDoubleJump = Math.random() < 0.80;

    const obstacleHeight = requiresDoubleJump
      ? Math.floor(Math.random() * (maxHeight - doubleJumpMin)) + doubleJumpMin
      : Math.floor(Math.random() * (doubleJumpMin - minHeight)) + minHeight;

    const obstacleWidth = requiresDoubleJump
      ? Math.floor(Math.random() * (maxDoubleWidth - minWidth)) + minWidth
      : Math.floor(Math.random() * (maxSingleWidth - minWidth)) + minWidth;
    const groundY = 300;
    const obstacleY = groundY - obstacleHeight;

    obstacles.push({
      x: canvas.width,
      y: obstacleY,
      width: obstacleWidth,
      height: obstacleHeight
    });
    obstacleInterval = getRandomInterval();
  }

  // Move obstacles and draw them
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= obstacleSpeed;
    ctx.fillStyle = "black";
    ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);

    // Remove if off screen
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
    }
  }

  // Check for collision
  for (let obs of obstacles) {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameOver = true;
      alert("Finalní skóre " + score  + "!");
      return;
    }
  }
  current_timer++;
  if (current_timer >= score_timer ){
    score++;
    current_timer = 0;
  }
  if (!gameOver) requestAnimationFrame(gameLoop);
}

function getRandomInterval() {
  // For example, between 80 and 200 frames
  return Math.floor(Math.random() * 185) + 90;
}

gameLoop();
