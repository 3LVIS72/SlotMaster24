function fmt(n){ try { return Number(n).toLocaleString('de-DE'); } catch(e){ return String(n); } }

function loadCashouts(){
  try {
    return JSON.parse(localStorage.getItem('cashoutRequests') || '[]');
  } catch(e){ return []; }
}
function saveCashouts(list){
  try { localStorage.setItem('cashoutRequests', JSON.stringify(list)); } catch(e){}
}

function renderCashouts(){
  const cont = document.getElementById('cashout-entries');
  if (!cont) return;
  const list = loadCashouts().sort((a,b)=>b.ts-a.ts);
  cont.innerHTML = '';
  if (list.length === 0){
    cont.innerHTML = '<div style="color:var(--text-light)">Keine Auszahlungsanfragen vorhanden.</div>';
    return;
  }
  list.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.padding = '0.75rem 1rem';
    div.style.background = '#fff';
    div.style.border = '1px solid rgba(0,0,0,0.06)';
    div.style.borderRadius = '10px';
    const date = new Date(item.ts).toLocaleString('de-DE');
    const euroAmount = item.euroAmount || (item.amount / 1000).toFixed(2);
    div.innerHTML = `<b>${fmt(item.amount)} Coins (${euroAmount} €)</b> • ${date}<br/><span style="color:var(--text-light)">IBAN: ${item.ibanMasked || item.iban} • Status: ${item.status}</span>`;
    cont.appendChild(div);
  });
}

function maskIban(iban){
  if (!iban) return '';
  const compact = iban.replace(/\s+/g,'');
  if (compact.length <= 8) return compact;
  return compact.slice(0,4) + ' **** **** ' + compact.slice(-4);
}

function show(msg){
  try {
    showToast(msg);
  } catch(e){
    alert(msg);
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
    }, 3000);
  } catch (e) {
    // Fallback
    alert(message);
  }
}

function onSubmit(e){
  e.preventDefault();
  const amountEl = document.getElementById('cashout-amount');
  const ibanEl = document.getElementById('cashout-iban');
  const nameEl = document.getElementById('cashout-name');
  const refEl = document.getElementById('cashout-ref');

  const amount = Math.max(1000, Math.floor(Number(amountEl.value || 0)));
  const iban = String(ibanEl.value||'').trim();
  const name = String(nameEl.value||'').trim();
  const ref = String(refEl.value||'').trim();

  if (amount < 1000) { show('Mindestbetrag für Auszahlung: 1.000 Coins (= 1,00 €)'); return; }
  if (!iban || !name){ show('Bitte IBAN und Kontoinhaber ausfüllen.'); return; }
  if (typeof CoinsManager === 'undefined' || typeof CoinsManager.getWithdrawableCoins !== 'function'){
    show('CoinsManager nicht verfügbar.'); return;
  }
  
  // Prüfe auszahlbares Guthaben (nicht Gesamt-Coins!)
  const withdrawable = CoinsManager.getWithdrawableCoins();
  if (withdrawable < amount) { 
    show(`Nicht genug auszahlbare Coins. Verfügbar: ${fmt(withdrawable)} Coins`); 
    return; 
  }

  // Coins von beiden Guthaben abziehen
  const currentCoins = CoinsManager.getCoins();
  CoinsManager.setCoins(currentCoins - amount);
  CoinsManager.setWithdrawableCoins(withdrawable - amount);

  const euroAmount = (amount / 1000).toFixed(2);
  const entry = { ts: Date.now(), amount, euroAmount, ibanMasked: maskIban(iban), iban, name, ref, status: 'pending' };
  const list = loadCashouts();
  list.push(entry);
  saveCashouts(list);

  renderCashouts();
  updateWithdrawableDisplay();
  show(`Anfrage erstellt: ${fmt(amount)} Coins (${euroAmount} €). Status: pending`);
  try { e.target.reset(); amountEl.value = 1000; } catch(err){}
}

function updateWithdrawableDisplay() {
  const heroWithdrawable = document.getElementById('hero-withdrawable-coins');
  
  if (typeof CoinsManager !== 'undefined') {
    if (heroWithdrawable) {
      heroWithdrawable.innerHTML = `${fmt(CoinsManager.getWithdrawableCoins())} <i class="ri-coin-line"></i>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCashouts();
  updateWithdrawableDisplay();
  const form = document.getElementById('cashout-form');
  if (form) form.addEventListener('submit', onSubmit);
});
