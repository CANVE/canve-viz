import {inject, customAttribute, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import d3 from 'd3';
import GraphLibD3 from 'graphlib-d3';
import GraphModel from 'graph-model';
import GraphFinder from 'graph-finder';
import GraphModifier from 'graph-modifier';
import { calcBBox } from 'graph-text';

/* jshint ignore:start */
@customAttribute('graph')
@inject(Element, EventAggregator, GraphLibD3, GraphModel, GraphFinder, GraphModifier)
/* jshint ignore:end */
export class Graph {
  /* jshint ignore:start */
  @bindable data;
  @bindable query;
  /* jshint ignore:end */

  constructor(element, pubSub, graphLibD3, graphModel, graphFinder, graphModifier) {
    this.element = element;
    this.pubSub = pubSub;
    this.graphLibD3 = graphLibD3;
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

    this.svgText = hiddenSVG.append('svg:text')
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
    this.drag = this.forceLayout.drag();
    this.drag.on('dragstart', d => {
      console.log('dragstart');
    });
    this.drag.on('dragend', node => {
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
    // sync the d3 graph data structure from the graphlib one
    var d3Data = this.graphLibD3.mapToD3(displayGraph);

    // d3 rejoin
    var d3DisplayLinks = this.presentationSVG
      .select('.links').selectAll('.link')
      .data(d3Data.links, edge => { return edge.v + edge.w; } );

    // TODO: Extract edge to color mapping to graph display helper
    // Rest of the d3 (re)join ceremony... handling entering and exiting elements,
    // and defining the callbacks over the elements
    d3DisplayLinks
      .enter().append('polyline')
      .attr('class', 'link')
      .attr('id', edge => { // for allowing indexed access
        return 'link' + edge.v + 'to' + edge.w;
      })
      .style('stroke-width', 1)
      .style('stroke', edge => {
        if (edge.edgeKind === 'declares member') return d3.rgb('white').darker(2);
        if (edge.edgeKind === 'extends')         return d3.rgb('blue');
        if (edge.edgeKind === 'is of type')      return d3.rgb('blue');
        if (edge.edgeKind === 'uses')            return d3.rgb('green');
      })
      .attr('marker-mid', edge => {
        if (edge.edgeKind === 'uses')            return 'url(#arrow)';
      })
      .attr('stroke-dasharray', edge => {
        if (edge.edgeKind === 'declares member') return 'none';
        if (edge.edgeKind === 'extends')         return '4,3';
        if (edge.edgeKind === 'is of type')      return '4,3';
        if (edge.edgeKind === 'uses')            return 'none';
      });


    var extendEdges = d3Data.links.filter(edge => {
      if (edge.edgeKind === 'extends')    return true;
      if (edge.edgeKind === 'is of type') return true;
      return false;
    });

    var d3ExtensionArcs = this.presentationSVG
      .select('.extensionArcs').selectAll('.extensionArc')
      .data(extendEdges, edge => { return edge.v + edge.w; });

    d3ExtensionArcs
      .enter().append('path')
      .attr('class', 'extensionArc')
      .attr('id', edge => { // for allowing indexed access
        return 'arc' + edge.v + 'to' + edge.w;
      });

    var d3DisplayNodes = this.presentationSVG
      .select('.nodes').selectAll('.node')
      .data(d3Data.nodes, node => { return node.id; });

    d3DisplayNodes
      .enter().append('g').attr('class', 'node')
      .attr('id', node => { // for allowing access by index to any node created by d3
        return 'node' + node.id;
      })
      .call(this.drag)
      .append('circle')
      .attr('class', 'circle')
      .attr('r', node => { return node.radius; })
      .style('fill', this.nodeColor)
      .style('cursor', 'pointer')
      .append('title') // this is the default html tooltip definition
      .attr('class', 'tooltip')
      .text(d => { return d.displayName + ' (debug id ' + d.id + ')'; });

    // TODO Bring in interactionState from visualizer
    // d3DisplayNodes
    //   .on('mousedown', node => {
    //     mouseDown = new Date();
    //     mouseDownCoords = d3.mouse(this.presentationSVG.node());
    //     interactionState.longStablePressEnd = false;
    //   });

      // .on('mouseup', node => {
      //   mouseUp = new Date()
      //
      //   mouseUpCoords = d3.mouse(presentationSVG.node())
      //
      //   if (mouseUp.getTime() - mouseDown.getTime() > 500)
      //     if (Math.abs(mouseUpCoords[0] - mouseDownCoords[0]) < 10 &&
      //         Math.abs(mouseUpCoords[1] - mouseDownCoords[1]) < 10) {
      //           interactionState.longStablePressEnd = true
      //           console.log('long stable click')
      //           node.fixed = false
      //     }
      // })

      // .on('dblclick', function(node) {
      //   console.log(node.id)
      // })

      //
      // mouse over and mouse out events use a named transition (see https://gist.github.com/mbostock/24bdd02df2a72866b0ec)
      // in order to both not collide with other events' transitions, such as the click transitions,
      // and to cancel each other per.
      //

      // .on('mouseover', function(node) { // see better implementation at http://jsfiddle.net/cuckovic/FWKt5/
      //   for (edge of displayGraph.nodeEdges(node.id)) {
      //     // highlight the edge
      //     var selector = '#link' + edge.v + 'to' + edge.w
      //     presentationSVG.select(selector).transition().style('stroke-width', 3)
      //     // highlight its nodes
      //     toggleHighlightState(edge.v, 'highlight')
      //     toggleHighlightState(edge.w, 'highlight')
      //   }
      // })

      // .on('mouseout', function(node) {
      //   for (edge of displayGraph.nodeEdges(node.id)) {
      //     // unhighlight the edge
      //     var selector = '#link' + edge.v + 'to' + edge.w
      //     presentationSVG.select(selector).transition().style('stroke-width', 1).delay(300)
      //     // unhighlight its nodes
      //     toggleHighlightState(edge.v, 'unhighlight')
      //     toggleHighlightState(edge.w, 'unhighlight')
      //   }
      // })

    d3DisplayNodes.exit().on('mousedown', null)
      .on('mouseup', null)
      .on('dblclick', null)
      .on('mouseover', null)
      .on('mouseout', null);

    d3DisplayNodes.exit().transition('showOrRemove').delay(500)
     .duration(1000).ease('poly(2)')
     .style('fill-opacity', 0).style('stroke-opacity', 0).remove();

    d3ExtensionArcs.exit().transition('showOrRemove').delay(250)
      .duration(500).style('fill-opacity', 0).style('stroke-opacity', 0).remove();

    d3DisplayLinks.exit().transition('showOrRemove').delay(250)
      .duration(1000).style('stroke-opacity', 0).remove();

    //
    // defer the resumption of the force simulation, when
    // it visually-cognitively makes sense
    //
    var forceResumeDelay = removals ? 1500 : 0;
    setTimeout( () => {
      // bind the force layout to the d3 bindings (re)made above,
      // and animate it.
      this.forceLayout.nodes(d3Data.nodes)
        .links(d3Data.links);

      // after the (re)join, fire away the animation of the force layout
      this.forceLayout.start();
    }, forceResumeDelay);

  }

  rewarmForceLayout() {
    this.forceLayout.resume();
  }

  // TODO Extract to graph display utility
  nodeColor(node) {
    if (node.kind === 'trait')           return d3.rgb('blue').darker(2);
    if (node.kind === 'class')           return d3.rgb('blue').brighter(1);
    if (node.kind === 'object')          return d3.rgb('blue').brighter(1.6);
    if (node.kind === 'anonymous class') return d3.rgb('gray').brighter(0.9);
    if (node.kind === 'method')
      if (node.name.indexOf('$') > 0)   return d3.rgb('gray').brighter(0.9);
      else                              return d3.rgb('green');
    if (node.kind === 'constructor')     return 'url(#MyRadialGradientDef)';
    if (node.kind === 'value')           return d3.rgb('green').brighter(1.3);
    if (node.kind === 'package')         return d3.rgb('white').darker(2);
  }

  // TODO Extract to graph display utility
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
    this.graphModifier.addNodeEnv(this.displayGraph, nodeId, 1, this.svgText);
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
