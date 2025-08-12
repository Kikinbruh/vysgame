const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let groundY = 300;
let player = {
  x: 50,
  y: groundY - 40, // was groundY - 30
  width: 40,        // was 30
  height: 40,       // was 30
  vy: 0,
  jumping: false,
  hitbox: { offsetX: 0, offsetY: 0, width: 40, height: 40 } // was 30x30
};
let gravity = 0.2; // Even slower fall
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = getRandomInterval();
let speedLevel = 0;
const obstacleSpeed = 3 + speedLevel;     // how fast obstacles move left
let gameOver = false;
let jumpCount = 0; // instead of counter
let isJumpingAnim = false;
let jumpAnimFrame = 0;
let jumpAnimTimer = 0;
const jumpAnimFrameDuration = 12; // Slower animation (higher number = slower)

// Front flip animation variables
let isFrontFlipping = false;
let frontFlipRotation = 0;
let frontFlipImage = new Image();
frontFlipImage.src = "images/frnt.png";
let score = 0;
const score_timer = 15;
let current_timer = 0;
let controlsExpl = 900;
let showcontrols = true;
let mobileControlsExpl = 900;
let showmobilecontrols = false;
let showinstructions = false; // start as false
let showinstructions_timer = 900;
let isSliding = false;
let slideTimer = 0;
const slideDuration = 50; // frames
const restartBtn = document.getElementById('restartBtn');
const skipBtn = document.getElementById('skipBtn');

// Device detection
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         (window.innerWidth <= 768 && window.innerHeight <= 1024);
}

// Screen orientation handling
let isLandscape = window.innerWidth > window.innerHeight;
let isMobile = isMobileDevice();

// Apply mobile class to body for CSS targeting
if (isMobile) {
  document.body.classList.add('mobile-device');
}

function handleOrientationChange() {
  const wasLandscape = isLandscape;
  isLandscape = window.innerWidth > window.innerHeight;
  
  // Only update if orientation actually changed
  if (wasLandscape !== isLandscape) {
    updateCanvasSize();
  }
}

function updateCanvasSize() {
  if (isMobile) {
    // Mobile device behavior
    if (isLandscape) {
      // Landscape on mobile: rotate and resize to fit screen
      canvas.width = window.innerHeight; // Use height as width when rotated
      canvas.height = window.innerWidth; // Use width as height when rotated
      groundY = window.innerWidth; // Ground level is now the screen width
    } else {
      // Portrait on mobile: normal sizing
      canvas.width = 800;
      canvas.height = 600;
      groundY = 600;
    }
  } else {
    // PC behavior - no rotation, just resize
    if (isLandscape) {
      canvas.width = 1200;
      canvas.height = 400;
      groundY = 400;
    } else {
      canvas.width = 800;
      canvas.height = 600;
      groundY = 600;
    }
  }
  
  // Update player position to stay on ground
  player.y = groundY - player.height;
}

// Listen for orientation changes
window.addEventListener('resize', handleOrientationChange);
window.addEventListener('orientationchange', handleOrientationChange);

// Initial setup
updateCanvasSize();

window.addEventListener('keydown', (e) => {
  e.preventDefault();
  if (e.code === 'KeyW' || e.code === 'ArrowUp'){
  handleJumpTrigger();
}
if (e.code === 'KeyS' || e.code === 'ArrowDown') {
  startSlide();
}
});

// Touch controls for mobile
let touchStartY = null;
let touchStartX = null;
let touchMoved = false;

canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    touchMoved = false;
  }
}, { passive: false });

canvas.addEventListener('touchmove', function(e) {
  touchMoved = true;
}, { passive: true });

canvas.addEventListener('touchend', function(e) {
  e.preventDefault();
  if (touchStartY === null) return;
  let touchEndY = e.changedTouches[0].clientY;
  let touchEndX = e.changedTouches[0].clientX;
  let deltaY = touchEndY - touchStartY;
  let deltaX = touchEndX - touchStartX;
  const swipeThreshold = 40;
  // Swipe up to jump
  if (deltaX > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
    // Swipe right -> jump
    handleJumpTrigger();
  } else if (deltaX < -swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
    // Swipe left -> slide
    startSlide();
  }
  touchStartY = null;
  touchStartX = null;
  touchMoved = false;
}, { passive: false });


function handleJumpTrigger() {
  if (jumpCount < 2) {
    player.vy = -6.5;
    player.jumping = true;
    jumpCount++;
    
    if (jumpCount === 2) {
      // Second jump - start front flip
      isFrontFlipping = true;
      frontFlipRotation = 0;
      isJumpingAnim = false; // Disable regular jump animation
    } else {
      // First jump - use regular jump animation
      isJumpingAnim = true;
      jumpAnimFrame = 0;
      jumpAnimTimer = 0;
    }
  }
}

function startSlide() {
  if (!isSliding && player.y >= groundY - player.height) {
    isSliding = true;
    slideTimer = 0;
    slidingAnimFrame = 0;
    slidingAnimTimer = 0;
    player.hitbox.height = 28; // was 20, now a bit smaller than sliding sprite
    player.hitbox.offsetY = player.height - player.hitbox.height; // 12 if player.height is 40
    player.height = 32; // set to sliding sprite height
    player.y = groundY - player.height; // keep feet on ground
  }
}

const jumpFrames = [];
const totalJumpFrames = 5;
let jumpFramesLoaded = 0;

  for (let i = 1; i <= totalJumpFrames; i++) {
    const img = new Image();
    img.src = `images/jumping_frames${i}.png`;
    img.onload = () => {
      jumpFramesLoaded++;
      if (jumpFramesLoaded === totalJumpFrames) {
        gameLoop();
      }
    };
    jumpFrames.push(img);
  }

const slidingFrames = [];
const totalSlidingFrames = 8;
let slidingFramesLoaded = 0;

for (let i = 1; i <= totalSlidingFrames; i++) {
  const img = new Image();
  img.src = `images/sliding${i}.png`;
  img.onload = () => {
    slidingFramesLoaded++;
    if (slidingFramesLoaded === totalSlidingFrames) {
    }
  };
  slidingFrames.push(img);
}

const runningFrames = [];
const total_runningframes = 8;
let running_loaded = 0;
for (let i = 1; i <= total_runningframes; i++) {
  const img = new Image();
  img.src = `images/running${i}.png`;
  img.onload = () => {
    running_loaded++;
    if (running_loaded === total_runningframes) {
    }
  };
  runningFrames.push(img);
}

let slidingAnimFrame = 0;
let slidingAnimTimer = 0;
const slidingAnimFrameDuration = 8;

// Running animation variables
let runningAnimFrame = 0;
let runningAnimTimer = 0;
const runningAnimFrameDuration = 12; // Increased from 8 to 12 for slower animation 

function drawPlayer() {
  if (isSliding) {
    // Example: make sliding sprite wider
    const slidingWidth = 50; // scale up from 40
    const slidingHeight = 32; // updated sliding height
    ctx.drawImage(slidingFrames[slidingAnimFrame], player.x, player.y, slidingWidth, slidingHeight);
  } else if (isFrontFlipping) {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(frontFlipRotation * Math.PI / 180);
    ctx.drawImage(frontFlipImage, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
  } else if (isJumpingAnim) {
    ctx.drawImage(jumpFrames[jumpAnimFrame], player.x, player.y, player.width, player.height);
  } else {
    ctx.drawImage(runningFrames[runningAnimFrame], player.x, player.y, player.width, player.height);
  }
}

function drawBackground() {
  const bgSpeed = getObstacleSpeed() * 0.4;
  backgroundX -= bgSpeed;
  if (backgroundX <= -canvas.width) {
    backgroundX = 0;
  }
  ctx.drawImage(backgroundImg, Math.round(backgroundX), 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, Math.round(backgroundX + canvas.width), 0, canvas.width, canvas.height);
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  // Always draw the live score counter at the top left
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Skóre: " + score, 30, 40);
  drawPlayer();

  player.vy += gravity;
  player.y += player.vy;

  if (isSliding) {
    slideTimer++;
    slidingAnimTimer++;
    if (slidingAnimTimer >= slidingAnimFrameDuration) {
      slidingAnimTimer = 0;
      slidingAnimFrame++;
      if (slidingAnimFrame >= slidingFrames.length) {
        slidingAnimFrame = slidingFrames.length - 1; // Hold last frame
      }
    }
    // When slide ends (in gameLoop)
    if (slideTimer >= slideDuration) {
      isSliding = false;
      player.hitbox.height = 40; // restore original height
      player.hitbox.offsetY = 0;
      player.height = 40; // restore original height
      // Adjust y so feet stay on ground
      player.y = groundY - player.height;
      slidingAnimFrame = 0;
      slidingAnimTimer = 0;
    }
  }

  if (isJumpingAnim) {
    jumpAnimTimer++;
    if (jumpAnimTimer >= jumpAnimFrameDuration) {
      jumpAnimTimer = 0;
      jumpAnimFrame++;
      if (jumpAnimFrame >= jumpFrames.length) {
        jumpAnimFrame = jumpFrames.length - 1; // Hold on last frame
      }
    }
  } else if (!isSliding && player.y >= groundY - player.height) {
    // Running animation
    runningAnimTimer++;
    if (runningAnimTimer >= runningAnimFrameDuration) {
      runningAnimTimer = 0;
      runningAnimFrame++;
      if (runningAnimFrame >= runningFrames.length) {
        runningAnimFrame = 0; // Loop back to first frame
      }
    }
  }
  
  // Front flip rotation logic
  if (isFrontFlipping && player.vy > 0) {
    // Only rotate when falling (vy > 0) to sync with jump duration
    frontFlipRotation += 8; // Reduced from 15 to 8 for slower rotation
    if (frontFlipRotation >= 270) {
      frontFlipRotation = 270; // Stop at 270 degrees
    }
  }
  if (player.y >= groundY - player.height) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.jumping = false;
    jumpCount = 0;
    isJumpingAnim = false;
    jumpAnimFrame = 0;
    isFrontFlipping = false;
    frontFlipRotation = 0;
  }
  if (showcontrols) {
    ctx.fillStyle = "black";
    ctx.font = "16px 'Press Start 2P'";
    const text0 = "Ovládání pro PC";
    ctx.font = "12px 'Press Start 2P'";
    const text1 = "šipka nahoru / W pro skok, 2krát pro doublejump,";
    const text2 = "šipka dolů / S pro skrčení";
    // Left side (PC controls)
    const leftX = canvas.width / 2;
    let y = canvas.height / 2 - 40;
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillText(text0, leftX - ctx.measureText(text0).width / 2, y);
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText(text1, leftX - ctx.measureText(text1).width / 2, y + 30);
    ctx.fillText(text2, leftX - ctx.measureText(text2).width / 2, y + 60);
    controlsExpl--;
    if (controlsExpl <= 0) {
      showcontrols = false;
      showmobilecontrols = true;
      mobileControlsExpl = 900;
    }
  } else if (showmobilecontrols) {
    ctx.fillStyle = "black";
    ctx.font = "16px 'Press Start 2P'";
    const text3 = "Ovládání pro mobil";
    ctx.font = "12px 'Press Start 2P'";
    const text4 = "Potáhní nahoru pro skok, 2krát pro doublejump";
    const text5 = "Potáhní dolů pro skrčení";
    const rightX = canvas.width / 2;
    let y = canvas.height / 2 - 40;
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillText(text3, rightX - ctx.measureText(text3).width / 2, y);
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText(text4, rightX - ctx.measureText(text4).width / 2, y + 30);
    ctx.fillText(text5, rightX - ctx.measureText(text5).width / 2, y + 60);
    mobileControlsExpl--;
    if (mobileControlsExpl <= 0) {
      showmobilecontrols = false;
      showinstructions = true;
      showinstructions_timer = 900;
    }
  } else if (showinstructions) {
    ctx.fillStyle = "black";
    ctx.font = "16px 'Press Start 2P'";
    const text0 = "Na cem muzeme chodit a na cem ne?";
    const text1 = "Ano";
    const text2 = "Ne";
    ctx.fillText(text0, (canvas.width - ctx.measureText(text0).width) / 2, canvas.height / 2 - 60);
    // Draw 'Ano' label and large obstacle images
    const anoX = canvas.width / 4;
    ctx.fillText(text1, anoX - ctx.measureText(text1).width / 2, canvas.height / 2);
    let imgY = canvas.height / 2 + 10;
    let imgSize = 40;
    let imgSpacing = 10;
    let startX = anoX - ((obstacleImages.large.length * imgSize + (obstacleImages.large.length - 1) * imgSpacing) / 2);
    for (let i = 0; i < obstacleImages.large.length; i++) {
      ctx.drawImage(obstacleImages.large[i], startX + i * (imgSize + imgSpacing), imgY, imgSize, imgSize);
    }
    // Draw 'Ne' label and small obstacle images
    const neX = (canvas.width * 3) / 4;
    ctx.fillText(text2, neX - ctx.measureText(text2).width / 2, canvas.height / 2);
    startX = neX - ((obstacleImages.small.length * imgSize + (obstacleImages.small.length - 1) * imgSpacing) / 2);
    for (let i = 0; i < obstacleImages.small.length; i++) {
      ctx.drawImage(obstacleImages.small[i], startX + i * (imgSize + imgSpacing), imgY, imgSize, imgSize);
    }
    showinstructions_timer--;
    if (showinstructions_timer <= 0) {
      showinstructions = false;
      skipBtn.style.display = 'none';
    }
  }

  if (!showcontrols && !showinstructions && !showmobilecontrols) {
    obstacleTimer++;
    if (obstacleTimer >= obstacleInterval) {
      obstacleTimer = 0;
    
      const minHeight = 40;
      const maxHeight = 200;
      const minWidth = 20;
      const maxDoubleWidth = 60;
      const maxSingleWidth = 40;
      const requiresDoubleJump = Math.random() < 0.70;
      const isTopObstacle = Math.random() < 0.3;
    
      let obstacleHeight, obstacleWidth, obstacleY, obsImg;
    
      if (isTopObstacle) {
        // Top obstacle: player must slide under
        const slidingHitboxHeight = 28; // matches new sliding hitbox height
        obstacleHeight = groundY - slidingHitboxHeight;
        obstacleWidth = Math.floor(Math.random() * (7)) + 28;
        obstacleY = 0;
        obsImg = obstacleImages.up;
      } else {
        // Bottom obstacle
        obstacleHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
        obstacleWidth = requiresDoubleJump
          ? Math.floor(Math.random() * (maxDoubleWidth - minWidth + 1)) + minWidth
          : Math.floor(Math.random() * (maxSingleWidth - minWidth + 1)) + minWidth;
    
        // Clamp aspect ratio
        if (obstacleWidth > 1.5 * obstacleHeight) obstacleWidth = 1.5 * obstacleHeight;
        if (obstacleHeight > 1.5 * obstacleWidth) obstacleHeight = 1.5 * obstacleWidth;
    
        obstacleY = groundY - obstacleHeight;
    
        // ✅ Use large image if taller than player (40px)
        if (obstacleHeight > player.height + 30) {
          obsImg = obstacleImages.large[0];
        } else if (obstacleHeight > 50) {
          obsImg = obstacleImages.large[1];
        }
        else {
          obsImg = obstacleImages.small[Math.floor(Math.random() * obstacleImages.small.length)];
        }
      }
    
      obstacles.push({
        x: canvas.width,
        y: obstacleY,
        width: obstacleWidth,
        height: obstacleHeight,
        img: obsImg
      });
    
      obstacleInterval = getRandomInterval();
    }
    
    

    // Move obstacles and draw them
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= getObstacleSpeed();
      // Draw obstacle image stretched to its size
      if (obstacles[i].img && obstacles[i].img.complete) {
        ctx.drawImage(obstacles[i].img, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
      }
      // Remove if off screen
      if (obstacles[i].x + obstacles[i].width < 0) {
        obstacles.splice(i, 1);
      }
    }

    // Check for collision
    let standingOnObstacle = false;
    for (let obs of obstacles) {
      const hitbox = {
        x: player.x + (player.hitbox.offsetX || 0),
        y: player.y + (player.hitbox.offsetY || 0),
        width: player.hitbox.width || player.width,
        height: player.hitbox.height || player.height
      };
      // Check if player's feet are exactly on top of the obstacle
      const playerBottom = hitbox.y + hitbox.height;
      const obsTop = obs.y;
      const isOnTop =
        player.vy >= 0 &&
        playerBottom <= obsTop + 6 && // allow a small margin for float rounding
        playerBottom >= obsTop - 6 &&
        hitbox.x < obs.x + obs.width &&
        hitbox.x + hitbox.width > obs.x;
      // Only allow standing on large obstacles
      const isLargeObstacle = obstacleImages.large.includes(obs.img);
      if (isOnTop && isLargeObstacle) {
        // Stand on large obstacle
        player.y = obs.y - player.height;
        player.vy = 0;
        player.jumping = false;
        jumpCount = 0;
        isJumpingAnim = false;
        jumpAnimFrame = 0;
        isFrontFlipping = false;
        frontFlipRotation = 0;
        standingOnObstacle = true;
        break;
      }
      // If on top of a small obstacle, treat as deadly
      if (isOnTop && !isLargeObstacle) {
        gameOver = true;
        break;
      }
      // Otherwise, check for collision (sides or bottom)
      if (
        hitbox.x < obs.x + obs.width &&
        hitbox.x + hitbox.width > obs.x &&
        hitbox.y < obs.y + obs.height &&
        hitbox.y + hitbox.height > obs.y
      ) {
        // Only trigger game over if not standing on top of a large obstacle
        if (!(isOnTop && isLargeObstacle)) {
          gameOver = true;
          break;
        }
      }
    }
    // If not standing on any obstacle and below ground, snap to ground
    if (!standingOnObstacle && player.y > groundY - player.height) {
      player.y = groundY - player.height;
      player.vy = 0;
      player.jumping = false;
      jumpCount = 0;
      isJumpingAnim = false;
      jumpAnimFrame = 0;
      isFrontFlipping = false;
      frontFlipRotation = 0;
    }
  
    current_timer++;
    if (current_timer >= score_timer ){
      score++;
      current_timer = 0;
      if (score % 80 === 0) {
        speedLevel += 0.4;
      }
    }
  }
  if (!gameOver) {
    animationFrameId = requestAnimationFrame(gameLoop);
  } else {
    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    const score_display = "Finální skóre: " + score;
    ctx.fillText(score_display, (canvas.width - ctx.measureText(score_display).width) / 2, canvas.height / 2 + 30);
    showGameOver();
  }
}

function showGameOver() {
  restartBtn.style.display = 'block';
  restartBtn.textContent = `Hrát znovu`;
}

restartBtn.addEventListener('click', function() {
  window.location.reload();
});

skipBtn.addEventListener('click', function() {
  showinstructions = false;
  showcontrols = false;
  showmobilecontrols = false;
  skipBtn.style.display = 'none';
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  gameLoop();
});

function getRandomInterval() {
  return Math.floor(Math.random() * 185) + 90;
}

function getObstacleSpeed() {
  return 3 + speedLevel;
}

// Preload obstacle images
const obstacleImages = {
  up: new Image(),
  large: [new Image(), new Image()], // obs4, obs2
  small: [new Image(), new Image(), new Image()] // obs1, obcs5, obs3
};
obstacleImages.up.src = "images/up_obs.png";
obstacleImages.large[0].src = "images/obs4.png";
obstacleImages.large[1].src = "images/obs2.png";
obstacleImages.small[0].src = "images/obs1.png";
obstacleImages.small[1].src = "images/obcs5.png";
obstacleImages.small[2].src = "images/obs3.png";

const backgroundImg = new Image();
backgroundImg.src = "images/city.png";
let backgroundX = 0;

gameLoop();

