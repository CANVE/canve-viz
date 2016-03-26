import {inject, customElement, bindable, containerless} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
import {EdgeStyle} from './edge-style';
import {EdgeTextService} from './edge-text-service';

const EDGE_ANIMATE_DURATION = 0.5;
const EDGE_ANIMATE_EASE = Power1.easeIn;
const EDGE_ANIMATE_DELAY = 1;

const HIGHLIGHT_COLOR_SOURCE = 'orange';
const HIGHLIGHT_COLOR_TARGET = 'rgb(60, 234, 245)';
const HIGHLIGHT_WIDTH = 5;

@customElement('edge')
@containerless
@inject(Element, EventAggregator, EdgeStyle, EdgeTextService)
export class Edge {
  @bindable data;
  @bindable sourcex;
  @bindable sourcey;
  @bindable targetx;
  @bindable targety;

  constructor(element, eventAggregator, edgeStyle, edgeTextService) {
    this.element = element;
    this.eventAggregator = eventAggregator;
    this.edgeStyle = edgeStyle;
    this.edgeTextService = edgeTextService;
    this._edgeTextXPos = 40;
  }

  dataChanged(newVal) {
    if (newVal) {
      this.displayEdge = newVal;
      this.calculateEdgeTextPath();
    }
  }

  calculateEdgeTextPath() {
    if (this.edgeTextService.isUpsideDown(this.displayEdge.source.x, this.displayEdge.source.y, this.displayEdge.target.x, this.displayEdge.target.y)) {
      this._isUpsideDown = true;
      this._edgeTextPath = `M${this.displayEdge.target.x} ${this.displayEdge.target.y} L${this.displayEdge.source.x} ${this.displayEdge.source.y}`;
    } else {
      this._edgeTextPath = `M${this.displayEdge.source.x} ${this.displayEdge.source.y} L${this.displayEdge.target.x} ${this.displayEdge.target.y}`;
    }
  }

  get edgePathId() {
    return `#edge-path-${this.displayEdge.source.id}-${this.displayEdge.target.id}`;
  }

  get edgePathForText() {
    // if (this.edgeTextService.isUpsideDown(this.displayEdge.source.x, this.displayEdge.source.y, this.displayEdge.target.x, this.displayEdge.target.y)) {
    //   return `M${this.displayEdge.target.x} ${this.displayEdge.target.y} L${this.displayEdge.source.x} ${this.displayEdge.source.y}`;
    // } else {
    //   return `M${this.displayEdge.source.x} ${this.displayEdge.source.y} L${this.displayEdge.target.x} ${this.displayEdge.target.y}`;
    // }
    return this._edgeTextPath;
  }

  attached() {
    // Selector
    this.$edge = $(`#edge-${this.displayEdge.source.id}-${this.displayEdge.target.id}`);

    // Animate edge target from source point
    // TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
    //   attr: {x2: this.displayEdge.source.x, y2: this.displayEdge.source.y},
    //   ease: EDGE_ANIMATE_EASE,
    //   delay: EDGE_ANIMATE_DELAY
    // });

    this.registerEvents();
  }

  sourcexChanged(newVal, oldVal) {
    this.calculateEdgeTextPath();
    // if (newVal && oldVal) {
    //   TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
    //     attr: {x1: oldVal},
    //     ease: EDGE_ANIMATE_EASE
    //   });
    // }
  }

  sourceyChanged(newVal, oldVal) {
    this.calculateEdgeTextPath();
    // if (newVal && oldVal) {
    //   TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
    //     attr: {y1: oldVal},
    //     ease: EDGE_ANIMATE_EASE
    //   });
    // }
  }

  targetxChanged(newVal, oldVal) {
    this.calculateEdgeTextPath();
    // if (newVal && oldVal) {
    //   TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
    //     attr: {x2: oldVal},
    //     ease: EDGE_ANIMATE_EASE
    //   });
    // }
  }

  /**
   * Edge y2 is already bound to newVal,
   * therefore animate FROM oldVal.
   */
  targetyChanged(newVal, oldVal) {
    this.calculateEdgeTextPath();
    // if (newVal && oldVal) {
    //   TweenLite.from(this.$edge[0], EDGE_ANIMATE_DURATION, {
    //     attr: {y2: oldVal},
    //     ease: EDGE_ANIMATE_EASE
    //   });
    // }
  }

  edgeStrokeDashArray() {
    return this.edgeStyle.strokeDash(this.displayEdge.edgeKind);
  }

  get edgeColor() {
    if (this.displayEdge.highlightSource) {
        return HIGHLIGHT_COLOR_SOURCE;
    } else if (this.displayEdge.highlightTarget) {
      return HIGHLIGHT_COLOR_TARGET;
    } else {
      return this.edgeStyle.strokeColor(this.displayEdge.edgeKind);
    }
  }

  get edgeWidth() {
    if (this.displayEdge.highlightSource || this.displayEdge.highlightTarget) {
      return HIGHLIGHT_WIDTH;
    } else {
      return 1;
    }
  }

  registerEvents() {
    this.nodeHoverInSub = this.eventAggregator.subscribe('node.hover.in', this.highlightEdges.bind(this));
    this.nodeHoverOutSub = this.eventAggregator.subscribe('node.hover.out', this.unHighlightEdges.bind(this));
    this.nodeExpandRadiusSub = this.eventAggregator.subscribe('node.expand.radius', this.adjustEdgeText.bind(this));
  }

  highlightEdges(node) {
    if (this.displayEdge.source.id === node.id) {
      this.displayEdge.highlightSource = true;
    }
    if (this.displayEdge.target.id === node.id) {
      this.displayEdge.highlightTarget = true;
    }
  }

  unHighlightEdges(node) {
    if (this.displayEdge.source.id === node.id) {
      this.displayEdge.highlightSource = false;
    }
    if (this.displayEdge.target.id === node.id) {
      this.displayEdge.highlightTarget = false;
    }
  }

  adjustEdgeText(node) {
    if (this.displayEdge.source.id === node.id) {
      this._edgeTextXPos = node.expandedRadius + 2;
    }
  }

  get edgeTextXPos() {
    return this._edgeTextXPos;
  }

  detached() {
    this.deregisterEvents();
  }

  deregisterEvents() {
    this.nodeHoverInSub.dispose();
    this.nodeHoverOutSub.dispose();
    this.nodeExpandRadiusSub.dispose();
  }

}
