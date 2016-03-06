import {inject, customElement, bindable, containerless} from 'aurelia-framework';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
import {strokeColor, strokeDash} from './edgeStyle.js';

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

  /**
   * All animations are temporarily removed because it seems to set the old y position,
   * in the case of a node adjustment, resulting in edges seemingly pointing to nowhere.
   * Maybe related to use of gsap fromTo, figure out how to animate just 'to'.
   */
  attached() {
    // Selector
    this.$edge = $(`#edge-${this.displayEdge.source.id}-${this.displayEdge.target.id}`);

    // Animate into position
    // TweenLite.fromTo(this.$edge[0], 1,
    //   {attr: {x2: this.displayEdge.source.x, y2: this.displayEdge.source.y}},
    //   {attr: {x2: this.displayEdge.target.x, y2: this.displayEdge.target.y},
    //     ease: Power1.easeIn,
    //     delay: 0.5
    //   }
    // );
  }

  sourcexChanged(newVal, oldVal) {
    // if (newVal && oldVal) {
    //   TweenLite.fromTo(this.$edge[0], 1,
    //     {attr: {x1: oldVal}},
    //     {attr: {x1: newVal}, ease: Power1.easeIn}
    //   );
    // }
  }

  sourceyChanged(newVal, oldVal) {
    // if (newVal && oldVal) {
    //   TweenLite.fromTo(this.$edge[0], 1,
    //     {attr: {y1: oldVal}},
    //     {attr: {y1: newVal}, ease: Power1.easeIn}
    //   );
    // }
  }

  targetxChanged(newVal, oldVal) {
    // if (newVal && oldVal) {
    //   TweenLite.fromTo(this.$edge[0], 1,
    //     {attr: {x2: oldVal}},
    //     {attr: {x2: newVal}, ease: Power1.easeIn}
    //   );
    // }
  }

  targetyChanged(newVal, oldVal) {
    // if (newVal && oldVal) {
    //   console.log(`edge.targetyChanged: ${this.displayEdge.target.displayName}, newVal: ${newVal}, oldVal: ${oldVal}`);
    //   TweenLite.fromTo(this.$edge[0], 1,
    //     {attr: {y2: oldVal}},
    //     {attr: {y2: newVal}, ease: Power1.easeIn}
    //   );
    // }
  }

  edgeStrokeDashArray() {
    // console.log(`=== edgeStrokeDashArray: ${strokeDash(this.displayEdge.kind)}`);
    return strokeDash(this.displayEdge.edgeKind);
  }

  edgeStyle() {
    // stroke-dasharray="none" style="stroke-width: 1px; stroke: rgb(124, 124, 124);"
  }

}
