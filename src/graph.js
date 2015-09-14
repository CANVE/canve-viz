import {inject, customAttribute, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import d3 from 'd3';
import GraphLibD3 from 'graphlib-d3';
import GraphModel from 'graph-model';
import GraphFinder from 'graph-finder';
import GraphModifier from 'graph-modifier';

/* jshint ignore:start */
@customAttribute('graph')
@inject(Element, EventAggregator, GraphLibD3, GraphModel, GraphFinder, GraphModifier)
/* jshint ignore:end */
export class Graph {
  /* jshint ignore:start */
  @bindable data;
  @bindable query;
  /* jshint ignore:end */

  constructor(element, pubSub, graphUtils, graphModel, graphFinder, graphModifier) {
    this.element = element;
    this.pubSub = pubSub;
    this.graphUtils = graphUtils;
    this.graphModel = graphModel;
    this.graphFinder = graphFinder;
    this.graphModifier = graphModifier;
    this.initSvg();
  }

  initSvg() {
    this.displayGraph = null;
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
      .on('tick', this.tick);

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

  /*
   * update the display with the display graph,
   * by (re)joining the data with the display, the d3 way.
   *
   * for a deliberation see:
   *   http://bost.ocks.org/mike/join/, and/or
   *   http://www.jeromecukier.net/blog/2015/05/19/you-may-not-need-d3/
   *
   * Note: yes, we do need to do all of this every time the data updates.
   *       given most of it are callback definitions, this isn't egregiously wasteful,
   *       and the little leeway for optimization is superfluous.
   *
   */
  updateForceLayout(displayGraph, removals) {

  }

  /**
   * Recompute and adjust the node rim's style,
   * based on the intersection of two state properties.
   * (we currently leave the transition duration to the caller, as this
   * function currently doesn't deal with the source state only the target state).
   */
  adjustedNodeRimVisualization(node, transitionDuration) {
    var color,
      width;

    // matrix for computing the appropriate style
    if (node.selectStatus === 'selected' && node.highlightStatus === 'highlighted') {
      color = d3.rgb('red').darker(1); width = 4;
    }

    if (node.selectStatus === 'selected' && node.highlightStatus === 'unhighlighted') {
      color = d3.rgb('red').darker(1);
      width = 2;
    }

    if (node.selectStatus === 'unselected' && node.highlightStatus === 'highlighted') {
      color = 'orange';
      width = 2;
    }

    if (node.selectStatus === 'unselected'  &&  node.highlightStatus === 'unhighlighted') {
      color = '#fff';
      width = 1;
    }

    if (transitionDuration === undefined) {
      transitionDuration = 0;
    }

    // apply the style
    var selector = '#node' + node.id;
    var presentationCircle = this.presentationSVG.select(selector).select('.circle');

    presentationCircle
      .transition('nodeHighlighting').duration(transitionDuration)
      .style('stroke', color)
      .style('stroke-width', width);
  }

  fireGraphDisplay(nodeId) {
    this.graphModifier.addNodeEnv(this.displayGraph, nodeId, 1);
    let node = this.displayGraph.node(nodeId);
    let selector = '#node' + nodeId;
    this.presentationSVG.select(selector).select('.circle')
      .transition('nodeHighlighting').duration(500).style('stroke', 'orange').style('stroke-width', 6)
      .each('end', () => this.adjustedNodeRimVisualization(node, 2000) );

    this.updateForceLayout(this.displayGraph);

    // TODO Bring over expandNode fromvisualizer
    // if (node.expandStatus === 'collapsed') {
    //   this.expandNode(node);
    // }
  }

  dataChanged(newValue) {
    if (newValue) {
      // TODO: visualizer applyGraphFilters, debugListSpecialNodes
      this.graphModel.initRadii();
      this.displayGraph = this.graphModel.emptyGraph();

      // init the vis with a small sample of the total data
      let unusedTypes = this.graphFinder.findUnusedTypes(this.graphModel.globalGraphModel);
      this.fireGraphDisplay(unusedTypes[0]);
    }
  }

  queryChanged(newValue) {
    if (newValue) {
      console.log(`queryChanged: ${newValue}`);
    }
  }
}
