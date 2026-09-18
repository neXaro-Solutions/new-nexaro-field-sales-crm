/*
 * SUMUP Offer Generation V7
 * Finalizes the advisory workflow:
 * analysis -> recommendation -> offer payload -> CRM handoff
 */

(function () {
  const MAX_HARDWARE_DISCOUNT = 0.25;

  function calculateHardwarePrice(listPrice, discount = 0) {
    const safeDiscount = Math.min(Math.max(discount, 0), MAX_HARDWARE_DISCOUNT);
    return {
      listPrice,
      discountPercent: safeDiscount * 100,
      discountAmount: listPrice * safeDiscount,
      customerPrice: listPrice * (1 - safeDiscount)
    };
  }

  function createOffer(recommendation, options = {}) {
    const hardware = (recommendation.hardware || []).map(item => ({
      ...item,
      pricing: calculateHardwarePrice(item.price, options.hardwareDiscount || 0)
    }));

    const offer = {
      type: 'SUMUP_ADVISOR_OFFER',
      createdAt: new Date().toISOString(),
      customer: options.customer || null,
      tariff: recommendation.tariff,
      hardware,
      benefits: recommendation.benefits || [],
      analysis: recommendation.analysis || null
    };

    window.dispatchEvent(new CustomEvent('nxsu:offer-created', {
      detail: offer
    }));

    return offer;
  }

  window.neXaroSumUpOfferV7 = {
    createOffer,
    maxHardwareDiscount: MAX_HARDWARE_DISCOUNT
  };
})();
