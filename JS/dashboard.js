// dashboard.js - Dashboard-spezifische Funktionen
document.addEventListener('DOMContentLoaded', function() {
    updateDashboardUserInfo();
    initDailyBonusUI();
    updateDashboardStats();

    // Optional: Bonus per URL-Parameter einmalig zurücksetzen (?resetBonus=1)
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('resetBonus') === '1') {
            resetDailyBonus();
            params.delete('resetBonus');
            const newUrl = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}${location.hash}`;
            window.history.replaceState({}, document.title, newUrl);
        }
    } catch (e) {
        // still fine without URL API
    }
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

function updateDashboardStats() {
    try {
        const wonEl = document.getElementById('stats-won');
        const spentEl = document.getElementById('stats-spent');
        if (!wonEl || !spentEl) return;

        const won = (typeof CoinsManager !== 'undefined' && CoinsManager.getTotalWon) ? CoinsManager.getTotalWon() : 0;
        const spent = (typeof CoinsManager !== 'undefined' && CoinsManager.getTotalSpent) ? CoinsManager.getTotalSpent() : 0;
        const fmt = (typeof CoinsManager !== 'undefined' && CoinsManager.formatNumber) ? CoinsManager.formatNumber.bind(CoinsManager) : (n)=>String(n);

        wonEl.innerHTML = `${fmt(won)} <i class="ri-coin-line"></i>`;
        spentEl.innerHTML = `${fmt(spent)} <i class="ri-coin-line"></i>`;
    } catch (e) {}
}

// Live-Updates für Statistik
window.addEventListener('statschange', updateDashboardStats);
window.addEventListener('storage', (e) => {
    if (e.key === 'coinsWonTotal' || e.key === 'coinsSpentTotal') {
        updateDashboardStats();
    }
});

// Daily Bonus Logic
const DAILY_BONUS_KEY = 'dailyBonusLastClaimDate';
const DAILY_BONUS_AMOUNT = 500;

function getTodayString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`; // Lokales Datum (YYYY-MM-DD)
}

function setDailyBonusClaimedUI() {
    const promoCard = document.querySelector('.promo-card');
    if (!promoCard) return;

    promoCard.classList.add('disabled');

    const msg = promoCard.querySelector('p');
    if (msg) {
        msg.textContent = 'Täglicher Bonus wurde bereits eingeholt! Komme morgen wieder!';
    }

    const btn = promoCard.querySelector('.claim-btn');
    if (btn) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
    }
}

function initDailyBonusUI() {
    try {
        const last = localStorage.getItem(DAILY_BONUS_KEY);
        if (last === getTodayString()) {
            setDailyBonusClaimedUI();
        }
    } catch (e) {
        // localStorage evtl. nicht verfügbar – UI bleibt im Standardzustand
    }
}

function showToast(message) {
    try {
        // Entferne evtl. vorhandenen Toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        document.body.appendChild(toast);

        // Reflow, dann anzeigen
        void toast.offsetWidth;
        toast.classList.add('toast--show');

        setTimeout(() => {
            toast.classList.remove('toast--show');
            setTimeout(() => toast.remove(), 250);
        }, 2500);
    } catch (e) {
        // Fallback
        alert(message);
    }
}

function claimDailyBonus() {
    const today = getTodayString();
    try {
        const last = localStorage.getItem(DAILY_BONUS_KEY);
        if (last === today) {
            // Bereits abgeholt – nur UI-Status setzen
            setDailyBonusClaimedUI();
            return;
        }
    } catch (e) {
        // Ignoriere Storage-Fehler, gewähre Bonus einmalig in dieser Session
    }

    // Coins gutschreiben
    if (typeof CoinsManager !== 'undefined' && typeof CoinsManager.addCoins === 'function') {
        CoinsManager.addCoins(DAILY_BONUS_AMOUNT);
    }

    // Persistieren, dass der Bonus heute eingelöst wurde
    try {
        localStorage.setItem(DAILY_BONUS_KEY, today);
    } catch (e) {
        // Falls Storage fehlschlägt, UI trotzdem aktualisieren
    }

    // UI aktualisieren
    setDailyBonusClaimedUI();

    // Hinweis anzeigen
    showToast('🎉 Du hast 500 Coins erhalten!');
}

// Dev/Test-Helfer: Bonus zurücksetzen und UI entsperren
function resetDailyBonus() {
    try {
        localStorage.removeItem(DAILY_BONUS_KEY);
    } catch (e) {}

    const promoCard = document.querySelector('.promo-card');
    if (promoCard) {
        promoCard.classList.remove('disabled');
        const msg = promoCard.querySelector('p');
        if (msg) {
            msg.textContent = 'Logge dich täglich ein und erhalte 500 Bonus-Münzen!';
        }
        const btn = promoCard.querySelector('.claim-btn');
        if (btn) {
            btn.disabled = false;
            btn.removeAttribute('aria-disabled');
            btn.style.pointerEvents = '';
            btn.style.opacity = '';
        }
    }

    // global verfügbar machen für Konsole
    try { window.resetDailyBonus = resetDailyBonus; } catch (e) {}
    showToast('🔄 Täglicher Bonus wurde zurückgesetzt.');
}