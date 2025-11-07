// Mock-Benutzerdaten (ersetzen später durch echte Datenbank)
const mockUsers = [
    { username: "test", email: "test@example.com", password: "123456" },
    { username: "admin", email: "admin@example.com", password: "admin123" }
];

// Mock-Benutzer + gespeicherte Benutzer kombinieren
function getUsers() {
    const storedUsers = localStorage.getItem('registeredUsers');
    const savedUsers = storedUsers ? JSON.parse(storedUsers) : [];
    return [...mockUsers, ...savedUsers];
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
    const loginRequiredPage = '/HTML/login-required.html';
    const isLoginRequiredPage = currentPage === loginRequiredPage;
    
    // Dashboard + Spieleübersicht geschützt
    const protectedPages = ['/HTML/dashboard.html', '/HTML/spiele.html'];
    const isGamePage = currentPage.startsWith('/Spiele/') && currentPage.endsWith('.html');
    
    if (!isLoggedIn) {
        if ((protectedPages.includes(currentPage) || isGamePage) && !isLoginRequiredPage) {
            window.location.href = loginRequiredPage;
        }
        return;
    }
    
    if (isLoginRequiredPage) {
        window.location.href = '/HTML/spiele.html';
        return;
    }
    
    if (
        currentPage.includes('login.html') ||
        currentPage.includes('registrierung.html') ||
        currentPage.includes('home.html')
    ) {
        window.location.href = '/HTML/dashboard.html';
    }
}
