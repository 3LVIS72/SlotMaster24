
// Dynamische Anpassung der Navigation je nach Login-Status
window.addEventListener('DOMContentLoaded', function() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const navHome = document.getElementById('nav-home');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navLogout = document.getElementById('nav-logout');
  const navCoins = document.getElementById('nav-coins');
  const navLogo = document.querySelector('.nav__logo a');
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');
  const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;

  const highlightActiveLink = () => {
    if (!navLinks) return;
    const currentPath = window.location.pathname;
    navLinks.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      const isMatch =
        href === currentPath ||
        (currentPath.includes('dashboard.html') && href === '/HTML/dashboard.html') ||
        (currentPath.includes('home.html') && href === '/HTML/home.html');
      link.style.borderBottom = isMatch ? '4px solid var(--primary-color)' : '4px solid transparent';
    });
  };

  // Menü-Button Funktionalität für mobile Ansicht
  if (menuBtn && navLinks && menuIcon && !window.__slotNavMenuInitialized) {
    const closeMenu = () => {
      navLinks.classList.remove('open');
      menuIcon.className = 'ri-menu-line';
      document.body.style.overflow = '';
    };

    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      menuIcon.className = isOpen ? 'ri-close-line' : 'ri-menu-line';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.addEventListener('click', (evt) => {
      if (evt.target.tagName === 'A') {
        closeMenu();
      }
    });

    document.addEventListener('click', (evt) => {
      if (!navLinks.contains(evt.target) && !menuBtn.contains(evt.target)) {
        closeMenu();
      }
    });

    window.__slotNavMenuInitialized = true;
  }

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
    if (navCoins) navCoins.style.display = '';
  } else {
    if (navLogin) navLogin.style.display = '';
    if (navRegister) navRegister.style.display = '';
    if (navLogout) navLogout.style.display = 'none';
    if (navCoins) navCoins.style.display = 'none';
  }

  if (navLogout) {
    navLogout.addEventListener('click', function() {
      localStorage.setItem('isLoggedIn', 'false');
      window.location.href = '/HTML/home.html';
    });
  }

  if (navLogo) {
    navLogo.href = isLoggedIn ? '/HTML/dashboard.html' : '/HTML/home.html';
  }

  highlightActiveLink();
});
