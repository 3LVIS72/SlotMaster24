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
    div.innerHTML = `<b>${fmt(item.amount)} Coins</b> • ${date}<br/><span style="color:var(--text-light)">IBAN: ${item.ibanMasked || item.iban} • Status: ${item.status}</span>`;
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
    const e = new CustomEvent('toast', { detail: { message: msg } });
    window.dispatchEvent(e);
  } catch(e){}
  alert(msg);
}

function onSubmit(e){
  e.preventDefault();
  const amountEl = document.getElementById('cashout-amount');
  const ibanEl = document.getElementById('cashout-iban');
  const nameEl = document.getElementById('cashout-name');
  const refEl = document.getElementById('cashout-ref');

  const amount = Math.max(100, Math.floor(Number(amountEl.value || 0)));
  const iban = String(ibanEl.value||'').trim();
  const name = String(nameEl.value||'').trim();
  const ref = String(refEl.value||'').trim();

  if (!iban || !name){ show('Bitte IBAN und Kontoinhaber ausfüllen.'); return; }
  if (typeof CoinsManager === 'undefined' || typeof CoinsManager.hasEnoughCoins !== 'function'){
    show('CoinsManager nicht verfügbar.'); return;
  }
  if (!CoinsManager.hasEnoughCoins(amount)) { show('Nicht genug Coins für diese Auszahlung.'); return; }

  // Coins abbuchen
  if (!CoinsManager.removeCoins(amount, 'withdrawal')){ show('Auszahlung fehlgeschlagen.'); return; }

  const entry = { ts: Date.now(), amount, ibanMasked: maskIban(iban), iban, name, ref, status: 'pending' };
  const list = loadCashouts();
  list.push(entry);
  saveCashouts(list);

  renderCashouts();
  show(`Anfrage erstellt: ${fmt(amount)} Coins. Status: pending`);
  try { e.target.reset(); amountEl.value = 100; } catch(err){}
}

document.addEventListener('DOMContentLoaded', () => {
  renderCashouts();
  const form = document.getElementById('cashout-form');
  if (form) form.addEventListener('submit', onSubmit);
});
