const canvas = document.getElementById('character-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('character-container');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');

const CHAR_BASE = 'assets/character/Idle';
const FRAME_SIZE = 48;
const BOTTOM_CLEARANCE = 120; // px from bottom edge — clears dock/taskbar

// --- Asset loader ---
const imageCache = {};
function loadImage(src) {
  if (imageCache[src]) return Promise.resolve(imageCache[src]);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { imageCache[src] = img; resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
}

function drawFrame(img) {
  ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
  ctx.drawImage(img, 0, 0, FRAME_SIZE, FRAME_SIZE);
}

// --- Preload all needed assets ---
async function preloadAll(entryDir, exitDir) {
  const paths = [];

  for (let i = 0; i < 4; i++) paths.push(`${CHAR_BASE}/animations/Running/${entryDir}/frame_00${i}.png`);
  for (let i = 0; i < 6; i++) paths.push(`${CHAR_BASE}/animations/Front_Flip-f0c316b1/${entryDir}/frame_00${i}.png`);
  paths.push(`${CHAR_BASE}/rotations/south.png`);
  for (let i = 0; i < 10; i++) paths.push(`${CHAR_BASE}/animations/Backflip/${exitDir}/frame_00${i}.png`);
  for (let i = 0; i < 4; i++) paths.push(`${CHAR_BASE}/animations/Running/${exitDir}/frame_00${i}.png`);

  await Promise.all(paths.map(loadImage));
}

function getFrames(animName, dir, count) {
  return Array.from({ length: count }, (_, i) =>
    imageCache[`${CHAR_BASE}/animations/${animName}/${dir}/frame_00${i}.png`]
  );
}

// --- Chime ---
function playChime() {
  try {
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, actx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * 0.15 + 0.6);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(actx.currentTime + i * 0.15);
      osc.stop(actx.currentTime + i * 0.15 + 0.6);
    });
  } catch { /* silent */ }
}

// --- Helper: set position ---
function setPos(x, bottomY) {
  container.style.left = x + 'px';
  container.style.bottom = bottomY + 'px';
}

// --- Phase: Run across screen with real footstep bounce ---
function runAcross(startX, endX, entryDir, fps) {
  const runFrames = getFrames('Running', entryDir, 4);
  const frameInterval = 1000 / fps;
  const speed = 350; // px per second — constant speed = natural run
  const distance = Math.abs(endX - startX);
  const duration = (distance / speed) * 1000;
  const direction = endX > startX ? 1 : -1;
  const bounceHeight = 5; // px

  return new Promise(resolve => {
    const t0 = performance.now();
    let lastFrameSwap = 0;
    let frameIdx = 0;

    function tick(now) {
      const elapsed = now - t0;
      const progress = Math.min(elapsed / duration, 1);

      // Constant speed movement (linear) — feels like real running
      const x = startX + (endX - startX) * progress;

      // Bounce synced to run frame cycle (4 frames per cycle)
      // One full bounce per 2 frames (each "step")
      const cycleProgress = (elapsed % (frameInterval * 4)) / (frameInterval * 4);
      const bounce = Math.abs(Math.sin(cycleProgress * Math.PI * 2)) * bounceHeight;

      setPos(x, BOTTOM_CLEARANCE + bounce);

      // Swap sprite frames
      if (now - lastFrameSwap >= frameInterval) {
        drawFrame(runFrames[frameIdx % 4]);
        frameIdx++;
        lastFrameSwap = now;
      }

      if (progress < 1) requestAnimationFrame(tick);
      else resolve();
    }

    requestAnimationFrame(tick);
  });
}

// --- Phase: Play animation once (flip/backflip) with optional Y arc ---
function playOnce(frames, fps, arcHeight) {
  const interval = 1000 / fps;
  const totalDuration = frames.length * interval;
  arcHeight = arcHeight || 0;

  return new Promise(resolve => {
    const t0 = performance.now();
    let lastSwap = 0;
    let frameIdx = 0;

    function tick(now) {
      const elapsed = now - t0;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Y arc during flip (parabolic: up then down)
      if (arcHeight) {
        const arc = Math.sin(progress * Math.PI) * arcHeight;
        container.style.bottom = (BOTTOM_CLEARANCE + arc) + 'px';
      }

      if (now - lastSwap >= interval) {
        if (frameIdx < frames.length) {
          drawFrame(frames[frameIdx]);
          frameIdx++;
        }
        lastSwap = now;
      }

      if (frameIdx < frames.length || progress < 1) requestAnimationFrame(tick);
      else resolve();
    }

    requestAnimationFrame(tick);
  });
}

// --- Helper: wait ms ---
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================
// MAIN SEQUENCE
// ============================================
async function showReminder(text) {
  const fromLeft = Math.random() > 0.5;
  const entryDir = fromLeft ? 'east' : 'west';
  const exitDir = fromLeft ? 'west' : 'east';

  await preloadAll(entryDir, exitDir);

  const screenW = window.innerWidth;
  const targetX = (screenW / 2) - 72 + (Math.random() - 0.5) * 160;
  const startX = fromLeft ? -160 : screenW + 20;

  // Position off-screen, make visible
  setPos(startX, BOTTOM_CLEARANCE);
  container.style.opacity = '1';

  playChime();

  // 1) RUN IN — constant speed, bouncing footsteps
  await runAcross(startX, targetX, entryDir, 10);

  // 2) FRONT FLIP on arrival — with jump arc
  const flipFrames = getFrames('Front_Flip-f0c316b1', entryDir, 6);
  await playOnce(flipFrames, 12, 40);

  // 3) LAND — snap to ground, show south-facing idle
  setPos(targetX, BOTTOM_CLEARANCE);
  const southImg = imageCache[`${CHAR_BASE}/rotations/south.png`];
  drawFrame(southImg);

  // 4) SPEECH BUBBLE
  speechText.textContent = text;
  await wait(300);
  speechBubble.classList.add('visible');

  const holdTime = 3500 + text.length * 50;
  await wait(holdTime);

  speechBubble.classList.remove('visible');
  await wait(400);

  // 5) BACKFLIP before exit — with jump arc
  const backflipFrames = getFrames('Backflip', exitDir, 10);
  await playOnce(backflipFrames, 12, 35);

  // 6) RUN OUT — constant speed, bouncing
  const exitX = fromLeft ? screenW + 20 : -160;
  setPos(targetX, BOTTOM_CLEARANCE);

  await runAcross(targetX, exitX, exitDir, 10);

  // Done
  window.remindMe.overlayDone();
}

window.remindMe.onShowReminder(showReminder);
