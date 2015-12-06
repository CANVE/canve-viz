import {inject, customElement, bindable, containerless} from 'aurelia-framework';

@customElement('edge')
@containerless
@inject(Element)
export class Edge {
  @bindable data;

  constructor(element) {
    this.element = element;
  }

  dataChanged(newVal) {
    if (newVal) {
      this.displayEdge = newVal;
    }
  }
}
