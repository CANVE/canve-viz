export class GraphInteractionModel {

  constructor() {
    this.interactions = [
      { display: 'Calls', internal: 'calls', options: [ 'of it', 'by it'], selectedVal: '' },
      { display: 'Extensions', internal: 'extensions', options: [ 'of it', 'by it'], selectedVal: '' },
      { display: 'Instantiation', internal: 'instantiation', options: [ 'of it', 'by it'], selectedVal: '' }
    ];

    this.callsSelectedVal = '';
    this.extensionsSelectedVal = '';
    this.instantiationSelectedVal = '';
  }

}
