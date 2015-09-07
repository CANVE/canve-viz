import {customAttribute, bindable} from 'aurelia-framework';
import d3 from 'd3';

@customAttribute('my-attribute')
@inject(Element)
export class MyAttribute {
  @bindable foo;
  @bindable bar;

  constructor(element) {
    console.log('*** my-attribute is loaded');
    this.element = element;
  }
}
