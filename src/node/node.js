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
      // console.dir(this.displayNode);
    }
  }

  get toolTip() {
    return `${this.displayNode.kind} ${this.displayNode.name} (debug id ${this.displayNode.id})`;
  }

  attached() {
    // Selector
    let $node = $(`#node-${this.displayNode.id}`);

    // Animate into position
    TweenLite.fromTo($node[0], 1,
      {attr: {cx: this.displayNode.px, cy: this.displayNode.py}},
      {attr: {cx: this.displayNode.x, cy: this.displayNode.y}, ease: Power1.easeIn}
    );
  }

}
