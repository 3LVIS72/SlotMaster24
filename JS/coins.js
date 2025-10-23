// Coins Management System
const CoinsManager = {
    // Startwert für neue Spieler
    INITIAL_COINS: 1000,

    // Coins des aktuellen Spielers abrufen
    getCoins() {
        const coins = localStorage.getItem('userCoins');
        return coins ? parseInt(coins) : this.INITIAL_COINS;
    },

    // Coins setzen (z.B. bei Spielstart oder nach Login)
    setCoins(amount) {
        localStorage.setItem('userCoins', amount.toString());
        this.updateCoinsDisplay();
    },

    // Coins hinzufügen (bei Gewinn)
    addCoins(amount) {
        const currentCoins = this.getCoins();
        this.setCoins(currentCoins + amount);
        return this.getCoins();
    },

    // Coins abziehen (bei Verlust/Einsatz)
    removeCoins(amount) {
        const currentCoins = this.getCoins();
        if (currentCoins >= amount) {
            this.setCoins(currentCoins - amount);
            return true;
        }
        return false; // Nicht genug Coins
    },

    // Prüfen ob genug Coins für einen Einsatz vorhanden sind
    hasEnoughCoins(amount) {
        return this.getCoins() >= amount;
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
            dashboardCoins.innerHTML = `${this.getCoins()} <i class="ri-coin-line"></i>`;
            dashboardCoins.style.display = '';
        }
    },

    // Initialisierung für neue Spieler
    initializeNewPlayer() {
        if (!localStorage.getItem('userCoins')) {
            this.setCoins(this.INITIAL_COINS);
        }
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