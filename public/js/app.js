(function () {
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
})();

document.addEventListener('DOMContentLoaded', () => {
  createModal();
  runEntranceAnimation();
});

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/* ── Entrance animation (GSAP) ─────────────────────────── */
function runEntranceAnimation() {
  const hasSeen = sessionStorage.getItem('splashSeen');

  gsap.set('.navbar', { y: -40, opacity: 0 });
  gsap.set('.anim-target', { y: 24, opacity: 0 });

  const tl = gsap.timeline();

  if (!hasSeen) {
    const splash = document.createElement('div');
    splash.className = 'splash-screen';
    splash.id = 'splash';
    splash.innerHTML = `<div class="splash-logo">
      <span class="splash-char">V</span>
      <span class="splash-char">E</span>
      <span class="splash-char">C</span>
      <span class="splash-char">T</span>
      <span class="splash-char">I</span>
      <span class="splash-char">F</span>
      <span class="splash-char">Y</span>
      <span class="splash-char accent">_</span>
    </div>`;
    document.body.appendChild(splash);

    tl.to('.splash-char',   { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.055 })
      .to('.splash-char',   { y: -20, opacity: 0, duration: 0.35, delay: 0.5, stagger: 0.03 })
      .to('#splash',        { opacity: 0, duration: 0.4, ease: 'power2.out' })
      .call(() => { document.getElementById('splash')?.remove(); sessionStorage.setItem('splashSeen', '1'); })
      .to('.navbar',        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.1')
      .to('.anim-target',   { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.07 }, '-=0.3');
  } else {
    tl.to('.navbar',      { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' })
      .to('.anim-target', { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.06 }, '-=0.2');
  }
}

/* ── Modal ─────────────────────────────────────────────── */
function createModal() {
  if (document.getElementById('_modal')) return;
  const el = document.createElement('div');
  el.className = 'modal-overlay'; el.id = '_modal';
  el.innerHTML = `
    <div class="modal-box">
      <h3 class="modal-title" id="_mt">Info</h3>
      <p  class="modal-text"  id="_mb">—</p>
      <div class="modal-actions" id="_ma"></div>
    </div>`;
  document.body.appendChild(el);
}

function closeModal() { document.getElementById('_modal')?.classList.remove('active'); }

function showAlert(msg, title = 'Perhatian') {
  createModal();
  document.getElementById('_mt').textContent = title;
  document.getElementById('_mb').textContent = msg;
  document.getElementById('_ma').innerHTML =
    `<button class="btn-confirm" onclick="closeModal()">Mengerti</button>`;
  document.getElementById('_modal').classList.add('active');
}

function showConfirm(title, msg, onYes, danger = false) {
  createModal();
  document.getElementById('_mt').textContent = title;
  document.getElementById('_mb').textContent = msg;
  document.getElementById('_ma').innerHTML = `
    <button class="btn-cancel"  onclick="closeModal()">Batal</button>
    <button class="btn-confirm ${danger ? 'danger' : ''}" onclick="_execConfirm()">Ya, Lanjutkan</button>`;
  window._confirmCb = onYes;
  document.getElementById('_modal').classList.add('active');
}

function _execConfirm() {
  closeModal();
  if (window._confirmCb) { window._confirmCb(); window._confirmCb = null; }
}

/* ── Auth guard ────────────────────────────────────────── */
function protectRoute(requiresAuth) {
  const token = localStorage.getItem('token');
  if (requiresAuth && !token) window.location.href = '/login.html';
  if (!requiresAuth && token) window.location.href = '/index.html';
}

/* ── Logout ────────────────────────────────────────────── */
function logout() {
  showConfirm('Keluar', 'Apakah Anda yakin ingin mengakhiri sesi ini?', () => {
    gsap.to('.navbar, .anim-target', {
      y: -16, opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('splashSeen');
        window.location.href = '/login.html';
      }
    });
  });
}
