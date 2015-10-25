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
      item: (node, input) => {
        let suggestedElem = document.createElement('li');
        suggestedElem.appendChild(document.createTextNode(node.data.displayName + ' (' + node.id + ')'));
        return suggestedElem;
      },
      filter: (node, input) => {
        return node.data.name.toLowerCase().indexOf(input.toLowerCase()) > -1 ||
          node.id === input;
      },
      sort: function compare(a, b) {
        if (a.data.name < b.data.name) return -1;
        if (a.data.name > b.data.name) return 1;
        return 0;
      },
      replace: (text) => {
        var id = text.substring(text.indexOf('(') + 1, text.indexOf(')'));
        var node = newVal.node(id);
        this.pubSub.publish('search.node', id);
      }
    });
  }

}
