// dashboard.js - Dashboard-spezifische Funktionen
document.addEventListener('DOMContentLoaded', function() {
    updateDashboardUserInfo();
});

function updateDashboardUserInfo() {
    const username = localStorage.getItem('userUsername');
    const email = localStorage.getItem('userEmail');
    
    // Benutzerinfo in Dashboard anzeigen
    document.getElementById('dashboard-username').textContent = username || 'Spieler';
    document.getElementById('detail-username').textContent = username || '-';
    document.getElementById('detail-email').textContent = email || '-';

    // Wenn CoinsManager vorhanden ist, Dashboard-Coin-Anzeige aktualisieren
    if (typeof CoinsManager !== 'undefined' && CoinsManager.updateCoinsDisplay) {
        CoinsManager.updateCoinsDisplay();
    }
}

function claimDailyBonus() {
    alert('🎉 Täglicher Bonus von 500 Münzen wurde deinem Konto gutgeschrieben!');
    // Hier später die Logik für Bonus-Guthaben
}