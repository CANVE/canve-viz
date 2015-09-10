import {inject} from 'aurelia-framework';
import {customElement, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@customElement('source-code')
@inject(EventAggregator)
export class SourceCode {

  constructor(pubSub) {
    this.pubSub = pubSub;
    this.pubSub.subscribe('node.clicked', payload => {
      console.log(`*** source-code subscribe: ${payload}`);
    });
  }

  subscribe(){
    this.pubSub.subscribe('node.clicked', payload => {
      console.log(`*** source-code subscribe: ${payload}`);
    });
  }
}
