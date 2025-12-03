/**
 * ================================================
 * LOGIN PAGE (Firebase Authentication Version)
 * ================================================
 */

// Generate particles background (original code)
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 5 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';

        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';

        container.appendChild(particle);
    }
}
createParticles();


// =======================================================
// FIREBASE LOGIN HANDLE (FIXED)
// =======================================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    //  FIX PENTING → menggunakan ID yang benar: "eamail"
   const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAlert('Mohon isi email dan password!', 'warning');
        return;
    }

    try {
        // Login ke Firebase Authentication
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        showAlert('Login berhasil! Mengalihkan ke dashboard...', 'success');

        // Simpan session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', user.email);
        sessionStorage.setItem('loginTime', new Date().toISOString());

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1200);

    } catch (error) {
        console.error(error);

        if (error.code === "auth/user-not-found") {
            showAlert("Akun tidak ditemukan!", "danger");
        } else if (error.code === "auth/wrong-password") {
            showAlert("Password salah!", "danger");
        } else if (error.code === "auth/invalid-email") {
            showAlert("Format email tidak valid!", "danger");
        } else {
            showAlert("Login gagal: " + error.message, "danger");
        }

        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s';
        setTimeout(() => { loginCard.style.animation = ''; }, 500);
    }
});


// =======================================================
// Fungsi Alert (original)
// =======================================================
function showAlert(message, type) {
    const oldAlert = document.querySelector('.alert-custom');
    if (oldAlert) oldAlert.remove();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show alert-custom`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.5s ease;
    `;
    alert.innerHTML = `
        <strong>${type === 'success' ? '✓' : type === 'danger' ? '✗' : 'ℹ'}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}


// =======================================================
// CSS Animasi (original)
// =======================================================
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
`;
document.head.appendChild(style);


// =======================================================
// Auto redirect jika sudah login
// =======================================================
window.addEventListener('load', () => {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
});

// Prevent back button after logout
window.addEventListener('pageshow', function(event) {
    if (event.persisted) window.location.reload();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    // Logout Firebase
    firebase.auth().signOut().then(() => {
        console.log("Signed out!");

        // Hapus session login
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("loginTime");

        // Redirect ke login
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Logout error:", error);
    });
    // =======================================================
// CHECK IF ALREADY LOGGED IN WITH FIREBASE
// =======================================================
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User sudah login via Firebase, redirect ke dashboard
        console.log('User already logged in:', user.email);
        window.location.href = 'dashboard.html';
    }
});
});
