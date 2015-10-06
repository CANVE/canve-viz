import {inject} from 'aurelia-framework';
import {customElement, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import $ from 'jquery';
import 'npm:awesomplete@1.0.0/awesomplete.js';

@customElement('search-graph')
@inject(Element, EventAggregator)
export class SearchGraph {
  @bindable data;

  constructor(element, pubSub) {
    this.element = element;
    this.pubSub = pubSub;
  }

  dataChanged(newVal) {
    let nodeNames = newVal.map( node => {
      return node.displayName;
    });
    new Awesomplete(
      $(this.element).find('input').get(0),
      { list: nodeNames }
    );
    $(this.element).find('input').get(0).addEventListener('awesomplete-selectcomplete', () => {
      let selectedVal = $(this.element).find('input').val();
      console.log(`awesomeplete value selected: ${selectedVal}`);
      // TODO publish user's selected search query
    });
  }

}
