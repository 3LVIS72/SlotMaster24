// === Gemeinsame Coin-Logik (Fallback, falls CoinsManager fehlt) ===
(function () {
  var fallbackCoins = 1000;

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

  function addCoins(amount) {
    if (hasCoinsManager() && typeof CoinsManager.addCoins === "function") {
      CoinsManager.addCoins(amount, "game");
      return;
    }
    fallbackCoins = Math.max(0, fallbackCoins + Math.floor(amount));
    emitFallbackChange();
  }

  function removeCoins(amount) {
    if (hasCoinsManager() && typeof CoinsManager.removeCoins === "function") {
      return CoinsManager.removeCoins(amount, "game");
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

  // === Coin Flip Logik ===
  var elCoin = document.getElementById("coin");
  var elBalance = document.getElementById("balance");
  var elBet = document.getElementById("bet");
  var elStatus = document.getElementById("status");
  var elResultText = document.getElementById("resultText");
  var elBtnHeads = document.getElementById("btnHeads");
  var elBtnTails = document.getElementById("btnTails");

  if (!elCoin || !elBalance || !elBet || !elStatus || !elResultText || !elBtnHeads || !elBtnTails) {
    console.warn("CoinFlip: erforderliche Elemente nicht gefunden.");
    return;
  }
  var isFlipping = false;

  function setStatus(message, type) {
    elStatus.className = "status" + (type ? " " + type : "");
    elStatus.textContent = message || "";
  }

  function setResultText(message) {
    elResultText.textContent = message || "";
  }

  function renderCoins() {
    syncFallbackFromManager();
    elBalance.textContent = formatCoins(getCoins());
  }

  function clampBetValue(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.floor(value));
  }

  function flipTo(face) {
    var rotation = face === "heads" ? 0 : 180;
    elCoin.style.transform = "rotateY(" + rotation + "deg)";
  }

  function play(choice) {
    if (isFlipping) {
      return;
    }

    var bet = clampBetValue(Number(elBet.value || 0));
    if (bet <= 0) {
      setStatus("Bitte Einsatz eingeben (mind. 1 Coin).", "info");
      return;
    }

    if (!hasEnoughCoins(bet)) {
      setStatus("Nicht genug Coins.", "lose");
      return;
    }

    // Track game play
    if (typeof window.trackGamePlayed === 'function') {
      window.trackGamePlayed('coinflip');
    }

    isFlipping = true;
    setStatus("Münze wird geworfen …", "info");
    setResultText("");

    // Trigger CSS-Animation
    elCoin.classList.remove("is-flipping");
    void elCoin.offsetWidth; // reflow
    elCoin.classList.add("is-flipping");

    var outcome = Math.random() < 0.5 ? "heads" : "tails";
    var duration = 900;

    window.setTimeout(function () {
      elCoin.classList.remove("is-flipping");
      flipTo(outcome);

      if (outcome === choice) {
        addCoins(bet);
        setStatus("Gewonnen! +" + bet + " Coins", "win");
        setResultText((outcome === "heads" ? "Kopf" : "Zahl") + "! Dein Tipp war richtig.");
      } else {
        if (!removeCoins(bet)) {
          setStatus("Nicht genug Coins.", "lose");
          setResultText("Einsatz konnte nicht abgezogen werden.");
        } else {
          setStatus("Leider verloren.", "lose");
          setResultText((outcome === "heads" ? "Kopf" : "Zahl") + "! Versuch es erneut.");
        }
      }

      renderCoins();
      isFlipping = false;
    }, duration);
  }

  // Buttons
  elBtnHeads.addEventListener("click", function () {
    play("heads");
  });
  elBtnTails.addEventListener("click", function () {
    play("tails");
  });

  // Quick Chips
  Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (chip) {
    chip.addEventListener("click", function () {
      var add = clampBetValue(Number(chip.dataset.add));
      var current = clampBetValue(Number(elBet.value || 0));
      elBet.value = current + add;
    });
  });

  // React auf externe Coin-Änderungen
  window.addEventListener("storage", function (event) {
    if (event.key === "userCoins") {
      renderCoins();
    }
  });
  window.addEventListener("coinschange", renderCoins);

  // Initial render
  flipTo("heads");
  renderCoins();
  setStatus("", "");
})();
