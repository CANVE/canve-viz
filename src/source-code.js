import {inject} from 'aurelia-framework';
import {customElement, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@customElement('source-code')
@inject(EventAggregator)
export class SourceCode {

  constructor(pubSub) {
    this.pubSub = pubSub;
    this.pubSub.subscribe('node.clicked', payload => {
      // TODO: put payload in scope so that it can be rendered in source-code.html template
      console.log(`*** source-code subscribe: ${payload}`);
    });
  }

}
