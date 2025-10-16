
// Dynamische Anpassung der Navigation je nach Login-Status
window.addEventListener('DOMContentLoaded', function() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const navHome = document.getElementById('nav-home');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navLogout = document.getElementById('nav-logout');

  if (navHome && isLoggedIn) {
    navHome.textContent = 'Dashboard';
    navHome.href = '/HTML/dashboard.html';
  } else if (navHome) {
    navHome.textContent = 'Home';
    navHome.href = '/HTML/home.html';
  }

  if (isLoggedIn) {
    if (navLogin) navLogin.style.display = 'none';
    if (navRegister) navRegister.style.display = 'none';
    if (navLogout) navLogout.style.display = '';
  } else {
    if (navLogin) navLogin.style.display = '';
    if (navRegister) navRegister.style.display = '';
    if (navLogout) navLogout.style.display = 'none';
  }

  if (navLogout) {
    navLogout.addEventListener('click', function() {
      localStorage.setItem('isLoggedIn', 'false');
      window.location.href = '/HTML/home.html';
    });
  }
});
