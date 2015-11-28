import {inject} from 'aurelia-framework';
import {customElement, bindable, containerless} from 'aurelia-framework';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';

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
    }
  }

  attached() {
    let nodeId = `#node-${this.displayNode.id}`;
    let $node = $(`#node-${this.displayNode.id}`);
    console.dir($node[0]);

    TweenLite.fromTo($node[0], 3,
      {attr: {cx:0, cy:0}},
      {attr: {cx:this.displayNode.x, cy:this.displayNode.y}}
    );
  }

}
