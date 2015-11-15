import {inject, customAttribute, bindable, TaskQueue} from 'aurelia-framework';

// bindingEngine is used statically, in the next Aurelia release it will be BindingEngine and injectable
import {bindingEngine} from 'aurelia-binding';

import {EventAggregator} from 'aurelia-event-aggregator';
import d3 from 'd3';
import {ActionManager} from './action-manager';
import GraphLibD3 from './graphlib-d3';
import GraphModel from './graph-model';
import {GraphFinder} from './graph-finder';
import GraphModifier from './graph-modifier';
import { formattedText, calcBBox } from './graph-text';

/* jshint ignore:start */
@customAttribute('graph')
@inject(Element, EventAggregator, GraphLibD3, GraphModel, GraphFinder, GraphModifier, TaskQueue, ActionManager)
/* jshint ignore:end */
export class Graph {
  /* jshint ignore:start */
  @bindable data;
  @bindable graphInteractionModel;
  /* jshint ignore:end */

  constructor(element, pubSub, graphLibD3, graphModel, graphFinder, graphModifier, taskQueue, ActionManager) {
    this.element = element;
    this.pubSub = pubSub;
    this.graphLibD3 = graphLibD3;
    this.graphModel = graphModel;
    this.graphFinder = graphFinder;
    this.graphModifier = graphModifier;
    this.taskQueue = taskQueue;
    this.actionManager = ActionManager;

    this.initSvg();
    this.registerKeyHandlers();

    this.pubSub.subscribe('search.node', nodeId => {
      this.addNodeAction(nodeId, true);
    });
  }

  addNodeAction(nodeId, withNeighbours) {
    this.fireGraphDisplay(nodeId, withNeighbours);
    this.actionManager.addAction(this,
      this.unfireGraphDisplay, [nodeId, withNeighbours],
      this.fireGraphDisplay, [nodeId, withNeighbours]
    );
  }

  initSvg() {
    this.displayGraph = null;
    this.sphereFontSize = 12;
    this.interactionState = {
      longStablePressEnd: false,
      ctrlDown: false,
      searchDialogEnabled: false
    };

    // create svg for working out dimensions necessary for rendering labels' text
    var hiddenSVG = d3.select(this.element)
      .append('svg:svg')
      .attr('width', 0)
      .attr('height', 0);

    this.svgText = hiddenSVG.append('svg:text')
      .attr('y', -500)
      .attr('x', -500)
      .style('font-size', this.sphereFontSize);

    this.presentationSVG = d3.select(this.element)
      .append('svg:svg')
      .style('position', 'absolute')
      .style('z-index', 0);

    this.initForceLayout();
    this.windowSizeAdapter();
  }

  registerKeyHandlers(evt) {
    document.onkeydown = (evt) => {
      if (evt.keyCode === 17 || evt.keyCode === 91) {
        this.interactionState.ctrlDown = true;
      }
    };

    document.onkeyup = (evt) => {
      if (evt.keyCode === 17 || evt.keyCode === 91) {
        this.interactionState.ctrlDown = false;
      }
    };
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
      .on('tick', this.tick.bind(this));

    this.registerDragHandlers();
  }

  /**
   * Determine d3 drag-end v.s. a click, by mouse movement
   * (this is the price of using the d3 drag event,
   *  see e.g. // see http://stackoverflow.com/questions/19931307/d3-differentiate-between-click-and-drag-for-an-element-which-has-a-drag-behavior)
   */
  registerDragHandlers() {
    var dragStartMouseCoords,
      dragEndMouseCoords;

    this.drag = this.forceLayout.drag();

    this.drag.on('dragstart', d => {
      dragStartMouseCoords = d3.mouse(this.presentationSVG.node());
    });

    this.drag.on('dragend', node => {
      if (this.interactionState.longStablePressEnd) return;
      dragEndMouseCoords = d3.mouse(this.presentationSVG.node());

      if (Math.abs(dragStartMouseCoords[0] - dragEndMouseCoords[0]) === 0 &&
          Math.abs(dragStartMouseCoords[1] - dragEndMouseCoords[1]) === 0) {
          // consider it a "click"
          // is the ctrl key down during the click?
          if (this.interactionState.ctrlDown) {
            this.toggleNodeSelect(node);
          } else {
            this.toggleNodeExpansion(node);
          }
      }
      else {
        // consider it a drag end and fix the node position
        node.fixed = true;
      }
    });
  }

  toggleNodeExpansion(node) {
    if (node.expandStatus === 'collapsed') {
      this.expandNode(node);
    } else if (node.expandStatus === 'expanded') {
      this.collapseNode(node);
    }
  }

  toggleNodeSelect(node) {
    if (node.selectStatus === 'unselected') {
      node.selectStatus = 'selected';
      this.adjustedNodeRimVisualization(node, 500);
    } else if (node.selectStatus === 'selected') {
      node.selectStatus = 'unselected';
      this.adjustedNodeRimVisualization(node, 500);
    }
  }

  /**
   * When the force simulation is running, synchronizes the location
   * of the d3 managed svg elements to the current simulation values
   */
  syncView() {
    let count = 0;

    this.d3DisplayLinks.attr("points", d => {
      var source = d.source.x + "," + d.source.y + " ";
      var mid    = (d.source.x + d.target.x)/2 + "," + (d.source.y + d.target.y)/2 + " ";
      var target = d.target.x + "," + d.target.y;
      return source + mid + target;
    });

    this.d3DisplayNodes.attr("transform", (d, i) => {
      return "translate(" + d.x + "," + d.y + ")";
    });

    this.d3ExtensionArcs.attr("d", edge => {
      var edgeRadius = edge.source.radius * 1.3;
      return ('M' + (edge.source.x - edgeRadius) + ',' + (edge.source.y) +
        ' A1,1 0 0 1 ' +
        (edge.source.x + edgeRadius) + ',' + (edge.source.y));
    })
    .attr('transform', edge => {
      // get the direction of the edge as an angle
      var edgeAngleDeg = Math.atan((edge.source.y - edge.target.y) / (edge.source.x - edge.target.x)) * 180 / Math.PI;
      if (edge.source.x < edge.target.x) edgeAngleDeg += 180;
      // rotate arc according to this angle
      return 'rotate(' + (edgeAngleDeg - 90) + ' ' + edge.source.x + ' ' + edge.source.y + ')';
    });
  }

  tick(additionalConstraintFunc) {
    // TODO Bring these over from visualizer
    // avoidOverlaps()
    // keepWithinDisplayBounds()
    // if (typeof additionalConstraintFunc === 'function') additionalConstraintFunc()
    this.syncView();
  }

  windowSizeAdapter() {
    var width = window.innerWidth,
      height = window.innerHeight;

    this.presentationSVGWidth = width -1;
    this.presentationSVGHeight = height - 1;
    console.log(`=== windowSizeAdapter: ${this.presentationSVGWidth} x ${this.presentationSVGHeight}`);
    this.presentationSVG
      .attr('width', this.presentationSVGWidth)
      .attr('height', this.presentationSVGHeight);


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
    this.d3DisplayLinks = this.presentationSVG
      .select('.links').selectAll('.link')
      .data(d3Data.links, edge => { return edge.v + edge.w; } );

    // TODO: Extract edge to color mapping to graph display helper
    // Rest of the d3 (re)join ceremony... handling entering and exiting elements,
    // and defining the callbacks over the elements
    this.d3DisplayLinks
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

    this.d3ExtensionArcs = this.presentationSVG
      .select('.extensionArcs').selectAll('.extensionArc')
      .data(extendEdges, edge => { return edge.v + edge.w; });

    this.d3ExtensionArcs
      .enter().append('path')
      .attr('class', 'extensionArc')
      .attr('id', edge => { // for allowing indexed access
        return 'arc' + edge.v + 'to' + edge.w;
      });

    this.d3DisplayNodes = this.presentationSVG
      .select('.nodes').selectAll('.node')
      .data(d3Data.nodes, node => { return node.id; });

    this.d3DisplayNodes
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

    this.registerForceMouseHandlers();

    this.d3DisplayNodes.exit().on('mousedown', null)
      .on('mouseup', null)
      .on('dblclick', null)
      .on('mouseover', null)
      .on('mouseout', null);

    this.d3DisplayNodes.exit().transition('showOrRemove').delay(500)
     .duration(1000).ease('poly(2)')
     .style('fill-opacity', 0).style('stroke-opacity', 0).remove();

    this.d3ExtensionArcs.exit().transition('showOrRemove').delay(250)
      .duration(500).style('fill-opacity', 0).style('stroke-opacity', 0).remove();

    this.d3DisplayLinks.exit().transition('showOrRemove').delay(250)
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
      console.log('forceLayout started');
    }, forceResumeDelay);

  }

  registerForceMouseHandlers() {
    var mouseDown,
      mouseDownCoords,
      mouseUpCoords,
      mouseUp;

    this.d3DisplayNodes
      .on('mousedown', node => {
        mouseDown = new Date();
        mouseDownCoords = d3.mouse(this.presentationSVG.node());
        this.interactionState.longStablePressEnd = false;
      })
      .on('mouseup', node => {
        let mouseUp = new Date();
      })
      .on('mouseup', node => {
        mouseUp = new Date();
        mouseUpCoords = d3.mouse(this.presentationSVG.node());
        if (mouseUp.getTime() - mouseDown.getTime() > 500)
          if (Math.abs(mouseUpCoords[0] - mouseDownCoords[0]) < 10 &&
            Math.abs(mouseUpCoords[1] - mouseDownCoords[1]) < 10) {
              this.interactionState.longStablePressEnd = true;
              node.fixed = false;
          }
      })
      .on('dblclick', node => {
        console.log(node.id);
      })
      //
      // mouse over and mouse out events use a named transition (see https://gist.github.com/mbostock/24bdd02df2a72866b0ec)
      // in order to both not collide with other events' transitions, such as the click transitions,
      // and to cancel each other per.
      // see better implementation at http://jsfiddle.net/cuckovic/FWKt5/
      //
      .on('mouseover', node => {
        for (let edge of this.displayGraph.nodeEdges(node.id)) {
          // highlight the edge
          var selector = '#link' + edge.v + 'to' + edge.w;
          this.presentationSVG.select(selector).transition().style('stroke-width', 3);
          // highlight its nodes
          this.toggleHighlightState(edge.v, 'highlight');
          this.toggleHighlightState(edge.w, 'highlight');
        }
      })
      .on('mouseout', node => {
        for (let edge of this.displayGraph.nodeEdges(node.id)) {
          // unhighlight the edge
          var selector = '#link' + edge.v + 'to' + edge.w;
          this.presentationSVG.select(selector).transition().style('stroke-width', 1).delay(300);
          // unhighlight its nodes
          this.toggleHighlightState(edge.v, 'unhighlight');
          this.toggleHighlightState(edge.w, 'unhighlight');
        }
      });
  }

  toggleHighlightState(nodeId, targetState) {
    var node = this.displayGraph.node(nodeId);

    if (targetState === 'highlight') {
      node.highlightStatus = 'highlighted';
      this.adjustedNodeRimVisualization(node, 200);
    }

    if (targetState === 'unhighlight') {
      node.highlightStatus = 'unhighlighted';
      this.adjustedNodeRimVisualization(node, 500);
    }
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

  fireGraphDisplay(nodeId, withNeighbours) {
    if (withNeighbours) {
      this.graphModifier.addNodeEnv(this.displayGraph, nodeId, 1, this.svgText);
    } else {
      this.graphModifier.addNodeOnly(this.displayGraph, nodeId, this.svgText);
    }
    let node = this.displayGraph.node(nodeId);
    let selector = '#node' + nodeId;
    this.presentationSVG.select(selector).select('.circle')
      .transition('nodeHighlighting').duration(500).style('stroke', 'orange').style('stroke-width', 6)
      .each('end', () => this.adjustedNodeRimVisualization(node, 2000) );

    this.updateForceLayout(this.displayGraph);

    if (node.expandStatus === 'collapsed') {
      // Delay the bounding box calculation to the end when DOM is rendered
      // https://github.com/CANVE/canve-viz/issues/18
      this.taskQueue.queueMicroTask(() => {
        this.expandNode(node);
      });
    }
  }

  unfireGraphDisplay(nodeId, withNeighbours) {
    if (withNeighbours) {
      this.graphModifier.removeNodeEnv(this.displayGraph, nodeId, 1, this.svgText);
    } else {
      this.graphModifier.removeNodeOnly(this.displayGraph, nodeId, this.svgText);
    }
    this.updateForceLayout(this.displayGraph);
  }

  /**
   * Api requires specifying the distance for each edge,
   * without any option to keep some edges unchanged,
   * so this is more tedious that it could have been.
   */
  extendExpandedNodeEdges(node) {
    this.forceLayout.linkDistance(link => {
      return Math.max(20, this.displayGraph.node(link.source.id).radius + this.displayGraph.node(link.target.id).radius + 10);
    });
  }

  /**
   * Assign expanded radius based on the bounding box needed for rendering the text,
   * plus some padding of the same size as the active font size
   */
  expandNode(node) {
    var bbox = calcBBox(this.svgText, node);
    var expandedRadius = Math.max(bbox.width, bbox.height)/2 + this.sphereFontSize;
    var selector = '#node' + node.id;

    node.expandStatus = 'expanded';
    node.radius = expandedRadius;

    this.extendExpandedNodeEdges(node);

    // Can't use arrow function here because of d3.select(this)
    var self = this;
    this.presentationSVG.select(selector).each(function(group) {
      var g = d3.select(this);
      g.select('.circle')
        .transition('nodeResizing')
        .duration(200)
        .attr('r', node.radius)
        .attr('stroke-width', Math.max(3, Math.sqrt(node.radius)/2))
        .each('end', function(node) {
          var svgText = g.append('text')
            .style('font-size', self.sphereFontSize)
            .style('fill', '#fff')
            .style('stroke-width', '0px')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('y', -(node.textBbox.height/4))
            .style('cursor', 'pointer')
            .attr('pointer-events', 'none');

          formattedText(node).forEach((line, i) => {
            svgText.append('tspan')
              .attr('x', 0)
              .attr('dy', function() {
                if (i === 0) return 0;
                else return '1.2em';
              })
             .text(line);
          });
      });
    });

    // logNodeNeighbors(globalGraph, node.id)

    // if (node.definition === 'project')
    //   showSourceCode(node)
    // if (node.definition === 'external')
    //   console.log(node.displayName + ' is defined externally to the project being visualized')

    this.rewarmForceLayout();
  }

  collapseNode(node) {
    var selector = '#node' + node.id;

    node.expandStatus = 'collapsed';
    node.radius = node.collapsedRadius;

    // can't use arrow function due to d3.select(this)
    this.presentationSVG.select(selector).each(function(group) {
      var g = d3.select(this);
      g.selectAll("text").remove();
      g.select(".circle")
        .transition('nodeResizing')
        .duration(400)
        .attr("r", node.radius);
    });

    this.rewarmForceLayout();
  }

  // A brand new graph
  dataChanged(newValue) {
    if (newValue) {
      // TODO: port from visualizer: applyGraphFilters, debugListSpecialNodes

      this.graphModel.initRadii();
      this.displayGraph = this.graphModel.emptyGraph();

      // init the vis with a small sample of the total data
      let unusedTypes = this.graphFinder.findUnusedTypes(this.graphModel.globalGraphModel);
      this.fireGraphDisplay(unusedTypes[0], true);
    }
  }

  addNodesToDisplay(interaction, type) {
    let selectedNodeIds = this.graphFinder.findSelectedNodeIds(this.displayGraph);
    let relationship = type === 'of it' ? 'target' : 'source';
    let nodesByEdgeRelationship = this.graphFinder.findNodesByEdgeRelationship(
      this.graphModel.globalGraphModel, selectedNodeIds, interaction, relationship
    );
    let nodesToAdd = this.graphFinder.filterAlreadyInGraph(nodesByEdgeRelationship, this.displayGraph);

    // TODO Need a better solution to limit the amount displayed
    let maxNodesToAdd = 10;
    if (nodesToAdd.length > maxNodesToAdd) {
      console.warn(`Only 10 of ${nodesToAdd.length} will be added`);
    }

    nodesToAdd.slice(0, maxNodesToAdd).forEach( nodeId => this.addNodeAction(nodeId) );
  }

  // user requested an interaction with the graph
  graphInteractionModelChanged(newValue) {
    if (newValue) {
      this.graphInteractionModel = newValue;

      bindingEngine.propertyObserver(this.graphInteractionModel, 'callsSelectedVal').subscribe((newValue, oldValue) => {
        this.addNodesToDisplay('uses', newValue);
      });

      bindingEngine.propertyObserver(this.graphInteractionModel, 'extensionsSelectedVal').subscribe((newValue, oldValue) => {
        this.addNodesToDisplay('extends', newValue);
      });

      bindingEngine.propertyObserver(this.graphInteractionModel, 'ownershipSelectedVal').subscribe((newValue, oldValue) => {
        this.addNodesToDisplay('declares member', newValue);
      });

      // TODO dispose in appropriate lifecycle method http://stackoverflow.com/questions/30283569/array-subscription-in-aurelia
    }
  }
}
