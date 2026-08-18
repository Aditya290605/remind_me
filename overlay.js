const container = document.getElementById('character-container');
const charImg = document.getElementById('character-img');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');

// Synthesize a cute chime — ascending C major arpeggio, no audio file needed
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.6);
    });
  } catch {
    // Audio not available, silent fallback
  }
}

function showReminder(text) {
  // Pick random direction: left or right
  const fromLeft = Math.random() > 0.5;
  const screenW = window.innerWidth;

  // Position: walk to roughly center-ish area (with some randomness)
  const targetX = screenW / 2 - 90 + (Math.random() - 0.5) * 200;

  // Start off-screen
  const startX = fromLeft ? -250 : screenW + 50;
  container.style.left = startX + 'px';
  container.style.opacity = '1';

  // Flip character to face walking direction
  charImg.src = 'assets/character-walk.jpg';
  charImg.style.transform = fromLeft ? 'scaleX(1)' : 'scaleX(-1)';
  container.classList.add('walking');

  // Play chime
  playChime();

  // Phase 1: Walk in
  const walkInDuration = 2000;
  const startTime = performance.now();

  function animateWalkIn(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / walkInDuration, 1);
    // Ease out
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentX = startX + (targetX - startX) * eased;
    container.style.left = currentX + 'px';

    if (progress < 1) {
      requestAnimationFrame(animateWalkIn);
    } else {
      onArrived(fromLeft);
    }
  }

  requestAnimationFrame(animateWalkIn);

  function onArrived(fromLeft) {
    // Stop walking, switch to speaking sprite
    container.classList.remove('walking');
    container.classList.add('idle');
    charImg.src = 'assets/character-speak.jpg';
    charImg.style.transform = 'scaleX(1)'; // Face forward

    // Show speech bubble
    speechText.textContent = text;
    setTimeout(() => {
      speechBubble.classList.add('visible');
    }, 300);

    // Phase 2: Hold for a while, then leave
    const holdTime = 4000 + text.length * 50; // Longer text = more time
    setTimeout(() => {
      // Hide speech bubble
      speechBubble.classList.remove('visible');

      setTimeout(() => {
        // Phase 3: Walk out
        walkOut(fromLeft);
      }, 400);
    }, holdTime);
  }

  function walkOut(fromLeft) {
    container.classList.remove('idle');
    container.classList.add('walking');
    charImg.src = 'assets/character-walk.jpg';

    // Walk back the way she came
    const exitX = fromLeft ? -250 : screenW + 50;
    charImg.style.transform = fromLeft ? 'scaleX(-1)' : 'scaleX(1)'; // Face exit direction

    const currentLeft = parseFloat(container.style.left);
    const walkOutDuration = 2000;
    const outStart = performance.now();

    function animateWalkOut(now) {
      const elapsed = now - outStart;
      const progress = Math.min(elapsed / walkOutDuration, 1);
      const eased = Math.pow(progress, 2); // Ease in
      const currentX = currentLeft + (exitX - currentLeft) * eased;
      container.style.left = currentX + 'px';

      if (progress >= 0.7) {
        container.style.opacity = String(1 - (progress - 0.7) / 0.3);
      }

      if (progress < 1) {
        requestAnimationFrame(animateWalkOut);
      } else {
        // Done — tell main process to close overlay
        window.remindMe.overlayDone();
      }
    }

    requestAnimationFrame(animateWalkOut);
  }
}

// Listen for reminder trigger from main process
window.remindMe.onShowReminder((text) => {
  showReminder(text);
});
