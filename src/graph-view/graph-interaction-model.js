// experiment to figure out what the graph interaction model should look like
export class GraphInteractionModel {

  constructor() {
    this.interactions = [
      {
        display: 'calls',
        options: [ 'of it', 'by it'],
        selectedVal: 'of it'
      },
      {
        display: 'foo',
        options: [ 'of it', 'by it'],
        selectedVal: 'of it'
      }
    ];
  }
}
