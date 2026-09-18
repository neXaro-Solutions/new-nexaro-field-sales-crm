/*
 * SUMUP Finalization Layer V6
 * Connects OCR results, pricing rules and CRM offer preparation.
 */

(function () {
  const HARDWARE_DISCOUNT_LIMIT = 0.25;

  function applyHardwareDiscount(listPrice, discount = 0) {
    const safeDiscount = Math.min(Math.max(discount, 0), HARDWARE_DISCOUNT_LIMIT);
    return {
      listPrice,
      discountPercent: safeDiscount * 100,
      customerPrice: Number((listPrice * (1 - safeDiscount)).toFixed(2))
    };
  }

  function buildCustomerAnalysis(ocrData) {
    return {
      provider: ocrData.provider || 'unbekannt',
      monthlyVolume: Number(ocrData.monthlyVolume || 0),
      transactions: Number(ocrData.transactions || 0),
      currentFees: Number(ocrData.currentFees || 0),
      source: 'ocr-analysis'
    };
  }

  function createRecommendation(data) {
    const volume = data.monthlyVolume;
    const plus = volume > 3000;

    return {
      tariff: plus ? 'SUMUP Zahlungen Plus' : 'SUMUP umsatzbasiert',
      hardware: volume > 10000 ? 'SUMUP Terminal' : 'SUMUP Solo',
      reasons: [
        'Empfehlung anhand Zahlungsvolumen erstellt',
        'Hardware passend zum Einsatzprofil gewählt',
        'Kosten transparent vergleichbar'
      ]
    };
  }

  window.neXaroSumUpFinalizationV6 = {
    analyzeDocument(ocrResult) {
      const analysis = buildCustomerAnalysis(ocrResult);
      const recommendation = createRecommendation(analysis);

      window.dispatchEvent(new CustomEvent('nxsu:final-analysis-ready', {
        detail: { analysis, recommendation }
      }));

      return { analysis, recommendation };
    },

    hardwarePrice(listPrice, discount) {
      return applyHardwareDiscount(listPrice, discount);
    }
  };
})();
