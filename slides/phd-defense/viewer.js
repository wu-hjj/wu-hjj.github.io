'use strict';
const stage = document.getElementById('stage');
const slideImage = document.getElementById('slide-image');
const videos = document.getElementById('videos');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const page = document.getElementById('page');
const hint = document.getElementById('hint');
const fullScreen = document.getElementById('fullscreen');
const viewer = document.getElementById('viewer');
let current = -1;
function hashPage() {
  const match = location.hash.match(/^#slide-(\d+)$/);
  return match ? Number(match[1]) - 1 : 0;
}
function show(index) {
  index = Math.max(0, Math.min(SLIDES.length - 1, Number.isFinite(index) ? Math.floor(index) : 0));
  if (index === current) { page.value = index + 1; return; }
  videos.querySelectorAll('video').forEach(video => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  });
  videos.replaceChildren();
  current = index;
  const slide = SLIDES[index];
  slideImage.src = slide.image;
  slideImage.alt = `Slide ${index + 1} of ${SLIDES.length}`;
  stage.setAttribute('aria-label', slideImage.alt);
  for (const [number, media] of slide.videos.entries()) {
    const video = document.createElement('video');
    video.src = media.src;
    video.poster = media.poster;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    video.muted = true;
    video.loop = true;
    video.setAttribute('aria-label', `Video ${number + 1} on slide ${index + 1}`);
    for (const [key, value] of Object.entries({left: media.x, top: media.y, width: media.w, height: media.h})) {
      video.style[key] = `${value * 100}%`;
    }
    video.addEventListener('error', () => { hint.textContent = 'This video could not load. Please reload the page to try again.'; });
    videos.append(video);
  }
  page.value = index + 1;
  previous.disabled = index === 0;
  next.disabled = index === SLIDES.length - 1;
  hint.textContent = slide.videos.length ? `${index === SLIDES.length - 1 ? 'Final slide. ' : ''}Click a video to play. Videos pause when you change slides.` : 'Use ← → to browse. Videos play when clicked.';
  if (location.hash !== `#slide-${index + 1}`) history.replaceState(null, '', `#slide-${index + 1}`);
  document.title = `Slide ${index + 1} · PhD defense · Hongjin Wu`;
  if (SLIDES[index + 1]) { const preload = new Image(); preload.src = SLIDES[index + 1].image; }
}
previous.addEventListener('click', () => show(current - 1));
next.addEventListener('click', () => show(current + 1));
document.getElementById('jump').addEventListener('submit', event => { event.preventDefault(); show(Number(page.value) - 1); page.blur(); });
page.addEventListener('change', () => show(Number(page.value) - 1));
window.addEventListener('hashchange', () => show(hashPage()));
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,video')) return;
  if (event.key === ' ' && event.target.closest('button,a')) return;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(current + 1); }
  if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
  if (event.key === 'Home') { event.preventDefault(); show(0); }
  if (event.key === 'End') { event.preventDefault(); show(SLIDES.length - 1); }
});
fullScreen.hidden = !document.fullscreenEnabled;
fullScreen.addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await viewer.requestFullscreen(); }
  catch { hint.textContent = 'Full screen is unavailable in this browser.'; }
});
document.addEventListener('fullscreenchange', () => {
  fullScreen.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  fullScreen.setAttribute('aria-label', document.fullscreenElement ? 'Exit full screen' : 'Enter full screen');
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos.querySelectorAll('video').forEach(video => video.pause());
});
let touchStart = null;
stage.addEventListener('touchstart', event => {
  touchStart = event.target.closest('video') || event.touches.length !== 1 ? null : [event.touches[0].clientX, event.touches[0].clientY];
}, {passive:true});
stage.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart[0];
  const dy = event.changedTouches[0].clientY - touchStart[1];
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  touchStart = null;
}, {passive:true});
show(hashPage());
