const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let player = { x: 50, y: 250, width: 30, height: 30, vy: 0, jumping: false };
let gravity = 1;
let obstacles = [];
let gameOver = false;
let jumpCount = 0; // instead of counter

// Keydown event listener (must be after player is defined)
window.addEventListener('keydown', (e) => {
  console.log("jump")
  if (e.code === 'Space' && jumpCount < 2) {
    e.preventDefault();
    player.vy = -15;
    player.jumping = true;
    jumpCount++;
  }
});

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Gravity
  player.vy += gravity;
  player.y += player.vy;

  if (player.y >= 250) {
    player.y = 250;
    player.vy = 0;
    player.jumping = false;
    jumpCount = 0; // reset jumps when on the ground
  }

  // TODO: Draw obstacles, check collisions, add controls

  if (!gameOver) requestAnimationFrame(gameLoop);
}

gameLoop();
