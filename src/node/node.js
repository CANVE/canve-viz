import {inject, customElement, bindable, containerless} from 'aurelia-framework';
import {BindingEngine} from 'aurelia-binding';
import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
import d3 from 'd3';
import {fillColor} from './node-style';

@customElement('node')
@containerless
@inject(Element, BindingEngine)
export class Node {
  @bindable data;

  constructor(element, bindingEngine) {
    this.element = element;
    this.bindingEngine = bindingEngine;
  }

  dataChanged(newVal) {
    if (newVal) {
      this.displayNode = newVal;

      this.bindingEngine.propertyObserver(this.displayNode, 'x').subscribe((newValue, oldValue) => {
        this.animateX(this.$node, oldValue, newValue);
      });

      this.bindingEngine.propertyObserver(this.displayNode, 'y').subscribe((newValue, oldValue) => {
        this.animateY(this.$node, oldValue, newValue);
      });
    }
  }

  toolTip() {
    return `${this.displayNode.kind} ${this.displayNode.name} (debug id ${this.displayNode.id})`;
  }

  attached() {
    // Selectors
    this.$node = $(`#node-${this.displayNode.id}`);
    let $circle = this.$node.find('circle');

    // Animate into position
    TweenLite.fromTo(this.$node[0], 1,
      {attr: {transform: `translate(${this.displayNode.px}, ${this.displayNode.py})`}},
      {attr: {transform: `translate(${this.displayNode.x}, ${this.displayNode.y})`}, ease: Power1.easeIn}
    );

    // Fade in fill color and grow in radius
    // HACK tweenlite messing up gradient fill
    if (this.displayNode.kind !== 'constructor') {
      TweenLite.fromTo($circle[0], 1.5,
        {attr: {fill: `rgba(255, 255, 255, 0)`, r: 0}},
        {attr: {fill: `${this.nodeColor()}`, r: 45}, ease: Elastic.easeOut}
      );
    } else {
      TweenLite.fromTo($circle[0], 1.5,
        {attr: {r: 0}},
        {attr: {r: 45}, ease: Power1.easeIn}
      );
    }
  }

  // TODO Animate the removed node out of display, fade, shrink, etc.
  detached() {
    console.log(`${this.displayNode.id} is detached`);
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
    } else {
      this.displayNode.selectStatus = 'unselected';
    }
  }

  nodeColor() {
    return fillColor(this.displayNode);
  }

  get strokeColor() {
    let result = this.nodeColor();
    if (this.displayNode.selectStatus === 'selected') {
      result = 'rgb(222, 18, 30)';
    }
    return result;
  }

  get strokeWidth() {
    let result = 0;
    if (this.displayNode.selectStatus === 'selected') {
      result = 3;
    }
    return result;
  }

}
