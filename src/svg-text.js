import {inject, customAttribute, bindable} from 'aurelia-framework';
import d3 from 'd3';
import { formattedText } from 'graph-text';

@customAttribute('svgtext')
@inject(Element)
export class SvgText {
  @bindable textdata;

  constructor(element) {
    this.element = element;
    this.initHiddenSvg();
  }

  initHiddenSvg() {
    this.hiddenSVG = d3.select(this.element)
      .append('svg:svg')
      // .attr('width', 0)
      .attr('width', 500)
      // .attr('height', 0);
      .attr('height', 500);

    this.svgText = this.hiddenSVG.append('svg:text')
      //  .attr('y', -500)
      //  .attr('x', -500)
       .attr('y', 100)
       .attr('x', 100)
       .style('font-size', this.sphereFontSize);
  }

  calcBBox(node) {
    this.svgText.selectAll('tspan').remove();
    formattedText(node).forEach(line => {
      this.svgText.append('tspan')
        .attr("text-anchor", "middle")
        .attr('x', 0)
        .attr('dy', '1.2em')
        .text(line);
    });
    return this.svgText.node().getBBox();
  }

}
