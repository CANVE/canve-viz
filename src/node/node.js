import {inject, customElement, bindable, containerless, TaskQueue} from 'aurelia-framework';
import {BindingEngine} from 'aurelia-binding';
import {EventAggregator} from 'aurelia-event-aggregator';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
import d3 from 'd3';
import {GraphTextService} from '../graph/graph-text-service';
import {NodeCalculator} from './node-calculator';
import {fillColor} from './node-style';

@customElement('node')
@containerless()
@inject(Element, BindingEngine, EventAggregator, GraphTextService, TaskQueue, NodeCalculator)
export class Node {
  @bindable data;

  constructor(element, bindingEngine, eventAggregator, graphTextService, taskQueue, nodeCalculator) {
    this.element = element;
    this.bindingEngine = bindingEngine;
    this.eventAggregator = eventAggregator;
    this.graphTextService = graphTextService;
    this.taskQueue = taskQueue;
    this.nodeCalculator = nodeCalculator;
    this.nodeFontSize = 12;
  }

  dataChanged(newVal) {
    if (newVal) {
      this.displayNode = newVal;
      this.displayNodeTextLines = this.graphTextService.formattedText(this.displayNode);
    }
  }

  attached() {
    // Selectors
    this.$node = $(`#node-${this.displayNode.id}`);
    this.$circle = this.$node.find('circle');

    this.expandNode();
    this.registerEvents();
  }

  /**
   * Calculate how big node radius needs to be to accomodate all the lines of text.
   * Svg element must have already been physically appended to DOM for this to work,
   * (required by getBBox).
   */
  expandNode() {
    let svgRect = this.$node[0].getBBox();
    this.displayNode.expandedRadius = this.nodeCalculator.radius(svgRect, this.nodeFontSize);
    this.displayNode.centerTextAtY = this.nodeCalculator.centerVertically(svgRect);
    this.animateRadius();
  }

  animateRadius() {
    TweenLite.fromTo(this.$circle[0], 1.5,
      {attr: {r: 0}},
      {attr: {r: this.displayNode.expandedRadius}, ease: Power1.easeIn}
    );
  }

  get expandedRadius() {
    return this.displayNode.expandedRadius;
  }

  get centerTextAtY() {
    return this.displayNode.centerTextAtY;
  }

  toolTip() {
    return `${this.displayNode.kind} ${this.displayNode.name} (debug id ${this.displayNode.id})`;
  }

  nodeColor() {
    return fillColor(this.displayNode);
  }

  registerEvents() {
    this.xChangeSub = this.bindingEngine.propertyObserver(this.displayNode, 'x').subscribe((newValue, oldValue) => {
      this.animateX(this.$node, oldValue, newValue);
    });

    this.yChangeSub = this.bindingEngine.propertyObserver(this.displayNode, 'y').subscribe((newValue, oldValue) => {
      this.animateY(this.$node, oldValue, newValue);
    });

    this.$node.on('mouseenter.node', this.handleMouseIn.bind(this));
    this.$node.on('mouseleave.node', this.handleMouseOut.bind(this));
  }

  animateX(selector, fromPos, toPos) {
    TweenLite.fromTo(selector[0], 1,
      {attr: {transform: `translate(${fromPos}, ${this.displayNode.y})`}},
      {attr: {transform: `translate(${toPos}, ${this.displayNode.y})`}, ease: Power1.easeIn}
    );
  }

  animateY(selector, fromPos, toPos) {
    TweenLite.fromTo(selector[0], 1,
      {attr: {transform: `translate(${this.displayNode.x}, ${fromPos})`}},
      {attr: {transform: `translate(${this.displayNode.x}, ${toPos})`}, ease: Power1.easeIn}
    );
  }

  handleMouseIn() {
    this.eventAggregator.publish('node.hover.in', this.displayNode);
  }

  handleMouseOut() {
    this.eventAggregator.publish('node.hover.out', this.displayNode);
  }

  /**
   * Toggle node selected status
   */
  toggleSelected(event) {
    if (this.displayNode.selectStatus === 'unselected') {
      this.displayNode.selectStatus = 'selected';
      this.selectNode();
    } else {
      this.displayNode.selectStatus = 'unselected';
      this.unselectNode();
    }
  }

  selectNode() {
    TweenLite.to(this.$circle[0], 0.5, {
      attr: { stroke : 'rgb(222, 18, 30)', 'stroke-width' : 3 },
      ease: Power3.easeInOut
    });
  }

  unselectNode() {
    TweenLite.to(this.$circle[0], 0.5, {
      attr: { stroke : this.nodeColor(), 'stroke-width' : 0 },
      ease: Power3.easeInOut
    });
  }

  detached() {
    this.unregisterEvents();
  }

  unregisterEvents() {
    this.xChangeSub.dispose();
    this.yChangeSub.dispose();
    this.$node.off('mouseenter.node');
    this.$node.off('mouseleave.node');
  }

}
