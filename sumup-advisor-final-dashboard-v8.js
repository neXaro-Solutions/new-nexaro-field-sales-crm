// neXaro SUMUP Advisor Final Dashboard V8
// Unified flow: OCR -> Analysis -> Recommendation -> Offer

(function () {
  const state = {
    customer: null,
    analysis: null,
    recommendation: null,
    offer: null
  };

  function start(customer) {
    state.customer = customer || {};
    return state;
  }

  function processAnalysis(result) {
    state.analysis = result || {};
    state.recommendation = {
      tariff: result.tariffRecommendation || 'Prüfung erforderlich',
      hardware: result.hardwareRecommendation || 'Prüfung erforderlich',
      benefits: result.benefits || [],
      pricing: result.pricing || {}
    };

    window.dispatchEvent(new CustomEvent('nxsu:dashboard-ready', {
      detail: state
    }));

    return state.recommendation;
  }

  function createOffer() {
    state.offer = {
      customer: state.customer,
      solution: state.recommendation,
      createdAt: new Date().toISOString()
    };

    window.dispatchEvent(new CustomEvent('nxsu:offer-created', {
      detail: state.offer
    }));

    return state.offer;
  }

  window.neXaroSumUpFinalDashboard = {
    start,
    processAnalysis,
    createOffer,
    getState: () => state
  };
})();
