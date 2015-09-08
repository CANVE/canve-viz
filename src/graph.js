import {inject, customAttribute} from 'aurelia-framework';
import d3 from 'd3';

@customAttribute('graph')
@inject(Element)
export class Graph {

  constructor(element) {
    this.element = element;
    this.svg = d3.select(this.element)
      .append('svg')
      .attr('width', 960)
      .attr('height', 500);
  }

  update(data) {
    var circles = this.svg.selectAll('circle')
      .data(data);

    // UPDATE: Update old elements as needed.
    circles.attr('class', 'update');

    // ENTER: Create new elements as needed.
    circles.enter().append('circle')
      .style('stroke', 'gray')
      .style('fill', 'white')
      .attr('r', 40)
      .attr('cx', function(d, i) { return i * 50; })
      .attr('cy', 50)
      .on('mouseover', function(){d3.select(this).style('fill', 'aliceblue');})
      .on('mouseout', function(){d3.select(this).style('fill', 'white');});

    // ENTER + UPDATE
    // Appending to the enter selection expands the update selection to include
    // entering elements; so, operations on the update selection after appending to
    // the enter selection will apply to both entering and updating nodes.
    circles.text(function(d) { return d; })
      .style("font-size", "12px");

    // EXIT: Remove old elements as needed.
    circles.exit().remove();
  }

  valueChanged(newValue) {
    if (newValue) {
      this.update(newValue.split(''));
    }
  }
}
