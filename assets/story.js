/* ============================================================
   ROSE & SCHAFER  ·  story.js
   Behavior used ONLY by story.html: scroll animations for the
   chapters, the video reveal, and the finale particle canvas.
   Shared behavior (nav, petals, footer) lives in site.js.
   ============================================================ */

/* ── SCROLL-TRIGGERED ANIMATIONS ───────────────────────────── */
const storyObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) storyObserver.unobserve(e.target), e.target.classList.add('in-view');
  }),
  { threshold: 0.08, rootMargin: '0px 0px -80px 0px' }
);
document.querySelectorAll(
  '.photo-frame, .story-text, .proposal-item, .proposal-caption, .section-eyebrow, .then-now-photo, .then-now-text'
).forEach(el => storyObserver.observe(el));

/* ── VIDEO PROMPT OBSERVER ─────────────────────────────────── */
const videoPrompt = document.getElementById('video-prompt');
const videoPromptObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) videoPrompt.classList.add('in-view'); });
}, { threshold: 0.3 });
videoPromptObserver.observe(document.getElementById('video-section'));

/* ── VIDEO PLAYBACK ────────────────────────────────────────── */
const videoPlayer  = document.getElementById('video-player');
const videoEl      = document.getElementById('save-date-video');
const playBtn      = document.getElementById('video-play-btn');
const videoSection = document.getElementById('video-section');
const closeBtn     = document.getElementById('video-close-btn');

function tryFullscreen(el) {
  if (videoEl.webkitEnterFullscreen) {
    try { videoEl.webkitEnterFullscreen(); return; } catch (e) {}
  }
  const target = el || videoPlayer;
  if (target.requestFullscreen) {
    target.requestFullscreen().catch(() => {});
  } else if (target.webkitRequestFullscreen) {
    target.webkitRequestFullscreen();
  } else if (target.msRequestFullscreen) {
    target.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else if (document.webkitFullscreenElement) {
    document.webkitExitFullscreen();
  }
}

function openVideo() {
  videoPlayer.classList.add('active');
  document.body.style.overflow = 'hidden';
  videoEl.currentTime = 0;
  videoEl.play().then(() => {
    tryFullscreen(videoPlayer);
  }).catch(() => {
    videoEl.controls = true;
  });
}

function closeVideo() {
  videoEl.pause();
  exitFullscreen();
  videoPlayer.classList.remove('active');
  document.body.style.overflow = '';
  videoEl.controls = false;
  triggerFinale();
}

playBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  openVideo();
});
videoSection.addEventListener('click', openVideo);

closeBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  closeVideo();
});

videoEl.addEventListener('ended', closeVideo);

document.addEventListener('fullscreenchange', function () {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (videoPlayer.classList.contains('active') && videoEl.ended) closeVideo();
  }
});
document.addEventListener('webkitfullscreenchange', function () {
  if (!document.webkitFullscreenElement) {
    if (videoPlayer.classList.contains('active') && videoEl.ended) closeVideo();
  }
});
videoEl.addEventListener('webkitendfullscreen', function () {
  if (videoEl.ended) closeVideo();
});

/* ── FINALE ────────────────────────────────────────────────── */
const finaleEl = document.getElementById('finale');
let finaleTriggered = false;

function triggerFinale() {
  if (finaleTriggered) return;
  finaleTriggered = true;
  finaleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    ['f-eyebrow', 'f-main', 'f-date', 'f-rule', 'f-names', 'f-footer'].forEach(id => {
      document.getElementById(id).classList.add('in-view');
    });
    initParticles();
  }, 600);
}

const finaleObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !finaleTriggered) triggerFinale();
  });
}, { threshold: 0.25 });
finaleObserver.observe(finaleEl);

/* ── PARTICLE CANVAS ───────────────────────────────────────── */
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width  = finaleEl.offsetWidth;
  canvas.height = finaleEl.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(delayed) {
    this.delayed = delayed || false;
    this.reset(true);
  }
  reset(initial) {
    this.x      = Math.random() * canvas.width;
    this.y      = initial && this.delayed
                  ? Math.random() * canvas.height
                  : canvas.height + Math.random() * 50;
    this.size   = 1 + Math.random() * 3.5;
    this.speedY = -(0.4 + Math.random() * 1.2);
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.drift  = (Math.random() - 0.5) * 0.008;
    this.angle  = Math.random() * Math.PI * 2;
    this.alpha  = 0.15 + Math.random() * 0.55;
    this.fade   = 0.0015 + Math.random() * 0.003;
    this.color  = Math.random() > 0.45 ? '#8fa882' : '#c8d6be';
  }
  update() {
    this.y      += this.speedY;
    this.x      += this.speedX;
    this.speedX += this.drift;
    this.angle  += 0.02;
    this.alpha  -= this.fade;
    if (this.y < -20 || this.alpha <= 0) this.reset(false);
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle   = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 2.2, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

let particlesRunning = false;
function initParticles() {
  particles = [];
  for (let i = 0; i < 100; i++) particles.push(new Particle(true));
  if (!particlesRunning) {
    particlesRunning = true;
    requestAnimationFrame(animateParticles);
  }
}
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
