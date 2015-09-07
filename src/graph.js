import {inject, customAttribute} from 'aurelia-framework';
import d3 from 'd3';

@customAttribute('graph')
@inject(Element)
export class Graph {

  constructor(element) {
    this.element = element;
  }

  valueChanged(newValue){
    if (newValue) {
      console.log('*** graph newValue = ' + newValue);
      var sampleSVG = d3.select(this.element)
          .append("svg")
          .attr("width", 100)
          .attr("height", 100);

      sampleSVG.append("circle")
          .style("stroke", "gray")
          .style("fill", "white")
          .attr("r", 40)
          .attr("cx", 50)
          .attr("cy", 50)
          .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
          .on("mouseout", function(){d3.select(this).style("fill", "white");});
    }
    }
}
