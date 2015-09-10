import {inject, customAttribute} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import d3 from 'd3';

@customAttribute('graph')
@inject(Element, EventAggregator)
export class Graph {

  constructor(element, pubSub) {
    this.element = element;
    this.pubSub = pubSub;
    this.svg = d3.select(this.element)
      .append('svg')
      .attr('width', 960)
      .attr('height', 500);
  }

  update(data) {
    let groups = this.svg.selectAll('g')
      .data(data);

    let groupsEnter = groups.enter()
      .append('g')
      .attr("transform", function(d, i){return "translate("+i*80+",80)";});

    groupsEnter.append('circle')
      .style('stroke', 'gray')
      .style('fill', 'white')
      .attr('r', 40)
      .on('mouseover', function(){d3.select(this).style('fill', 'aliceblue');})
      .on('mouseout', function(){d3.select(this).style('fill', 'white');})
      .on('click', d => this.pubSub.publish('node.clicked', d));

    groupsEnter.append('text')
      .attr('dx', function(d){return -20;})
      .text(function(d){return d;});

    groups.exit().remove();
  }

  valueChanged(newValue) {
    if (newValue) {
      this.update(newValue.split(''));
    }
  }
}
