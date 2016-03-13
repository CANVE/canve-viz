import {inject, customElement, bindable, containerless, TaskQueue} from 'aurelia-framework';
import {BindingEngine} from 'aurelia-binding';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
import d3 from 'd3';
import {GraphTextService} from '../graph/graph-text-service';
import {NodeCalculator} from './node-calculator';
import {fillColor} from './node-style';

@customElement('node')
@containerless()
@inject(Element, BindingEngine, GraphTextService, TaskQueue, NodeCalculator)
export class Node {
  @bindable data;

  constructor(element, bindingEngine, graphTextService, taskQueue, nodeCalculator) {
    this.element = element;
    this.bindingEngine = bindingEngine;
    this.graphTextService = graphTextService;
    this.taskQueue = taskQueue;
    this.nodeCalculator = nodeCalculator;
    this.nodeFontSize = 12;
  }

  // TODO consider changing all animations to TweenLite.from because data binding has already set correct "to" position
  dataChanged(newVal) {
    if (newVal) {
      this.displayNode = newVal;
      this.displayNodeTextLines = this.graphTextService.formattedText(this.displayNode);

      // this.bindingEngine.propertyObserver(this.displayNode, 'x').subscribe((newValue, oldValue) => {
      //   this.animateX(this.$node, oldValue, newValue);
      // });
      //
      // this.bindingEngine.propertyObserver(this.displayNode, 'y').subscribe((newValue, oldValue) => {
      //   this.animateY(this.$node, oldValue, newValue);
      // });
    }
  }

  // Use micro task queue to delay calculations until AFTER svg is appended to body
  expandNode() {
    this.taskQueue.queueMicroTask(() => {
      let svgRect = this.$node[0].getBBox();
      this.displayNode.expandedRadius = this.nodeCalculator.radius(svgRect, this.nodeFontSize);

      // Animate in radius to make newly added nodes stand out
      TweenLite.fromTo(this.$circle[0], 1.5,
        {attr: {r: 0}},
        {attr: {r: this.displayNode.expandedRadius}, ease: Power1.easeIn}
      );

      this.displayNode.centerTextAtY = this.nodeCalculator.centerVertically(svgRect);
    });
  }

  // These attributes use dirty checking because they can only be calculated after svg is appended to body
  get expandedRadius() {
    return this.displayNode.expandedRadius;
  }
  get centerTextAtY() {
    return this.displayNode.centerTextAtY;
  }

  toolTip() {
    return `${this.displayNode.kind} ${this.displayNode.name} (debug id ${this.displayNode.id})`;
  }

  // dataChanged runs before attached
  attached() {
    // Selectors
    this.$node = $(`#node-${this.displayNode.id}`);
    this.$circle = this.$node.find('circle');

    this.expandNode();

    // Animate into position
    TweenLite.fromTo(this.$node[0], 1,
      {attr: {transform: `translate(${this.displayNode.px}, ${this.displayNode.py})`}},
      {attr: {transform: `translate(${this.displayNode.x}, ${this.displayNode.y})`}, ease: Power1.easeIn}
    );

    this.bindingEngine.propertyObserver(this.displayNode, 'x').subscribe((newValue, oldValue) => {
      this.animateX(this.$node, oldValue, newValue);
    });

    this.bindingEngine.propertyObserver(this.displayNode, 'y').subscribe((newValue, oldValue) => {
      this.animateY(this.$node, oldValue, newValue);
    });
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

  nodeColor() {
    return fillColor(this.displayNode);
  }

}
