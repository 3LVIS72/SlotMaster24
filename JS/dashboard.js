// dashboard.js - Dashboard-spezifische Funktionen
document.addEventListener('DOMContentLoaded', function() {
    updateDashboardUserInfo();
    initDailyBonusUI();
    updateDashboardStats();
    updateGameHistory();
});

function updateDashboardUserInfo() {
    const username = localStorage.getItem('userUsername');
    const email = localStorage.getItem('userEmail');
   
    // Benutzerinfo in Dashboard anzeigen
    document.getElementById('dashboard-username').textContent = username || 'Spieler';
    document.getElementById('detail-username').textContent = username || '-';
    document.getElementById('detail-email').textContent = email || '-';

    // Berechne ausgegebenes Geld
    updateSpentMoney();

    // Wenn CoinsManager vorhanden ist, Dashboard-Coin-Anzeige aktualisieren
    if (typeof CoinsManager !== 'undefined' && CoinsManager.updateCoinsDisplay) {
        CoinsManager.updateCoinsDisplay();
    }
}

function updateSpentMoney() {
    const spentMoneyEl = document.getElementById('detail-spent-money');
    if (!spentMoneyEl) return;

    try {
        const history = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
        const totalSpent = history.reduce((sum, purchase) => {
            if (purchase.status === 'success' && typeof purchase.price === 'number') {
                return sum + purchase.price;
            }
            return sum;
        }, 0);

        spentMoneyEl.textContent = totalSpent.toFixed(2) + ' €';
    } catch (e) {
        spentMoneyEl.textContent = '0,00 €';
    }
}

function updateDashboardStats() {
    try {
        const wonEl = document.getElementById('stats-won');
        const spentEl = document.getElementById('stats-spent');
        const avgEl = document.getElementById('stats-avg');
        if (!wonEl || !spentEl) return;

        const won = (typeof CoinsManager !== 'undefined' && CoinsManager.getTotalWon) ? CoinsManager.getTotalWon() : 0;
        const spent = (typeof CoinsManager !== 'undefined' && CoinsManager.getTotalSpent) ? CoinsManager.getTotalSpent() : 0;
        const fmt = (typeof CoinsManager !== 'undefined' && CoinsManager.formatNumber) ? CoinsManager.formatNumber.bind(CoinsManager) : (n)=>String(n);

        wonEl.innerHTML = `${fmt(won)} <i class="ri-coin-line"></i>`;
        spentEl.innerHTML = `${fmt(spent)} <i class="ri-coin-line"></i>`;

        // Berechne durchschnittlichen Gewinn pro Spiel
        if (avgEl) {
            const totalGamesPlayed = getTotalGamesPlayed();
            if (totalGamesPlayed > 0) {
                const netProfit = won - spent;
                const avgPerGame = netProfit / totalGamesPlayed;
                const avgFormatted = fmt(Math.round(avgPerGame));
                const sign = avgPerGame >= 0 ? '+' : '';
                avgEl.innerHTML = `${sign}${avgFormatted} <i class="ri-coin-line"></i>`;
                
                // Färbe positiv/negativ
                if (avgPerGame > 0) {
                    avgEl.style.color = '#16a34a';
                } else if (avgPerGame < 0) {
                    avgEl.style.color = '#ef4444';
                } else {
                    avgEl.style.color = '';
                }
            } else {
                avgEl.innerHTML = '0 <i class="ri-coin-line"></i>';
                avgEl.style.color = '';
            }
        }
    } catch (e) {}
}

function getTotalGamesPlayed() {
    try {
        const historyData = JSON.parse(localStorage.getItem('gameHistory') || '{}');
        return Object.values(historyData).reduce((sum, count) => sum + count, 0);
    } catch (e) {
        return 0;
    }
}

// Live-Updates für Statistik
window.addEventListener('statschange', updateDashboardStats);
window.addEventListener('gamehistorychange', updateDashboardStats);
window.addEventListener('storage', (e) => {
    if (e.key === 'coinsWonTotal' || e.key === 'coinsSpentTotal') {
        updateDashboardStats();
    }
    if (e.key === 'gameHistory') {
        updateGameHistory();
        updateDashboardStats();
    }
    if (e.key === 'purchaseHistory') {
        updateSpentMoney();
    }
});

// Game History Logic
const GAME_NAMES = {
    'spinwheel': { name: 'Spin Wheel', icon: '🎡' },
    'higherlower': { name: 'Higher/Lower', icon: '🎲' },
    'rollthedice': { name: 'Roll The Dice', icon: '🎯' },
    'coinflip': { name: 'Coin Flip', icon: '🪙' }
};

function updateGameHistory() {
    try {
        const historyData = JSON.parse(localStorage.getItem('gameHistory') || '{}');
        const favGameIcon = document.getElementById('fav-game-icon');
        const favGameName = document.getElementById('fav-game-name');
        const favGameCount = document.getElementById('fav-game-count');
        const allGamesList = document.getElementById('all-games-list');

        if (!favGameIcon || !favGameName || !favGameCount || !allGamesList) return;

        // Finde das am häufigsten gespielte Spiel
        let maxGame = null;
        let maxCount = 0;
        const games = Object.entries(historyData);

        for (const [gameKey, count] of games) {
            if (count > maxCount) {
                maxCount = count;
                maxGame = gameKey;
            }
        }

        // Aktualisiere Favoriten-Spiel
        if (maxGame && GAME_NAMES[maxGame]) {
            favGameIcon.textContent = GAME_NAMES[maxGame].icon;
            favGameName.textContent = GAME_NAMES[maxGame].name;
            favGameCount.textContent = maxCount;
        } else {
            favGameIcon.textContent = '🎮';
            favGameName.textContent = 'Noch keine Spiele';
            favGameCount.textContent = '0';
        }

        // Aktualisiere komplette Liste
        if (games.length === 0) {
            allGamesList.innerHTML = '<li>Noch keine Spiele gespielt</li>';
        } else {
            // Sortiere nach Häufigkeit
            games.sort((a, b) => b[1] - a[1]);
            allGamesList.innerHTML = games
                .map(([gameKey, count]) => {
                    const gameInfo = GAME_NAMES[gameKey];
                    if (!gameInfo) return '';
                    return `<li>
                        <span class="game-item-icon">${gameInfo.icon}</span>
                        <span class="game-item-name">${gameInfo.name}</span>
                        <span class="game-item-count">${count} ${count === 1 ? 'Runde' : 'Runden'}</span>
                    </li>`;
                })
                .filter(Boolean)
                .join('');
        }
    } catch (e) {
        console.error('Fehler beim Aktualisieren der Spielhistorie:', e);
    }
}

// Funktion zum Tracken von Spielen (wird von den Spielen aufgerufen)
function trackGamePlayed(gameKey) {
    try {
        const historyData = JSON.parse(localStorage.getItem('gameHistory') || '{}');
        historyData[gameKey] = (historyData[gameKey] || 0) + 1;
        localStorage.setItem('gameHistory', JSON.stringify(historyData));
        
        // Event für Live-Update auslösen
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('gamehistorychange', { detail: { gameKey, count: historyData[gameKey] } }));
    } catch (e) {
        console.error('Fehler beim Tracken des Spiels:', e);
    }
}

// Live-Updates für Spielhistorie
window.addEventListener('gamehistorychange', updateGameHistory);

// Global verfügbar machen
if (typeof window !== 'undefined') {
    window.trackGamePlayed = trackGamePlayed;
}

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