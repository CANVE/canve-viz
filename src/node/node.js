import {inject} from 'aurelia-framework';
import {customElement, bindable, containerless} from 'aurelia-framework';
import $ from 'jquery';
// import 'npm:gsap@1.18.0/src/minified/TweenMax.min.js';
// import 'npm:gsap@1.18.0/src/minified/plugins/AttrPlugin.min.js';

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
      console.dir(this.displayNode);
      // TODO Delegate to node display helper to determine fill color

      // Experiment with GSAP animation
      // let $node = $('.node');
      let $node = $(this.element).find('.node');
      // let $domNode = $node.get(0);
      // TweenLite.from(this.element, 10, {attr:{cx:0, cy:0}, ease: Linear.easeNone});
      // TweenLite.from($node, 10, {attr:{cx:0, cy:0}, ease: Linear.easeNone});


    }
  }

  attached() {
    let nodeId = `#node-${this.displayNode.id}`;
    let $node = $(`#node-${this.displayNode.id}`);
    console.dir($node[0]);
    // TweenLite.to('.node', 3, {attr:{cx:0, cy:0}, ease: Linear.easeNone});
    // TweenLite.from('.node', 3, {attr:{cx:this.displayNode.x, cy:this.displayNode.y}, ease: Linear.easeNone});
    // TweenLite.from($node[0], 3, {attr:{cx:this.displayNode.x, cy:this.displayNode.y}, ease: Linear.easeNone});
    // TweenLite.to('.node', 10, {attr:{cx:this.displayNode.x, cy:this.displayNode.y}, ease: Linear.easeNone});
    // TweenLite.to('#node-' + this.displayNode.id, 10, {attr:{cx:this.displayNode.x, cy:this.displayNode.y}, ease: Linear.easeNone});

    TweenLite.fromTo($node[0], 3,
      {attr: {cx:0, cy:0}},
      {attr: {cx:this.displayNode.x, cy:this.displayNode.y}}
    );
  }

}
