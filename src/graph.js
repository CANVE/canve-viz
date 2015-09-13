import {inject, customAttribute} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import d3 from 'd3';
import GraphUtils from 'graph-utils';

@customAttribute('graph')
@inject(Element, EventAggregator, GraphUtils)
export class Graph {

  // TODO: Bring in window and sizing logic from visualizer
  constructor(element, pubSub, graphUtils) {
    this.element = element;
    this.pubSub = pubSub;
    this.graphUtils = graphUtils;
    this.svg = d3.select(this.element)
      .append('svg')
      .attr('width', 960)
      .attr('height', 500);
  }

  // TODO: Bring in force layout logic from visualizer for nodes and edges
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
      .text(function(d){return d.name;});

    groups.exit().remove();
  }

  valueChanged(newValue) {
    if (newValue) {
      let d3GraphData = this.graphUtils.mapToD3(newValue);
      this.update(d3GraphData.nodes);
    }
  }
}
