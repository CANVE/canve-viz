import {inject} from 'aurelia-framework';
import {customElement, bindable, containerless} from 'aurelia-framework';

@customElement('node')
@containerless
@inject(Element)
export class Node {
  @bindable data;

  constructor(element) {
    this.element = element;
  }

  dataChanged(newVal) {
    if (newVal) {
      this.displayNode = newVal;
      console.dir(this.displayNode);
      // TODO Delegate to node display helper to determine fill color
      this.styleObject = {
        top: this.displayNode.y + 'px',
        left: this.displayNode.x + 'px'
      };
    }
  }

}
