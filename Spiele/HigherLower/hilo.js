// === Shared Coins via CoinsManager (Fallback auf lokale Speicherung) ===
var fallbackCoins = 10000;

function hasCoinsManager() {
  return typeof CoinsManager !== "undefined";
}

function syncFallbackFromManager() {
  if (hasCoinsManager() && typeof CoinsManager.getCoins === "function") {
    fallbackCoins = CoinsManager.getCoins();
  }
}

function emitFallbackChange() {
  try {
    window.dispatchEvent(new CustomEvent("coinschange", { detail: { coins: fallbackCoins } }));
  } catch (err) {
    window.dispatchEvent(new Event("coinschange"));
  }
}

function getCoins() {
  if (hasCoinsManager() && typeof CoinsManager.getCoins === "function") {
    return CoinsManager.getCoins();
  }
  return fallbackCoins;
}

function setCoins(amount) {
  if (hasCoinsManager() && typeof CoinsManager.setCoins === "function") {
    CoinsManager.setCoins(amount);
    return;
  }
  fallbackCoins = Math.max(0, Math.floor(amount));
  emitFallbackChange();
}

function addCoins(amount) {
  if (hasCoinsManager() && typeof CoinsManager.addCoins === "function") {
    CoinsManager.addCoins(amount);
    return;
  }
  fallbackCoins = Math.max(0, fallbackCoins + Math.floor(amount));
  emitFallbackChange();
}

function removeCoins(amount) {
  if (hasCoinsManager() && typeof CoinsManager.removeCoins === "function") {
    return CoinsManager.removeCoins(amount);
  }
  var needed = Math.max(0, Math.floor(amount));
  if (fallbackCoins >= needed) {
    fallbackCoins -= needed;
    emitFallbackChange();
    return true;
  }
  return false;
}

function hasEnoughCoins(amount) {
  if (hasCoinsManager() && typeof CoinsManager.hasEnoughCoins === "function") {
    return CoinsManager.hasEnoughCoins(amount);
  }
  return fallbackCoins >= Math.max(0, Math.floor(amount));
}

function formatCoins(value) {
  if (hasCoinsManager() && typeof CoinsManager.formatNumber === "function") {
    return CoinsManager.formatNumber(value);
  }
  try {
    return Number(value).toLocaleString("de-DE");
  } catch (err) {
    return String(value);
  }
}

// === Hi-Lo Logik ===
var suits = ["♣", "♦", "♥", "♠"];
var ranks = [1,2,3,4,5,6,7,8,9,10,11,12,13];

function makeDeck() {
  var d = [];
  for (var s = 0; s < suits.length; s++) {
    for (var r = 0; r < ranks.length; r++) d.push({ suit: suits[s], rank: ranks[r] });
  }
  for (var i = 0; i < d.length; i++) {
    var j = Math.floor(Math.random() * d.length);
    var t = d[i]; d[i] = d[j]; d[j] = t;
  }
  return d;
}
function rankText(n){ if(n===1) return "A"; if(n===11) return "J"; if(n===12) return "Q"; if(n===13) return "K"; return String(n); }
function suitColor(s){ return (s==="♥"||s==="♦") ? "#d93654" : "#111"; }

var deck = makeDeck();
var current = deck.pop();

// DOM
var elRank   = document.getElementById("rank");
var elSuitTL = document.getElementById("suitTL");
var elSuitBR = document.getElementById("suitBR");
var elCard   = document.getElementById("card");
var elBal    = document.getElementById("balance");
var elBet    = document.getElementById("bet");
var elStatus = document.getElementById("status");

function renderCard(card){
  elRank.textContent = rankText(card.rank);
  elSuitTL.textContent = card.suit;
  elSuitBR.textContent = card.suit;
  var c = suitColor(card.suit);
  elSuitTL.style.color = c; elSuitBR.style.color = c;
  elCard.classList.add("bump"); setTimeout(function(){ elCard.classList.remove("bump"); }, 120);
}
function setStatus(msg, type){
  elStatus.className = "status" + (type ? (" " + type) : "");
  elStatus.textContent = msg || "";
}
function draw(){ if (deck.length===0) deck = makeDeck(); return deck.pop(); }
function renderCoins(){
  syncFallbackFromManager();
  elBal.textContent = formatCoins(getCoins());
}

// Spielrunde
function play(guess){
  var bet = Math.floor(Number(elBet.value || 0)); // Coins = ganze Zahlen
  if (bet <= 0) { setStatus("Bitte Einsatz eingeben (mind. 1 Coin)."); return; }

  if (!hasEnoughCoins(bet)) { setStatus("Nicht genug Coins.", "lose"); return; }

  var prev = current, next = draw();

  if (next.rank === prev.rank) {
    setStatus("Push – Einsatz zurück.", "push");
  } else {
    var higher = next.rank > prev.rank;
    var win = (guess === "higher" && higher) || (guess === "lower" && !higher);
    if (win) {
      var profit = Math.floor(bet * 0.9);      // 1.9x Auszahlung → +0.9x Gewinn
      addCoins(profit);
      setStatus("Gewonnen! +" + profit + " Coins", "win");
    } else {
      if (!removeCoins(bet)) {
        setStatus("Nicht genug Coins.", "lose");
        return;
      }
      setStatus("Leider verloren.", "lose");
    }
  }

  current = next;
  renderCard(current);
  renderCoins();
}

// Init
renderCard(current);
renderCoins();

// Buttons
document.getElementById("btnHigher").addEventListener("click", function(){ play("higher"); });
document.getElementById("btnLower").addEventListener("click", function(){ play("lower"); });

// Chips
document.querySelectorAll(".chip").forEach(function(btn){
  btn.addEventListener("click", function(){
    var add = Number(btn.dataset.add);
    var cur = Number(elBet.value || 0);
    elBet.value = Math.max(0, Math.floor(cur + add));
  });
});

// wenn Coins sich woanders ändern (anderer Tab/Seite), hier live aktualisieren
window.addEventListener("storage", function(e){
  if (e.key === "userCoins") renderCoins();
});
window.addEventListener("coinschange", renderCoins);
