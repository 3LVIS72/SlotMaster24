// dashboard.js – Dashboard-spezifische Funktionen
document.addEventListener("DOMContentLoaded", function () {
  updateDashboardUserInfo();
  renderDashboardCoins(); // Coins direkt beim Laden anzeigen
});

// === Benutzerinformationen ===
function updateDashboardUserInfo() {
  const username = localStorage.getItem("userUsername");
  const email = localStorage.getItem("userEmail");

  // Benutzerinfo in Dashboard anzeigen
  document.getElementById("dashboard-username").textContent = username || "Spieler";
  document.getElementById("detail-username").textContent = username || "-";
  document.getElementById("detail-email").textContent = email || "-";
}

// === Coins-Handling (gemeinsam mit den Spielen) ===
const COINS_KEY = "sm24:coins";

function getCoins() {
  let v = Number(localStorage.getItem(COINS_KEY));
  if (!Number.isFinite(v) || v < 0) v = 10000; // Default Startwert
  return Math.floor(v);
}

function setCoins(n) {
  n = Math.max(0, Math.floor(n));
  localStorage.setItem(COINS_KEY, String(n));
  window.dispatchEvent(new Event("coinschange")); // internes Event
}

// Zeigt den aktuellen Coin-Stand im Dashboard an
function renderDashboardCoins() {
  const el = document.querySelector(".balance-amount");
  if (!el) return;
  el.textContent = getCoins().toLocaleString("de-DE") + " 💰";
}

// === Bonus-Button ===
function claimDailyBonus() {
  alert("🎉 Täglicher Bonus von 500 Münzen wurde deinem Konto gutgeschrieben!");
  const newTotal = getCoins() + 500;
  setCoins(newTotal);
  renderDashboardCoins();
}

// === Live-Updates von anderen Tabs / Spielen ===
window.addEventListener("storage", function (e) {
  if (e.key === COINS_KEY) renderDashboardCoins();
});
window.addEventListener("coinschange", renderDashboardCoins);
