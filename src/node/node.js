import {inject, customElement, bindable, containerless} from 'aurelia-framework';

// bindingEngine is used statically, in the next Aurelia release it will be BindingEngine and injectable
import {bindingEngine} from 'aurelia-binding';

import $ from 'jquery';
import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
import d3 from 'd3';

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

      bindingEngine.propertyObserver(this.displayNode, 'x').subscribe((newValue, oldValue) => {
        this.animateX(this.$node, oldValue, newValue);
      });

      bindingEngine.propertyObserver(this.displayNode, 'y').subscribe((newValue, oldValue) => {
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
      TweenLite.fromTo($circle, 1,
        {attr: {fill: `rgba(255, 255, 255, 0)`, r: 0}},
        {attr: {fill: `${this.nodeColor()}`, r: 45}, ease: Elastic.easeOut}
      );
    } else {
      TweenLite.fromTo($circle, 1,
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

  // TODO: Maybe also need control/cmd key modifier to select?
  toggleSelected() {
    if (this.displayNode.selectStatus === 'unselected') {
      this.displayNode.selectStatus = 'selected';
    } else {
      this.displayNode.selectStatus = 'unselected';
    }
  }

  /**
   * Determine node fill color based on kind.
   * Color values ported from legacy, but doesn't have to be d3.
   */
  nodeColor() {
    if (this.displayNode.kind === 'trait')           return d3.rgb('blue').darker(2);
    if (this.displayNode.kind === 'class')           return d3.rgb('blue').brighter(1);
    if (this.displayNode.kind === 'object')          return d3.rgb('blue').brighter(1.6);
    if (this.displayNode.kind === 'anonymous class') return d3.rgb('gray').brighter(0.9);
    if (this.displayNode.kind === 'method')
      if (this.displayNode.name.indexOf('$') > 0)   return d3.rgb('gray').brighter(0.9);
      else                              return d3.rgb('green');
    if (this.displayNode.kind === 'constructor') {
      return 'url(#MyRadialGradientDef)';
    }
    if (this.displayNode.kind === 'value')           return d3.rgb('green').brighter(1.3);
    if (this.displayNode.kind === 'package')         return d3.rgb('white').darker(2);
  }

}
