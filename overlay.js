const canvas = document.getElementById('character-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('character-container');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');

const CHAR_BASE = 'assets/character/Idle';
const FRAME_SIZE = 48;
const BOTTOM_CLEARANCE = 120;

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

// --- Preload ---
async function preloadAll(entryDir, exitDir) {
  const paths = [];
  for (let i = 0; i < 4; i++) paths.push(`${CHAR_BASE}/animations/Running/${entryDir}/frame_00${i}.png`);
  for (let i = 0; i < 4; i++) paths.push(`${CHAR_BASE}/animations/Running/${exitDir}/frame_00${i}.png`);
  for (let i = 0; i < 6; i++) paths.push(`${CHAR_BASE}/animations/Front_Flip-f0c316b1/${entryDir}/frame_00${i}.png`);
  for (let i = 0; i < 6; i++) paths.push(`${CHAR_BASE}/animations/Front_Flip-f0c316b1/${exitDir}/frame_00${i}.png`);
  paths.push(`${CHAR_BASE}/rotations/south.png`);
  paths.push(`${CHAR_BASE}/rotations/${exitDir}.png`);
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

function setPos(x, bottomY) {
  container.style.left = x + 'px';
  container.style.bottom = bottomY + 'px';
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// --- Run with bounce (constant speed, looping run frames) ---
function runAcross(startX, endX, dir, fps) {
  const runFrames = getFrames('Running', dir, 4);
  const frameInterval = 1000 / fps;
  const speed = 350;
  const distance = Math.abs(endX - startX);
  const duration = (distance / speed) * 1000;
  const bounceHeight = 5;

  return new Promise(resolve => {
    const t0 = performance.now();
    let lastSwap = 0;
    let frameIdx = 0;

    function tick(now) {
      const elapsed = now - t0;
      const progress = Math.min(elapsed / duration, 1);
      const x = startX + (endX - startX) * progress;
      const cycleMs = frameInterval * 4;
      const bounce = Math.abs(Math.sin(((elapsed % cycleMs) / cycleMs) * Math.PI * 2)) * bounceHeight;
      setPos(x, BOTTOM_CLEARANCE + bounce);

      if (now - lastSwap >= frameInterval) {
        drawFrame(runFrames[frameIdx % 4]);
        frameIdx++;
        lastSwap = now;
      }

      if (progress < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

// --- Play animation once with optional jump arc and optional X movement ---
function playOnce(frames, fps, arcHeight, startX, endX) {
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

      if (arcHeight) {
        const arc = Math.sin(progress * Math.PI) * arcHeight;
        container.style.bottom = (BOTTOM_CLEARANCE + arc) + 'px';
      }

      // Optional horizontal drift during flip
      if (startX !== undefined && endX !== undefined) {
        const x = startX + (endX - startX) * progress;
        container.style.left = x + 'px';
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

// ============================================
// MAIN SEQUENCE
// ============================================
async function showReminder(text) {
  // Pick random edge — ninja comes AND goes from the SAME side
  const fromRight = Math.random() > 0.5;

  // Directions: entryDir = direction ninja FACES while running in
  // fromRight: ninja runs leftward (faces west), exits rightward (faces east)
  // fromLeft:  ninja runs rightward (faces east), exits leftward (faces west)
  const entryDir = fromRight ? 'west' : 'east';
  const exitDir = fromRight ? 'east' : 'west';

  await preloadAll(entryDir, exitDir);

  const screenW = window.innerWidth;
  const edgeX = fromRight ? screenW + 20 : -160;
  const targetX = (screenW / 2) - 72 + (Math.random() - 0.5) * 160;

  setPos(edgeX, BOTTOM_CLEARANCE);
  container.style.opacity = '1';

  playChime();

  // 1) RUN IN from edge to near center
  await runAcross(edgeX, targetX, entryDir, 10);

  // 2) FRONT FLIP on arrival (facing entry direction) — with jump arc
  const entryFlipFrames = getFrames('Front_Flip-f0c316b1', entryDir, 6);
  await playOnce(entryFlipFrames, 12, 75);

  // 3) LAND — face the user (south)
  setPos(targetX, BOTTOM_CLEARANCE);
  drawFrame(imageCache[`${CHAR_BASE}/rotations/south.png`]);

  // 4) SPEECH BUBBLE
  speechText.textContent = text;
  await wait(300);
  speechBubble.classList.add('visible');

  const holdTime = 3500 + text.length * 50;
  await wait(holdTime);

  speechBubble.classList.remove('visible');
  await wait(400);

  // 5) TURN to face exit direction
  drawFrame(imageCache[`${CHAR_BASE}/rotations/${exitDir}.png`]);
  await wait(200);

  // 6) RUN BACK toward same edge
  const runEndX = fromRight ? screenW - 250 : 100;
  await runAcross(targetX, runEndX, exitDir, 10);

  // 7) FRONT FLIP out at the edge — with arc + drift off screen
  const exitFlipFrames = getFrames('Front_Flip-f0c316b1', exitDir, 6);
  await playOnce(exitFlipFrames, 12, 65, runEndX, edgeX);

  // 8) Gone
  container.style.opacity = '0';
  window.remindMe.overlayDone();
}

window.remindMe.onShowReminder(showReminder);
