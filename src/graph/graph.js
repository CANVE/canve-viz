import {inject, customElement, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {BindingEngine} from 'aurelia-binding';
import d3 from 'd3';
import GraphModel from './graph-model';
import {GraphLibD3} from './graphlib-d3';
import {GraphFinder} from './graph-finder';
import {GraphModifier} from './graph-modifier';
import {ActionManager} from './action-manager';
import {GraphPresentationService} from './graph-presentation-service';
import {GraphPresentationModel} from '../models/graph-presentation-model';

@customElement('graph')
@inject(Element, EventAggregator, GraphLibD3, GraphModel, GraphFinder, GraphModifier, ActionManager, BindingEngine,
  GraphPresentationService, GraphPresentationModel)
export class Graph {
  @bindable data;
  @bindable graphInteractionModel;

  constructor(element, pubSub, graphLibD3, graphModel, graphFinder, graphModifier, actionManager, bindingEngine,
      graphPresentationService, graphPresentationModel) {
    this.element = element;
    this.pubSub = pubSub;
    this.graphLibD3 = graphLibD3;
    this.graphModel = graphModel;
    this.graphFinder = graphFinder;
    this.graphModifier = graphModifier;
    this.actionManager = actionManager;
    this.bindingEngine = bindingEngine;
    this.graphPresentationService = graphPresentationService;
    this.graphPresentationModel = graphPresentationModel;

    this.windowSizeAdapter();

    this.displayNodes = [];
    this.displayEdges = [];

    this.pubSub.subscribe('search.node', nodeId => {
      this.addNodeAction([nodeId], true);
    });
  }

  /**
   * Update graph dimensions. Introduce the concept of using a service to update
   * the model (but lots of other places in app where viewModes update models directly)
   */
  windowSizeAdapter() {
    // TODO Also need to respond to window resize so that svg can resize.
    this.graphPresentationService.updateDimensions(
      window.innerWidth - 100,
      window.innerHeight - 112
    );
  }

  /**
   * A new global graph (i.e. project analysis) is available.
   * Create an empty display graph and initialize it with some
   * sample data from the global graph.
   */
  dataChanged(newVal) {
    let unusedTypes;

    if (newVal) {
      unusedTypes = this.graphFinder.findUnusedTypes(this.graphModel.globalGraphModel);
      this.graphModel.initRadii();
      this.displayGraph = this.graphModel.emptyGraph();
      this.addNodeAction([unusedTypes[0]], true);
    }
  }

  /**
   * Perform the add action, and register undo and redo handlers.
   */
  addNodeAction(nodeIds, withNeighbours) {
    this.addAndDisplay(nodeIds, withNeighbours);
    this.actionManager.addAction(this,
      this.removeAndDisplay, [nodeIds, withNeighbours],
      this.addAndDisplay, [nodeIds, withNeighbours]
    );
  }

  addAndDisplay(nodeIds, withNeighbours) {
    this.addToDisplayGraphModel(nodeIds, withNeighbours);
    this.updateForceLayout();
  }

  removeAndDisplay(nodeIds, withNeighbours) {
    this.removeFromDisplayGraphModel(nodeIds, withNeighbours);
    this.updateForceLayout();
  }

  /**
   * Modify the graph display model to include the given node id's.
   * If withNeihbours is true, then also include each node's neighbours.
   */
  addToDisplayGraphModel(nodeIds, withNeighbours) {
    nodeIds.forEach( nodeId => {
      if (withNeighbours) {
        this.graphModifier.addNodeEnv(this.displayGraph, nodeId, 1, this.svgText);
      } else {
        this.graphModifier.addNodeOnly(this.displayGraph, nodeId, this.svgText);
      }
    });
  }

  /**
   * Modify the graph display model to remove the given node id's.
   * If withNeihbours is true, then also remove each node's neighbours.
   */
  removeFromDisplayGraphModel(nodeIds, withNeighbours) {
    nodeIds.forEach( nodeId => {
      if (withNeighbours) {
        this.graphModifier.removeNodeEnv(this.displayGraph, nodeId, 1, this.svgText);
      } else {
        this.graphModifier.removeNodeOnly(this.displayGraph, nodeId, this.svgText);
      }
    });
  }

  /**
   * Use D3 force layout to calculate node positions.
   * A high negative charge value avoids node overlap.
   */
  updateForceLayout() {
    this.d3Data = this.graphLibD3.mapToD3(this.displayGraph);
    let currentNode;
    let numNodes = this.d3Data.nodes.length;

    let force = d3.layout.force()
       .nodes(this.d3Data.nodes)
       .links(this.d3Data.links)
       .size([this.graphPresentationModel.width, this.graphPresentationModel.height])
       .gravity(0.4)
       .linkDistance(200)
       .charge(-4000)
       .on('tick', this.tick.bind(this));

    this.computeLayout(force, numNodes);
    this.updateDisplayData(this.d3Data);
  }

  /**
   * On each tick of D3's force layout calculation, adjust node positions by applying
   * collision detection and bounding box constraints. Both of these algorithms
   * need to know the node's radius. A heuristic is to estimate radius = 45.
   * A complete solution would know each node * actual radius, but this is very
   * difficult from timing perspective because its not known until after its
   * in the DOM, and calculated by NodeCustomElement in micro task queue.
   */
  tick() {
    const heuristicRadius = 45;
    this.applyCollisionDetection(heuristicRadius);
    this.applyBoundingBox(heuristicRadius);
  }

  /**
   * Collision detection algorithm from
   * https://bl.ocks.org/mbostock/3231298
   */
  applyCollisionDetection(heuristicRadius) {
    let q = d3.geom.quadtree(this.d3Data.nodes),
      i = 0,
      n = this.d3Data.nodes.length;

    while (++i < n) q.visit(this.collide(this.d3Data.nodes[i], heuristicRadius));
  }

  collide(node, r) {
    let nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== node)) {
        let x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
        if (l < r) {
          l = (l - r) / l * 0.5;
          node.x -= x *= l;
          node.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  }

  /**
  * Make nodes fit within bounding box represented by this.graphPresentationModel.
  * http://mbostock.github.io/d3/talk/20110921/bounding.html
  */
  applyBoundingBox(r) {
    this.d3Data.nodes.forEach( node => {
      let curX = node.x;
      node.x = Math.max(r, Math.min(this.graphPresentationModel.width - r, curX));
      let curY = node.y;
      node.y = Math.max(r, Math.min(this.graphPresentationModel.height - r, node.y));
    });
  }

  /**
   * Technique to minimize D3 chaotic bouncing in force layout.
   * http://stackoverflow.com/questions/13463053/calm-down-initial-tick-of-a-force-layout
   */
  computeLayout(force, numIterations) {
    let safety = 0;

    force.start();

    while(force.alpha() > 0.05) {
      force.tick();
      if(safety++ > 500) {
        break;
      }
    }

    force.stop();

    if(safety >= 500) {
      console.warn('Unable to stabilize force layout.');
    }
  }

  /**
   * Update list of display nodes and edges from d3 data.
   */
  updateDisplayData(d3Data) {
    // add nodes that are in d3Data, but not in display
    d3Data.nodes.forEach( node => {
      if (!this.graphLibD3.containsNode(this.displayNodes, node)) {
        this.displayNodes.push(node);
      }
    });

    // add links that are in d3Data, but not in display
    d3Data.links.forEach( link => {
      if (!this.graphLibD3.containsEdge(this.displayEdges, link)) {
        this.displayEdges.push(link);
      }
    });

    // remove nodes that are in display, but not in d3Data (iterate in reverse because splice re-indexes the array)
    let numDisplayNodes = this.displayNodes.length;
    for (let i=numDisplayNodes-1; i >= 0; i--) {
      if (!this.graphLibD3.containsNode(d3Data.nodes, this.displayNodes[i])) {
        this.displayNodes.splice(i, 1);
      }
    }

    // remove edges that are in display, but not in d3Data (iterate in reverse because splice re-indexes the array)
    let numDisplayEdges = this.displayEdges.length;
    for (let j=numDisplayEdges-1; j >=0; j--) {
      if (!this.graphLibD3.containsEdge(d3Data.links, this.displayEdges[j])) {
        this.displayEdges.splice(j, 1);
      }
    }

  }

  /**
   * Based on the currently selected nodes, use 'interaction' and 'type'
   * to find nodes from globalGraph that should be added, but only if
   * they're not already in the display graph.
   */
  findNodesToAdd(interaction, type) {
    let selectedNodeIds,
      relationship,
      nodesByEdgeRelationship;

    selectedNodeIds = this.graphFinder.findSelectedNodeIds(this.displayGraph);
    relationship = type === 'of it' ? 'target' : 'source';
    nodesByEdgeRelationship = this.graphFinder.findNodesByEdgeRelationship(
      this.graphModel.globalGraphModel, selectedNodeIds, interaction, relationship
    );

    return this.graphFinder.filterAlreadyInGraph(nodesByEdgeRelationship, this.displayGraph);
  }

  /**
   * Determine nodes that should be added, and add them as an undo-able action.
   */
  addNodesToDisplay(interaction, type) {
    let nodesToAdd = this.findNodesToAdd(interaction, type);

    if (nodesToAdd.length > 0) {
      this.addNodeAction(nodesToAdd);
    } else {
      // TODO notify https://github.com/CANVE/canve-viz/issues/32
      console.warn('No interaction results');
    }
  }

  /**
   * Invoked by Aurelia when 'graphInteractionModel' binding value has changed.
   * In practice this object it set once in the parent view. After that,
   * register property observers to fire when specific properties of the interaction model change,
   * indicating that the graph should respond to the change by adding more nodes.
   */
  graphInteractionModelChanged(newValue) {
    if (newValue) {
      this.graphInteractionModel = newValue;

      this.bindingEngine.propertyObserver(this.graphInteractionModel, 'callsSelectedVal').subscribe((newValue, oldValue) => {
        this.addNodesToDisplay('uses', newValue);
      });

      this.bindingEngine.propertyObserver(this.graphInteractionModel, 'extensionsSelectedVal').subscribe((newValue, oldValue) => {
        this.addNodesToDisplay('extends', newValue);
      });

      this.bindingEngine.propertyObserver(this.graphInteractionModel, 'ownershipSelectedVal').subscribe((newValue, oldValue) => {
        this.addNodesToDisplay('declares member', newValue);
      });

      // TODO dispose in appropriate lifecycle method http://stackoverflow.com/questions/30283569/array-subscription-in-aurelia
    }
  }

}
