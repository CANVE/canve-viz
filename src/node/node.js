import {inject} from 'aurelia-framework';
import {customElement, bindable} from 'aurelia-framework';

@customElement('node')
@inject(Element)
export class Node {
  @bindable data;

  constructor(element) {
    this.element = element;
  }

  dataChanged(newVal) {
  }

}
