// RollTheDice – High/Low
// Fair RNG: crypto.getRandomValues, keine modulo-bias
function randIntInclusive(min, max) {
    // min/max inklusive
    const range = max - min + 1;
    const maxUint = 0x100000000; // 2^32
    const limit = maxUint - (maxUint % range);
    const buf = new Uint32Array(1);
    while (true) {
      crypto.getRandomValues(buf);
      const x = buf[0];
      if (x < limit) return min + (x % range);
    }
  }
  
  const ui = {
    bank: document.getElementById('rtd-bank'),
    target: document.getElementById('rtd-target'),
    newGame: document.getElementById('rtd-new'),
    low: document.getElementById('rtd-low'),
    high: document.getElementById('rtd-high'),
    roll: document.getElementById('rtd-roll'),
    cubeContainer: document.getElementById('rtd-cubes'),
    cube1: document.getElementById('rtd-cube1'),
    cube2: document.getElementById('rtd-cube2'),
    result: document.getElementById('rtd-result'),
    d1: document.getElementById('rtd-d1'),
    d2: document.getElementById('rtd-d2'),
    sum: document.getElementById('rtd-sum'),
  };
  
  const state = {
    target: null,      // Zahl 3..11
    pick: null,        // 'low' | 'high'
    busy: false,
    played: false,   // wurde in dieser Runde bereits gespielt?
    fallbackCoins: 100,
  };

  function setRolling(isOn) {
    const cubes = [ui.cube1, ui.cube2].filter(Boolean);
    cubes.forEach((cube) => {
      cube.classList.toggle('rolling', isOn);
      if (isOn) cube.textContent = '🎲';
    });
    if (ui.cubeContainer) {
      ui.cubeContainer.classList.toggle('rolling', isOn);
    }
  }

  function hasCoinsManager() {
    return typeof CoinsManager !== 'undefined';
  }

  function currentCoins() {
    if (hasCoinsManager() && typeof CoinsManager.getCoins === 'function') {
      return CoinsManager.getCoins();
    }
    return state.fallbackCoins;
  }

  function syncFallbackFromManager() {
    if (hasCoinsManager() && typeof CoinsManager.getCoins === 'function') {
      state.fallbackCoins = CoinsManager.getCoins();
    }
  }

  function emitFallbackChange() {
    try {
      const evt = new CustomEvent('coinschange', { detail: { coins: state.fallbackCoins } });
      window.dispatchEvent(evt);
    } catch (err) {
      window.dispatchEvent(new Event('coinschange'));
    }
  }
  
  function resetDiceUI() {
    ui.d1.textContent = '–';
    ui.d2.textContent = '–';
    ui.sum.textContent = '–';
  }
  
  function setPick(p) {
    if (state.busy || state.played) return; // nach abgeschlossener Runde keine neue Auswahl ohne Neues Spiel
    state.pick = p;
    ui.low.setAttribute('aria-pressed', String(p === 'low'));
    ui.high.setAttribute('aria-pressed', String(p === 'high'));
  }
  
  function updateBankDisplay() {
    ui.bank.textContent = String(currentCoins());
  }

  function hasEnoughCoins(amount) {
    if (hasCoinsManager() && typeof CoinsManager.hasEnoughCoins === 'function') {
      return CoinsManager.hasEnoughCoins(amount);
    }
    return state.fallbackCoins >= amount;
  }

  function removeCoins(amount) {
    if (hasCoinsManager() && typeof CoinsManager.removeCoins === 'function') {
      const success = CoinsManager.removeCoins(amount, 'game');
      if (!success) return false;
      updateBankDisplay();
      return true;
    }
    if (state.fallbackCoins >= amount) {
      state.fallbackCoins -= amount;
      updateBankDisplay();
      emitFallbackChange();
      return true;
    }
    return false;
  }

  function addCoins(amount) {
    if (hasCoinsManager() && typeof CoinsManager.addCoins === 'function') {
      CoinsManager.addCoins(amount, 'game');
      updateBankDisplay();
      return;
    }
    state.fallbackCoins += amount;
    updateBankDisplay();
    emitFallbackChange();
  }
  
  function newGame() {
    if (state.busy) return;
    state.played = false;
    ui.low.disabled = false;
    ui.high.disabled = false;
    ui.roll.disabled = false;
    state.target = randIntInclusive(3, 11);
    ui.target.textContent = String(state.target);
    setPick(null);
    resetDiceUI();
    ui.result.className = 'rtd__result';
    ui.result.innerHTML = 'Zielzahl gesetzt. <b>Wähle Höher oder Niedriger</b> und klicke dann <em>Jetzt würfeln</em>.';
  }
  
  function dieFace(n) {
    // Unicode ⚀..⚅  (1..6)
    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    return faces[n-1] || '–';
  }
  
  async function playRound() {
    if (state.played) {
      ui.result.className = 'rtd__result';
      ui.result.textContent = 'Runde beendet. Bitte auf „Neues Spiel“ klicken.';
      return;
    }
    if (state.busy) return;
    if (state.target === null) {
      ui.result.className = 'rtd__result';
      ui.result.textContent = 'Bitte zuerst auf „Neues Spiel“ klicken.';
      return;
    }
    if (!state.pick) {
      ui.result.className = 'rtd__result';
      ui.result.textContent = 'Bitte Höher oder Niedriger auswählen.';
      return;
    }
    if (!hasEnoughCoins(5)) {
      ui.result.className = 'rtd__result';
      ui.result.textContent = 'Nicht genug Coins (5 benötigt).';
      return;
    }

    // Einsatz abziehen
    if (!removeCoins(5)) {
      ui.result.className = 'rtd__result';
      ui.result.textContent = 'Nicht genug Coins (5 benötigt).';
      return;
    }
  
    // Animation starten
    state.busy = true;
    setRolling(true);
    ui.result.className = 'rtd__result';
    ui.result.textContent = 'Würfeln…';
  
    // kurze Wartezeit für Animation
    await new Promise(r => setTimeout(r, 800));
  
    // Zwei Würfel (2..12)
    const d1 = randIntInclusive(1,6);
    const d2 = randIntInclusive(1,6);
    const sum = d1 + d2;
  
    // Animation stoppen & Ergebnis anzeigen
    setRolling(false);
    ui.d1.textContent = dieFace(d1);
    ui.d2.textContent = dieFace(d2);
    ui.sum.textContent = String(sum);
  
    // Vergleich
    let outcome = 'lose';
    if (sum > state.target && state.pick === 'high') outcome = 'win';
    else if (sum < state.target && state.pick === 'low') outcome = 'win';
    else if (sum === state.target) outcome = 'push';
  
    if (outcome === 'win') {
      addCoins(10); // Gewinn gutschreiben
      ui.result.className = 'rtd__result rtd__result--win';
      ui.result.innerHTML = `Gewonnen! Summe <b>${sum}</b> ${state.pick==='high'?'>' : '&lt;'} Ziel <b>${state.target}</b> • +10 Coins`;
    } else if (outcome === 'push') {
      addCoins(5); // Einsatz zurück
      ui.result.className = 'rtd__result rtd__result--push';
      ui.result.innerHTML = `Gleichstand! Summe <b>${sum}</b> = Ziel <b>${state.target}</b> • Einsatz zurück`;
    } else {
      ui.result.className = 'rtd__result rtd__result--lose';
      ui.result.innerHTML = `Verloren. Summe <b>${sum}</b> ${sum>state.target?'>':'&lt;'} Ziel <b>${state.target}</b>`;
    }
    ui.result.innerHTML += '<div class="rtd__hint">→ Bitte zuerst auf <b>„Neues Spiel“</b> klicken, um eine neue Zielzahl zu setzen.</div>';
  
    // Runde ist abgeschlossen – erneut spielen erst nach „Neues Spiel“
    state.played = true;
    ui.roll.disabled = true;
    ui.low.disabled = true;
    ui.high.disabled = true;
  
    state.busy = false;
  }
  
  function init() {
    // Initial UI
    syncFallbackFromManager();
    updateBankDisplay();
    ui.target.textContent = '–';
    resetDiceUI();
  
    // Events
    ui.newGame.addEventListener('click', newGame);
    ui.low.addEventListener('click', () => setPick('low'));
    ui.high.addEventListener('click', () => setPick('high'));
    ui.roll.addEventListener('click', playRound);
  
    // Tastatur-Shortcuts
    window.addEventListener('keydown', (e) => {
      if (state.busy) return;
      if (e.key.toLowerCase() === 'l') setPick('low');
      if (e.key.toLowerCase() === 'h') setPick('high');
      if (e.key === 'Enter') playRound();
      if (e.key.toLowerCase() === 'n') newGame();
    });
  }

  window.addEventListener('coinschange', () => {
    syncFallbackFromManager();
    updateBankDisplay();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === 'userCoins') {
      syncFallbackFromManager();
      updateBankDisplay();
    }
  });
  
  document.addEventListener('DOMContentLoaded', init);
