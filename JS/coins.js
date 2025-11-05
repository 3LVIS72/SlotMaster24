// Coins Management System
const CoinsManager = {
    // Startwert für neue Spieler
    INITIAL_COINS: 1000,
    STATS_WON_KEY: 'coinsWonTotal',
    STATS_SPENT_KEY: 'coinsSpentTotal',
    WITHDRAWABLE_KEY: 'withdrawableCoins',

    // Spielguthaben (Gesamt-Coins)
    getCoins() {
        const coins = localStorage.getItem('userCoins');
        return coins ? parseInt(coins) : this.INITIAL_COINS;
    },

    // Auszahlbares Guthaben (nur gewonnene Coins)
    getWithdrawableCoins() {
        const withdrawable = localStorage.getItem(this.WITHDRAWABLE_KEY);
        return withdrawable ? parseInt(withdrawable) : 0;
    },

    setWithdrawableCoins(amount) {
        localStorage.setItem(this.WITHDRAWABLE_KEY, amount.toString());
        this._emitCoinsChange(this.getCoins());
    },

    // Coins setzen (z.B. bei Spielstart oder nach Login)
    setCoins(amount) {
        localStorage.setItem('userCoins', amount.toString());
        this.updateCoinsDisplay();
        this._emitCoinsChange(amount);
    },

    // Coins hinzufügen (bei Gewinn)
    addCoins(amount, source = 'general') {
        const currentCoins = this.getCoins();
        this.setCoins(currentCoins + amount);
        
        // Bei Spielgewinnen: auch auszahlbares Guthaben erhöhen
        if (source === 'game') {
            const totalWon = this._getNumber(localStorage.getItem(this.STATS_WON_KEY));
            localStorage.setItem(this.STATS_WON_KEY, String(totalWon + amount));
            
            const currentWithdrawable = this.getWithdrawableCoins();
            this.setWithdrawableCoins(currentWithdrawable + amount);
            
            this._emitStatsChange();
        }
        return this.getCoins();
    },

    // Coins abziehen (bei Verlust/Einsatz)
    removeCoins(amount, source = 'general') {
        const currentCoins = this.getCoins();
        if (currentCoins >= amount) {
            this.setCoins(currentCoins - amount);
            if (source === 'game') {
                const totalSpent = this._getNumber(localStorage.getItem(this.STATS_SPENT_KEY));
                localStorage.setItem(this.STATS_SPENT_KEY, String(totalSpent + amount));
                this._emitStatsChange();
            }
            return true;
        }
        return false; // Nicht genug Coins
    },

    // Prüfen ob genug Coins für einen Einsatz vorhanden sind
    hasEnoughCoins(amount) {
        return this.getCoins() >= amount;
    },

    // Formatierung für Anzeige (z.B. 10000 -> "10.000")
    formatNumber(n) {
        try {
            return n.toLocaleString('de-DE');
        } catch (e) {
            return String(n);
        }
    },

    // Coins-Anzeige in der NavBar und auf dem Dashboard aktualisieren
    updateCoinsDisplay() {
        const navCoins = document.getElementById('nav-coins');
        if (navCoins) {
            navCoins.innerHTML = `${this.getCoins()} <i class="ri-coin-line"></i>`;
            // Sichtbar machen (HTML kann initial display:none haben)
            navCoins.style.display = '';
        }

        const dashboardCoins = document.getElementById('dashboard-coins');
        if (dashboardCoins) {
            dashboardCoins.innerHTML = `${this.formatNumber(this.getCoins())} <i class="ri-coin-line"></i>`;
            dashboardCoins.style.display = '';
        }

        // Balance-Anzeige im Dashboard (Konto-Übersicht) - Spielguthaben
        const balanceCoins = document.getElementById('balance-coins');
        if (balanceCoins) {
            balanceCoins.innerHTML = `${this.formatNumber(this.getCoins())} <i class="ri-coin-line"></i>`;
        }

        // Auszahlbares Guthaben
        const withdrawableCoins = document.getElementById('withdrawable-coins');
        if (withdrawableCoins) {
            withdrawableCoins.innerHTML = `${this.formatNumber(this.getWithdrawableCoins())} <i class="ri-coin-line"></i>`;
        }
    },

    // Initialisierung für neue Spieler
    initializeNewPlayer() {
        if (!localStorage.getItem('userCoins')) {
            this.setCoins(this.INITIAL_COINS);
        }
        if (localStorage.getItem(this.STATS_WON_KEY) === null) {
            localStorage.setItem(this.STATS_WON_KEY, '0');
        }
        if (localStorage.getItem(this.STATS_SPENT_KEY) === null) {
            localStorage.setItem(this.STATS_SPENT_KEY, '0');
        }
        if (localStorage.getItem(this.WITHDRAWABLE_KEY) === null) {
            localStorage.setItem(this.WITHDRAWABLE_KEY, '0');
        }
    },
    getTotalWon() {
        return this._getNumber(localStorage.getItem(this.STATS_WON_KEY));
    },
    getTotalSpent() {
        return this._getNumber(localStorage.getItem(this.STATS_SPENT_KEY));
    },
    _emitCoinsChange(amount) {
        try {
            const event = new CustomEvent('coinschange', {
                detail: { coins: amount }
            });
            window.dispatchEvent(event);
        } catch (e) {
            // Fallback für Browser ohne CustomEvent-Unterstützung
            window.dispatchEvent(new Event('coinschange'));
        }
    },
    _emitStatsChange() {
        try {
            window.dispatchEvent(new Event('statschange'));
        } catch (e) {}
    },
    _getNumber(v) {
        const n = v ? parseInt(v, 10) : 0;
        return Number.isNaN(n) ? 0 : n;
    }
};

// Event Listener für Seitenladung
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        CoinsManager.initializeNewPlayer();
        CoinsManager.updateCoinsDisplay();
    }
});

// Synchronisation, wenn Coins in anderem Tab/Fenster geändert werden
window.addEventListener('storage', (event) => {
    if (event.key === 'userCoins') {
        CoinsManager.updateCoinsDisplay();
        const value = event.newValue ? parseInt(event.newValue, 10) : CoinsManager.getCoins();
        CoinsManager._emitCoinsChange(Number.isNaN(value) ? CoinsManager.getCoins() : value);
    }
    if (event.key === CoinsManager.STATS_WON_KEY || event.key === CoinsManager.STATS_SPENT_KEY) {
        CoinsManager._emitStatsChange();
    }
});
