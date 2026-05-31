// 1. Inisialisasi Tema & Animasi GSAP
document.addEventListener('DOMContentLoaded', () => {
    // Setel Tema
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') document.body.classList.add('dark-theme');
    
    // Siapkan Modal
    createModalElement();
    
    // Jalankan Animasi
    runAnimations();
});

// LOGIKA ANIMASI GSAP
function runAnimations() {
    // Sembunyikan elemen utama sebelum animasi dimulai agar tidak berkedip
    gsap.set('.navbar', { y: -50, opacity: 0 });
    gsap.set('.container', { y: 30, opacity: 0 });

    const hasSeenSplash = sessionStorage.getItem('splashSeen');
    const tl = gsap.timeline();

    // Jika user belum melihat Splash Screen di sesi ini
    if (!hasSeenSplash) {
        // Buat elemen splash secara dinamis
        const splash = document.createElement('div');
        splash.className = 'splash-screen';
        splash.id = 'splash-screen';
        // Memecah teks menjadi rentetan span agar bisa dianimasikan bergelombang
        splash.innerHTML = `
            <div class="splash-logo">
                <span class="splash-char">V</span>
                <span class="splash-char">E</span>
                <span class="splash-char">C</span>
                <span class="splash-char">T</span>
                <span class="splash-char">I</span>
                <span class="splash-char">F</span>
                <span class="splash-char">Y</span>
                <span class="splash-char" style="color: var(--accent);">_</span>
            </div>
        `;
        document.body.appendChild(splash);

        // Timeline Animasi Splash
        tl.to('.splash-char', { y: 0, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.05 })
          .to('.splash-char', { opacity: 0, duration: 0.4, delay: 0.6, stagger: 0.03 })
          .to('#splash-screen', { yPercent: -100, duration: 0.8, ease: 'power4.inOut' })
          
          // Lanjutkan dengan masuknya halaman utama
          .to('.navbar', { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, "-=0.3")
          .to('.container', { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, "-=0.4")
          
          // Hapus splash screen dari memori setelah selesai
          .call(() => {
              document.getElementById('splash-screen').remove();
              sessionStorage.setItem('splashSeen', 'true'); // Kunci agar tidak muncul lagi
          });
    } else {
        // Jika sudah melihat splash, langsung animasi masuk halaman (Transisi Halaman)
        tl.to('.navbar', { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
          .to('.container', { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, "-=0.3");
    }
}

// 2. Fungsi Toggle Tema
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// 3. GENERATE CUSTOM MODAL
function createModalElement() {
    if (document.getElementById('custom-modal')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'custom-modal';
    
    overlay.innerHTML = `
        <div class="modal-box">
            <h3 class="modal-title" id="modal-title">Informasi</h3>
            <p class="modal-text" id="modal-text">Pesan</p>
            <div class="modal-actions" id="modal-actions"></div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function closeModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) modal.classList.remove('active');
}

// 4. OVERRIDE SHOW ALERT (Untuk pesan biasa/error)
function showAlert(message) {
    createModalElement(); // Pastikan modal ada
    const modal = document.getElementById('custom-modal');
    
    document.getElementById('modal-title').textContent = 'Sistem Informasi';
    document.getElementById('modal-text').textContent = message;
    
    // Tombol OK tunggal
    document.getElementById('modal-actions').innerHTML = `
        <button onclick="closeModal()">Mengerti</button>
    `;
    
    modal.classList.add('active');
}

// 5. CUSTOM CONFIRM (Untuk aksi berbahaya/upgrade)
function showConfirm(title, message, onConfirmCallback) {
    createModalElement();
    const modal = document.getElementById('custom-modal');
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-text').textContent = message;
    
    // Dua tombol: Batal dan Eksekusi
    document.getElementById('modal-actions').innerHTML = `
        <button class="btn-theme" onclick="closeModal()" style="border: 1px solid var(--border-color);">Batal</button>
        <button onclick="executeConfirm()">Ya, Lanjutkan</button>
    `;
    
    window.currentConfirmCallback = onConfirmCallback;
    modal.classList.add('active');
}

function executeConfirm() {
    closeModal();
    if (window.currentConfirmCallback) {
        window.currentConfirmCallback(); // Eksekusi aksi yang tertunda
        window.currentConfirmCallback = null;
    }
}

// 6. Perlindungan Halaman
function protectRoute(requiresAuth) {
    const token = localStorage.getItem('token');
    if (requiresAuth && !token) window.location.href = '/login.html';
    if (!requiresAuth && token) window.location.href = '/index.html';
}

// 7. Logout (Dengan Transisi GSAP)
function logout() {
    showConfirm('Keluar Sistem', 'Apakah Anda yakin ingin keluar dari sesi ini?', () => {
        // Mainkan animasi keluar sebelum berpindah URL
        gsap.to('.container, .navbar', {
            y: -20,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.in',
            onComplete: () => {
                localStorage.removeItem('token');
                sessionStorage.removeItem('splashSeen'); // Reset splash screen
                window.location.href = '/login.html';
            }
        });
    });
}