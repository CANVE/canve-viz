import {inject, customElement, bindable, containerless} from 'aurelia-framework';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';

@customElement('edge')
@containerless
@inject(Element)
export class Edge {
  @bindable data;
  @bindable sourcex;
  @bindable sourcey;
  @bindable targetx;
  @bindable targety;

  constructor(element) {
    this.element = element;
  }

  dataChanged(newVal) {
    if (newVal) {
      this.displayEdge = newVal;
    }
  }

  attached() {
    // Selector
    this.$edge = $(`#edge-${this.displayEdge.source.id}-${this.displayEdge.target.id}`);

    // Animate into position
    TweenLite.fromTo(this.$edge[0], 1,
      {attr: {x2: this.displayEdge.source.x, y2: this.displayEdge.source.y}},
      {attr: {x2: this.displayEdge.target.x, y2: this.displayEdge.target.y}, ease: Power1.easeIn}
    );
  }

  // TODO animate line positions based on source/target x/y changes
  sourcexChanged(newVal, oldVal) {
    if (newVal && oldVal) {
      console.log(`=== edge sourcexChanged: newVal = ${newVal}, oldVal = ${oldVal}`);
    }
  }

  sourceyChanged(newVal, oldVal) {
    if (newVal && oldVal) {
      console.log(`=== edge sourceyChanged: newVal = ${newVal}, oldVal = ${oldVal}`);
    }
  }

  // TODO: Implement for line x1/x2 and y1/y2
  // animateX(selector, fromPos, toPos) {
  //   TweenLite.fromTo(selector[0], 1,
  //     {attr: {transform: `translate(${fromPos}, ${this.displayNode.y})`}},
  //     {attr: {transform: `translate(${toPos}, ${this.displayNode.y})`}, ease: Power1.easeIn}
  //   );
  // }
  //
  // animateY(selector, fromPos, toPos) {
  //   TweenLite.fromTo(selector[0], 1,
  //     {attr: {transform: `translate(${this.displayNode.x}, ${fromPos})`}},
  //     {attr: {transform: `translate(${this.displayNode.x}, ${toPos})`}, ease: Power1.easeIn}
  //   );
  // }
}
