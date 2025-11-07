(() => {
  const overlay = document.getElementById('paymentOverlay');
  const modal = overlay ? overlay.querySelector('.payment-modal') : null;
  const closeBtn = document.getElementById('paymentClose');
  const packCoinsEl = document.getElementById('paymentPackCoins');
  const packPriceEl = document.getElementById('paymentPackPrice');
  const statusEl = document.getElementById('paymentStatus');

  const methodLabels = {
    paypal: 'PayPal',
    klarna: 'Klarna',
    card: 'Kreditkarte',
    applepay: 'Apple Pay'
  };

  let currentPack = null;
  let restoreFocusEl = null;
  let closeTimer = null;

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.className = 'modal-status' + (type ? ' ' + type : '');
  }

  function formatCoins(value) {
    try {
      return Number(value).toLocaleString('de-DE');
    } catch (err) {
      return String(value);
    }
  }

  function formatPrice(value) {
    try {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    } catch (err) {
      return `${value.toFixed(2)} €`;
    }
  }

  function savePurchaseHistory(entry) {
    try {
      const history = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
      history.push(entry);
      localStorage.setItem('purchaseHistory', JSON.stringify(history));
    } catch (err) {}
  }

  function addCoins(coins) {
    if (typeof CoinsManager !== 'undefined' && typeof CoinsManager.addCoins === 'function') {
      CoinsManager.addCoins(coins, 'purchase');
      return true;
    }
    alert('CoinsManager nicht verfügbar.');
    return false;
  }

  function completeTransaction(pack, method) {
    if (!pack) return null;
    if (!addCoins(pack.coins)) return null;

    const now = Date.now();
    savePurchaseHistory({
      ts: now,
      coins: pack.coins,
      price: pack.price,
      method,
      status: 'success'
    });

    const methodName = methodLabels[method] || method;
    const coinsText = `${formatCoins(pack.coins)} Coins`;
    const priceText = formatPrice(pack.price);

    return { method, methodName, coinsText, priceText };
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setStatus('', '');
    if (closeTimer) window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      overlay.hidden = true;
    }, 200);
    if (restoreFocusEl && typeof restoreFocusEl.focus === 'function') {
      restoreFocusEl.focus();
    }
    restoreFocusEl = null;
    currentPack = null;
  }

  function openModal(pack) {
    if (!overlay || !modal || !packCoinsEl || !packPriceEl) {
      // Fallback auf simples Confirm-Dialog
      const fallback = confirm(
        `Bezahlen mit PayPal?\n\nPaket: ${formatCoins(pack.coins)} Coins\nPreis: ${formatPrice(pack.price)}`
      );
      if (fallback) {
        const result = completeTransaction(pack, 'paypal');
        if (result) {
          alert(
            `✅ Kauf erfolgreich über ${result.methodName}!\n\nGutschrift: ${result.coinsText}\nPreis: ${result.priceText}`
          );
        }
      }
      return;
    }

    currentPack = pack;
    restoreFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    packCoinsEl.textContent = `${formatCoins(pack.coins)} Coins`;
    packPriceEl.textContent = formatPrice(pack.price);
    setStatus('Bitte wähle eine Zahlungsmethode.', 'info');

    if (closeTimer) window.clearTimeout(closeTimer);
    overlay.hidden = false;
    // Warten bis Overlay im Layout ist, dann Klasse setzen
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      document.body.classList.add('modal-open');
      modal.focus();
    });
  }

  function processPurchase(method) {
    if (!currentPack) return;
    const result = completeTransaction(currentPack, method);
    if (!result) {
      setStatus('Transaktion fehlgeschlagen. Bitte versuche es erneut.', 'error');
      return;
    }
    setStatus(`✅ ${result.coinsText} über ${result.methodName} gutgeschrieben (Preis: ${result.priceText})`, 'success');
  }

  function handleBuy(button) {
    const card = button.closest('[data-coins][data-price]');
    if (!card) return;
    const coins = parseInt(card.getAttribute('data-coins'), 10);
    const price = parseFloat(card.getAttribute('data-price'));
    if (!Number.isFinite(coins) || !Number.isFinite(price)) return;
    openModal({ coins, price });
  }

  // Initial Event Bindings
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-buy]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        handleBuy(btn);
      });
    });
  });

  // Delegation (falls Buttons später ergänzt werden)
  document.addEventListener('click', (event) => {
    const buyBtn = event.target.closest('[data-buy]');
    if (buyBtn) {
      event.preventDefault();
      handleBuy(buyBtn);
      return;
    }

    if (!overlay || overlay.hidden) return;

    const methodBtn = event.target.closest('[data-method]');
    if (methodBtn && overlay.contains(methodBtn)) {
      event.preventDefault();
      processPurchase(methodBtn.getAttribute('data-method'));
      return;
    }

    if (event.target === overlay) {
      closeModal();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (event) => {
      event.preventDefault();
      closeModal();
    });
  }

  if (overlay) {
    overlay.addEventListener('transitionend', (event) => {
      if (event.target === overlay && !overlay.classList.contains('is-open')) {
        overlay.hidden = true;
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay && overlay.classList.contains('is-open')) {
      event.preventDefault();
      closeModal();
    }
  });
})();
