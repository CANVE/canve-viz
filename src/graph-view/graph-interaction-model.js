export class GraphInteractionModel {

  constructor() {
    this.interactions = [
      { display: 'Calls', options: [ 'of it', 'by it'], selectedVal: '' },
      { display: 'Extensions', options: [ 'of it', 'by it'], selectedVal: '' },
      { display: 'Instantiation', options: [ 'of it', 'by it'], selectedVal: '' }
    ];
  }
}
