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
    cube: document.getElementById('rtd-cube'),
    result: document.getElementById('rtd-result'),
    d1: document.getElementById('rtd-d1'),
    d2: document.getElementById('rtd-d2'),
    sum: document.getElementById('rtd-sum'),
  };
  
  const state = {
    coins: 100,
    target: null,      // Zahl 3..11
    pick: null,        // 'low' | 'high'
    busy: false,
  };
  
  function resetDiceUI() {
    ui.d1.textContent = '–';
    ui.d2.textContent = '–';
    ui.sum.textContent = '–';
  }
  
  function setPick(p) {
    state.pick = p;
    ui.low.setAttribute('aria-pressed', String(p === 'low'));
    ui.high.setAttribute('aria-pressed', String(p === 'high'));
  }
  
  function setCoins(c) {
    state.coins = c;
    ui.bank.textContent = String(c);
  }
  
  function newGame() {
    if (state.busy) return;
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
    if (state.coins < 5) {
      ui.result.className = 'rtd__result';
      ui.result.textContent = 'Nicht genug Coins (5 benötigt).';
      return;
    }
  
    // Einsatz abziehen
    setCoins(state.coins - 5);
  
    // Animation starten
    state.busy = true;
    ui.cube.classList.add('rolling');
    ui.result.className = 'rtd__result';
    ui.result.textContent = 'Würfeln…';
  
    // kurze Wartezeit für Animation
    await new Promise(r => setTimeout(r, 800));
  
    // Zwei Würfel (2..12)
    const d1 = randIntInclusive(1,6);
    const d2 = randIntInclusive(1,6);
    const sum = d1 + d2;
  
    // Animation stoppen & Ergebnis anzeigen
    ui.cube.classList.remove('rolling');
    ui.d1.textContent = dieFace(d1);
    ui.d2.textContent = dieFace(d2);
    ui.sum.textContent = String(sum);
  
    // Vergleich
    let outcome = 'lose';
    if (sum > state.target && state.pick === 'high') outcome = 'win';
    else if (sum < state.target && state.pick === 'low') outcome = 'win';
    else if (sum === state.target) outcome = 'push';
  
    if (outcome === 'win') {
      setCoins(state.coins + 10); // Gewinn gutschreiben
      ui.result.className = 'rtd__result rtd__result--win';
      ui.result.innerHTML = `Gewonnen! Summe <b>${sum}</b> ${state.pick==='high'?'>' : '&lt;'} Ziel <b>${state.target}</b> • +10 Coins`;
    } else if (outcome === 'push') {
      setCoins(state.coins + 5); // Einsatz zurück
      ui.result.className = 'rtd__result rtd__result--push';
      ui.result.innerHTML = `Gleichstand! Summe <b>${sum}</b> = Ziel <b>${state.target}</b> • Einsatz zurück`;
    } else {
      ui.result.className = 'rtd__result rtd__result--lose';
      ui.result.innerHTML = `Verloren. Summe <b>${sum}</b> ${sum>state.target?'>':'&lt;'} Ziel <b>${state.target}</b>`;
    }
  
    state.busy = false;
  }
  
  function init() {
    // Initial UI
    setCoins(state.coins);
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
  
  document.addEventListener('DOMContentLoaded', init);