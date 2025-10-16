// Mock-Benutzerdaten (ersetzen später durch echte Datenbank)
const mockUsers = [
    { username: "test", email: "test@example.com", password: "123456" },
    { username: "admin", email: "admin@example.com", password: "admin123" }
];

// Mock-Benutzer + gespeicherte Benutzer kombinieren
function getUsers() {
    const storedUsers = localStorage.getItem('registeredUsers');
    const savedUsers = storedUsers ? JSON.parse(storedUsers) : [];
    return [
        { username: "test", email: "test@example.com", password: "123456" },
        { username: "admin", email: "admin@example.com", password: "admin123" },
        ...savedUsers
    ];
}

document.addEventListener('DOMContentLoaded', function() {
    // Login-Formular
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.querySelector('input[placeholder="Benutzername"]').value;
            const password = document.querySelector('input[placeholder="Passwort"]').value;
            
            if (handleLogin(username, password)) {
                alert('Login erfolgreich!');
                window.location.href = '/HTML/dashboard.html';
            } else {
                alert('Falscher Benutzername oder Passwort!');
            }
        });
    }
    
    // Registrierungs-Formular
    const registerForm = document.querySelector('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.querySelector('input[placeholder="Benutzername"]').value;
            const email = document.querySelector('input[placeholder="E-Mail"]').value;
            const password = document.querySelector('input[placeholder="Passwort"]').value;
            
            if (handleRegistration(username, email, password)) {
                alert('Registrierung erfolgreich! Bitte loggen Sie sich ein.');
                window.location.href = '/HTML/login.html';
            }
        });
    }
    
    // Prüfe Login-Status auf geschützten Seiten
    checkLoginStatus();
});

// Login-Funktion
function handleLogin(username, password) {
    const allUsers = getUsers();
    const user = allUsers.find(u => 
        (u.username === username || u.email === username) && 
        u.password === password
    );
    
    if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userUsername', user.username);
        localStorage.setItem('userEmail', user.email);
        return true;
    }
    return false;
}

// Registrierungs-Funktion
function handleRegistration(username, email, password) {
    const allUsers = getUsers();
    const userExists = allUsers.find(u => u.username === username || u.email === email);
    
    if (userExists) {
        alert('Benutzername oder E-Mail bereits vergeben!');
        return false;
    }
    
    // Neuen Benutzer speichern
    const newUser = { username, email, password };
    const storedUsers = localStorage.getItem('registeredUsers');
    const savedUsers = storedUsers ? JSON.parse(storedUsers) : [];
    savedUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(savedUsers));
    
    console.log('Neuer Benutzer registriert:', newUser);
    return true;
}

// Prüfe Login-Status
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname;
    
    // Dashboard + Spiele sind geschützt
    const protectedPages = ['/HTML/dashboard.html', '/HTML/spiele.html'];
    
    // Wenn auf GESCHÜTZTER Seite und nicht eingeloggt → zur Login-Seite
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        window.location.href = '/HTML/login.html';
        return;
    }
    
    // Wenn auf Login/Registrierung und bereits eingeloggt → zum Dashboard
    if ((currentPage.includes('login.html') || currentPage.includes('registrierung.html')) && isLoggedIn) {
        window.location.href = '/HTML/dashboard.html';
        return;
    }
    
    // Wenn auf home.html und eingeloggt → zum Dashboard
    if (currentPage.includes('home.html') && isLoggedIn) {
        window.location.href = '/HTML/dashboard.html';
        return;
    }
    
    // Update Navigation basierend auf Login-Status
    updateNavigation();
}

// Navigation anpassen basierend auf Login-Status
function updateNavigation() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userUsername = localStorage.getItem('userUsername');
    
    // Navigation Buttons updaten
    const navBtns = document.querySelector('.nav__btns');
    if (navBtns) {
        if (isLoggedIn) {
            navBtns.innerHTML = `
                <span style="color: var(--text-dark); padding: 0.5rem 1rem;">
                    Hallo, <strong>${userUsername}</strong>
                </span>
                <button class="btn sign__in" onclick="handleLogout()">
                    <i class="ri-logout-box-r-line"></i> Abmelden
                </button>
            `;
        } else {
            navBtns.innerHTML = `
                <a href="/HTML/registrierung.html" class="btn sign__up">Registrieren</a>
                <a href="/HTML/login.html" class="btn sign__in">Anmelden</a>
            `;
        }
    }
    
    // ✅ AUTOMATISCHE NAVIGATION: Links für eingeloggte/nicht-eingeloggte Benutzer
    updateNavLinks(isLoggedIn);
}

// ✅ AUTOMATISCHE NAVIGATION: Links anpassen
function updateNavLinks(isLoggedIn) {
    const navLinks = document.querySelector('.nav__links');
    if (!navLinks) return;
    
    const links = navLinks.querySelectorAll('a');
    const currentPage = window.location.pathname;
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        
        if (isLoggedIn) {
            // EINGELOGGT: Home → Dashboard ändern
            if (href === '/HTML/home.html') {
                link.setAttribute('href', '/HTML/dashboard.html');
                link.textContent = 'Dashboard';
            }
        } else {
            // NICHT EINGELOGGT: Dashboard → Home ändern
            if (href === '/HTML/dashboard.html') {
                link.setAttribute('href', '/HTML/home.html');
                link.textContent = 'Home';
            }
        }
        
        // Aktuelle Seite markieren
        if (href === currentPage || 
            (currentPage.includes('dashboard.html') && href === '/HTML/dashboard.html') ||
            (currentPage.includes('home.html') && href === '/HTML/home.html')) {
            link.style.borderBottom = '4px solid var(--primary-color)';
        } else {
            link.style.borderBottom = '4px solid transparent';
        }
    });
    
    // Logo-Link anpassen
    const navLogo = document.querySelector('.nav__logo a');
    if (navLogo) {
        if (isLoggedIn) {
            navLogo.setAttribute('href', '/HTML/dashboard.html');
        } else {
            navLogo.setAttribute('href', '/HTML/home.html');
        }
    }
}

// Logout-Funktion
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userUsername');
    localStorage.removeItem('userEmail');
    window.location.href = '/HTML/home.html';
}

// Globale Funktion verfügbar machen
window.handleLogout = handleLogout;