function handleBuy(btn){
  const card = btn.closest('[data-coins][data-price]');
  if (!card) return;
  const coins = parseInt(card.getAttribute('data-coins'), 10);
  const price = parseFloat(card.getAttribute('data-price'));
  if (!Number.isFinite(coins) || !Number.isFinite(price)) return;

  const confirmed = confirm(`Bezahlen mit PayPal?\n\nPaket: ${coins.toLocaleString('de-DE')} Coins\nPreis: ${price.toFixed(2)} €`);
  if (!confirmed) return;

  if (typeof CoinsManager !== 'undefined' && typeof CoinsManager.addCoins === 'function') {
    CoinsManager.addCoins(coins, 'purchase');
  } else {
    alert('CoinsManager nicht verfügbar.');
    return;
  }

  try {
    const history = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
    history.push({ ts: Date.now(), coins, price, method: 'paypal', status: 'success' });
    localStorage.setItem('purchaseHistory', JSON.stringify(history));
  } catch (e) {}

  try {
    const evt = new CustomEvent('toast', { detail: { message: `Vielen Dank! +${coins.toLocaleString('de-DE')} Coins` } });
    window.dispatchEvent(evt);
  } catch (e) {}
  alert(`✅ Kauf erfolgreich! +${coins.toLocaleString('de-DE')} Coins für ${price.toFixed(2)} €`);
}

document.addEventListener('DOMContentLoaded', () => {
  // Direkte Listener (falls Buttons schon im DOM sind)
  document.querySelectorAll('[data-buy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleBuy(btn);
    });
  });
});

// Event Delegation als Fallback (robuster gegen spätere DOM-Änderungen)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-buy]');
  if (!btn) return;
  e.preventDefault();
  handleBuy(btn);
});
