/*
 * SUMUP Advisor UI V9
 * Sales focused presentation layer
 */

window.neXaroSumUpAdvisorUIV9 = {
  state: {
    customer: null,
    analysis: null,
    recommendation: null,
    offer: null
  },

  init(customer = null) {
    this.state.customer = customer;
    return this.render();
  },

  render() {
    return {
      title: 'SUMUP Lösungsberater',
      steps: [
        'Kunde & Ist-Situation',
        'Abrechnung analysieren',
        'Empfehlung',
        'Angebot'
      ],
      cards: [
        {
          id: 'current-situation',
          title: 'Ihre aktuelle Situation',
          fields: [
            'Kartenzahlungsvolumen',
            'Aktuelle Gebühren',
            'Bestehende Hardware'
          ]
        },
        {
          id: 'document-upload',
          title: 'Abrechnung analysieren',
          actions: [
            'Foto aufnehmen',
            'PDF hochladen'
          ]
        },
        {
          id: 'recommendation',
          title: 'Ihre Empfehlung',
          fields: [
            'Tarif',
            'Hardware',
            'Vorteile'
          ]
        },
        {
          id: 'offer',
          title: 'Angebot vorbereiten',
          actions: [
            'Angebot erstellen'
          ]
        }
      ]
    };
  },

  updateRecommendation(data) {
    this.state.recommendation = data;
    window.dispatchEvent(new CustomEvent('nxsu:recommendation-updated', {
      detail: data
    }));
    return data;
  }
};
