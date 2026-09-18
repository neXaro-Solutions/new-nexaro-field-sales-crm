/*
 * neXaro SUMUP Advisor V9 Integration
 * Connects the new advisor UI flow with the existing CRM SUMUP modules.
 */
(function(){
  window.neXaroSumUpAdvisorIntegrationV9 = {
    state: {
      lead: null,
      analysis: null,
      recommendation: null
    },

    start(lead){
      this.state.lead = lead || null;
      window.dispatchEvent(new CustomEvent('nxsu:advisor-opened', {
        detail: { lead }
      }));
      return this.state;
    },

    updateRecommendation(recommendation){
      this.state.recommendation = recommendation;
      window.dispatchEvent(new CustomEvent('nxsu:recommendation-updated', {
        detail: recommendation
      }));
    },

    prepareOffer(){
      const offer = {
        lead: this.state.lead,
        recommendation: this.state.recommendation,
        createdAt: new Date().toISOString()
      };

      window.dispatchEvent(new CustomEvent('nxsu:offer-created', {
        detail: offer
      }));

      return offer;
    }
  };
})();
