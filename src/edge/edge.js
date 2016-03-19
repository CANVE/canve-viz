import {inject, customElement, bindable, containerless} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
import {EdgeStyle} from './edge-style';

const EDGE_ANIMATE_DURATION = 0.5;
const EDGE_ANIMATE_EASE = Power1.easeIn;

@customElement('edge')
@containerless
@inject(Element, EventAggregator, EdgeStyle)
export class Edge {
  @bindable data;
  @bindable sourcex;
  @bindable sourcey;
  @bindable targetx;
  @bindable targety;

  constructor(element, eventAggregator, edgeStyle) {
    this.element = element;
    this.eventAggregator = eventAggregator;
    this.edgeStyle = edgeStyle;
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

    this.registerEvents();
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

  edgeStrokeDashArray() {
    return this.edgeStyle.strokeDash(this.displayEdge.edgeKind);
  }

  get edgeColor() {
    if (this.displayEdge.highlight) {
        return 'orange';
    } else {
      return this.edgeStyle.strokeColor(this.displayEdge.edgeKind);
    }
  }

  get edgeWidth() {
    if (this.displayEdge.highlight) {
      return 5;
    } else {
      return 1;
    }
  }

  registerEvents() {
    this.nodeHoverInSub = this.eventAggregator.subscribe('node.hover.in', this.highlightEdges.bind(this));
    this.nodeHoverOutSub = this.eventAggregator.subscribe('node.hover.out', this.unHighlightEdges.bind(this));
  }

  highlightEdges(node) {
    if (this.displayEdge.source.id === node.id || this.displayEdge.target.id === node.id) {
      console.log(`=== SHOULD HIGHLIGHT ${node.id}`);
      this.displayEdge.highlight = true;
    }
  }

  unHighlightEdges(node) {
    if (this.displayEdge.source.id === node.id || this.displayEdge.target.id === node.id) {
      console.log(`=== SHOULD UNHIGHLIGHT ${node.id}`);
      this.displayEdge.highlight = false;
    }
  }

  detached() {
    this.deregisterEvents();
  }

  deregisterEvents() {

  }

}
