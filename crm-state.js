// Shared validation boundary for browser storage and user-selected backups.
(() => {
  const collections = ['leads','customers','tasks','visits','quotes','invoices','routePlans','vapeCart','vapeQuotes','vapeInvoices'];
  const sequences = ['quoteSequence','customerSequence','vapeQuoteSequence','vapeInvoiceSequence'];
  function normalize(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Backup muss ein CRM-Objekt enthalten');
    const state = structuredClone(raw);
    for (const key of collections) {
      const rows = state[key] ?? [];
      if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error(`Ungültige Sammlung: ${key}`);
      state[key] = rows;
    }
    for (const key of ['quotes','invoices','vapeQuotes','vapeInvoices']) {
      for (const doc of state[key]) {
        if (doc.items != null && (!Array.isArray(doc.items) || doc.items.some(item => !item || typeof item !== 'object' || Array.isArray(item)))) throw new Error(`Ungültige Positionen: ${key}`);
      }
    }
    for (const key of sequences) {
      const value = Number(state[key] ?? 0);
      if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Ungültiger Zähler: ${key}`);
      state[key] = value;
    }
    for (const key of ['settings','vapePrivatePrices']) {
      if (state[key] != null && (typeof state[key] !== 'object' || Array.isArray(state[key]))) throw new Error(`Ungültige Einstellungen: ${key}`);
      state[key] = state[key] || {};
    }
    state.settings = {company:'neXaro Solutions',...state.settings};
    state.vapeMarkup = Math.min(25,Math.max(15,Number(state.vapeMarkup)||25));
    return state;
  }
  function serialize(state) {
    // The public catalog is rebuilt from the shipped data at each startup.
    const {vapeProducts, _quoteFromCart, ...persistent} = state;
    return JSON.stringify(persistent);
  }
  window.nexaroState = {normalize, serialize};
})();
