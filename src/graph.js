import {inject, customAttribute, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import d3 from 'd3';
import GraphUtils from 'graph-utils';

@customAttribute('graph')
@inject(Element, EventAggregator, GraphUtils)
export class Graph {
  @bindable data;
  @bindable query;

  constructor(element, pubSub, graphUtils) {
    this.element = element;
    this.pubSub = pubSub;
    this.graphUtils = graphUtils;
    this.initSvg();
  }

  initSvg() {
    this.sphereFontSize = 12;

    // create svg for working out dimensions necessary for rendering labels' text
    var hiddenSVG = d3.select(this.element)
      .append('svg:svg')
      .attr('width', 0)
      .attr('height', 0);

    var svgText = hiddenSVG.append('svg:text')
       .attr('y', -500)
       .attr('x', -500)
       .style('font-size', this.sphereFontSize);

    // Does it need to be position absolute?
    this.presentationSVG = d3.select(this.element)
      .append('svg:svg')
      .style('position', 'aboslute')
      .style('z-index', 0);

    this.initForceLayout();
    this.windowSizeAdapter();
  }

  initForceLayout() {
    this.presentationSVG.append('g').attr('class', 'links');
    this.presentationSVG.append('g').attr('class', 'extensionArcs');
    this.presentationSVG.append('g').attr('class', 'nodes');

    // the force layout definition, including those behaviours of it,
    // that are kept constant throughout the program.
    this.forceLayout = d3.layout.force()
      .gravity(0.4)
      .linkDistance(20)
      .charge(-150)
      .on("tick", this.tick);

    // TODO Bring in drag logic from visualizer
    var drag = this.forceLayout.drag();
    drag.on('dragstart', d => {
      console.log('dragstart');
    });
    drag.on('dragend', node => {
      console.log('dragend');
    });
  }

  // TODO Figure out intention of nested function in visualizer tick
  tick() {
    console.log('tick');
  }

  windowSizeAdapter() {
    var width = window.innerWidth,
      height = window.innerHeight;

    this.presentationSVGWidth = width -1;
    this.presentationSVGHeight = height - 1;
    this.forceLayout.size([
      this.presentationSVGWidth, this.presentationSVGHeight
    ]);
  }

  // TODO: Bring in updateForceLayout from visualizer
  updateForceLayout(d3GraphData) {

  }

  dataChanged(newValue) {
    console.log('dataChanged');
    if (newValue) {
      let d3GraphData = this.graphUtils.mapToD3(newValue);
      this.updateForceLayout(d3GraphData);
    }
  }

  queryChanged(newValue) {
    if (newValue) {
      console.log(`queryChanged: ${newValue}`);
    }
  }
}
