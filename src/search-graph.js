import {inject} from 'aurelia-framework';
import {customElement, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@customElement('search-graph')
@inject(EventAggregator)
export class SearchGraph {
  @bindable data;
  
  constructor(pubSub) {
    this.pubSub = pubSub;
    // TODO somewhere publish user's selected search query
  }

}
