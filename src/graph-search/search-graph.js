import {inject} from 'aurelia-framework';
import {customElement, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
// import * as Awesomplete from 'npm:awesomplete@1.0.0/awesomplete.js';
import $ from 'jquery';
import 'npm:awesomplete@1.0.0/awesomplete.js';

@customElement('search-graph')
@inject(Element, EventAggregator)
export class SearchGraph {
  @bindable data;

  constructor(element, pubSub) {
    this.element = element;
    this.pubSub = pubSub;
    // TODO somewhere publish user's selected search query
  }

  dataChanged(newVal) {
    console.log('search-graph newVal:');
    console.dir(newVal);
    let nodeNames = newVal.map( node => {
      return node.name;
    });
    new Awesomplete(
      $(this.element).find('input').get(0),
      { list: nodeNames }
    );
    // Awesomplete.constructor(this.element, { list: nodeNames });
  }

}
