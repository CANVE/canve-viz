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
    let $inputElement = $(this.element).find('input');
    let domInputElement = $inputElement.get(0);

    new Awesomplete(
      domInputElement,
      { list: nodeNames }
    );
    domInputElement.addEventListener('awesomplete-selectcomplete', () => {
      let selectedVal = $inputElement.val();
      console.log(`awesomeplete value selected: ${selectedVal}`);
      // TODO publish user's selected search query
    });
  }

}
