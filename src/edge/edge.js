import {inject, customElement, bindable, containerless} from 'aurelia-framework';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
import {strokeColor, strokeDash} from './edgeStyle.js';

const EDGE_ANIMATE_DURATION = 0.5;
const EDGE_ANIMATE_EASE = Power1.easeIn;

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

    // Animate edge target from source point
    TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
      attr: {x2: this.displayEdge.source.x, y2: this.displayEdge.source.y},
      ease: EDGE_ANIMATE_EASE
    });

  }

  sourcexChanged(newVal, oldVal) {
    if (newVal && oldVal) {
      TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
        attr: {x1: oldVal},
        ease: EDGE_ANIMATE_EASE,
      });
    }
  }

  sourceyChanged(newVal, oldVal) {
    if (newVal && oldVal) {
      TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
        attr: {y1: oldVal},
        ease: EDGE_ANIMATE_EASE,
      });
    }
  }

  targetxChanged(newVal, oldVal) {
    if (newVal && oldVal) {
      TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
        attr: {x2: oldVal},
        ease: EDGE_ANIMATE_EASE
      });
    }
  }

  /**
   * Edge y2 is already bound to newVal,
   * therefore animate FROM oldVal.
   */
  targetyChanged(newVal, oldVal) {
    if (newVal && oldVal) {
      TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
        attr: {y2: oldVal},
        ease: EDGE_ANIMATE_EASE
      });
    }
  }

  // TODO edge styling based on edgeKind is still a wip...
  edgeStrokeDashArray() {
    return strokeDash(this.displayEdge.edgeKind);
  }

  // TODO edge styling based on edgeKind is still a wip...
  edgeStyle() {
    // stroke-dasharray="none" style="stroke-width: 1px; stroke: rgb(124, 124, 124);"
  }

}
