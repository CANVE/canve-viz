import {inject, customElement, bindable, containerless, TaskQueue} from 'aurelia-framework';
import {BindingEngine} from 'aurelia-binding';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
import d3 from 'd3';
import {GraphTextService} from '../graph/graph-text-service';
import {fillColor} from './node-style';

@customElement('node')
@containerless
@inject(Element, BindingEngine, GraphTextService, TaskQueue)
export class Node {
  @bindable data;

  constructor(element, bindingEngine, graphTextService, taskQueue) {
    this.element = element;
    this.bindingEngine = bindingEngine;
    this.graphTextService = graphTextService;
    this.taskQueue = taskQueue;
    this.nodeFontSize = 12;
  }

  dataChanged(newVal) {
    if (newVal) {
      this.displayNode = newVal;
      this.displayNodeTextLines = this.graphTextService.formattedText(this.displayNode);
      this.expandNode();

      this.bindingEngine.propertyObserver(this.displayNode, 'x').subscribe((newValue, oldValue) => {
        this.animateX(this.$node, oldValue, newValue);
      });

      this.bindingEngine.propertyObserver(this.displayNode, 'y').subscribe((newValue, oldValue) => {
        this.animateY(this.$node, oldValue, newValue);
      });
    }
  }

  // Use micro task queue to delay bounding box calculation until AFTER svg is appended to body
  expandNode() {
    this.taskQueue.queueMicroTask(() => {
      let svgRect = this.$node[0].getBBox();
      this.displayNode.expandedRadius = Math.max(svgRect.width, svgRect.height)/2 + this.nodeFontSize;
      this.displayNode.centerTextAtY = -(svgRect.height/4);
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

  attached() {
    // Selectors
    this.$node = $(`#node-${this.displayNode.id}`);
    this.$circle = this.$node.find('circle');

    // Animate into position
    TweenLite.fromTo(this.$node[0], 1,
      {attr: {transform: `translate(${this.displayNode.px}, ${this.displayNode.py})`}},
      {attr: {transform: `translate(${this.displayNode.x}, ${this.displayNode.y})`}, ease: Power1.easeIn}
    );

    // Fade in fill color and grow in radius
    // HACK tweenlite messing up gradient fill
    if (this.displayNode.kind !== 'constructor') {
      TweenLite.fromTo(this.$circle[0], 1.5,
        {attr: {fill: `rgba(255, 255, 255, 0)`}},
        {attr: {fill: `${this.nodeColor()}`}, ease: Elastic.easeOut}
      );
    } else {
      TweenLite.fromTo(this.$circle[0], 1.5,
        {attr: {r: 0}},
        {attr: {r: 45}, ease: Power1.easeIn}
      );
    }
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
