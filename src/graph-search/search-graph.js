import {inject} from 'aurelia-framework';
import {customElement, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import $ from 'jquery';
import 'awesomplete/awesomplete.js';

@customElement('search-graph')
@inject(Element, EventAggregator)
export class SearchGraph {
  @bindable data;

  constructor(element, pubSub) {
    this.element = element;
    this.pubSub = pubSub;
  }

  dataChanged(newVal) {
    let nodes = newVal.nodes().map(function(id) {
      return {
        id: id,
        data: newVal.node(id)
      };
    });

    let $inputElement = $(this.element).find('input');
    let domInputElement = $inputElement.get(0);

    new Awesomplete( domInputElement, {
      minChars: 1,
      maxItems: 100,
      list: nodes,
      item: (suggestion, input) => {
        let node = suggestion.value,
          suggestedElem = document.createElement('li');
        suggestedElem.appendChild(document.createTextNode(node.data.displayName + ' (' + node.id + ')'));
        return suggestedElem;
      },
      filter: (suggestion, input) => {
        let node = suggestion.value;
        return node.data.name.toLowerCase().indexOf(input.toLowerCase()) > -1 ||
          node.id === input;
      },
      sort: function compare(suggestionA, suggestionB) {
        let nodeA = suggestionA.value,
          nodeB = suggestionB.value;

        if (nodeA.data.name < nodeB.data.name) return -1;
        if (nodeA.data.name > nodeB.data.name) return 1;
        return 0;
      },
      replace: (suggestion) => {
        let id = suggestion.value.id,
          node = newVal.node(id);
        domInputElement.value = node.displayName + ' (' + node.id + ')';
        this.pubSub.publish('search.node', id);
      }
    });
  }

}
