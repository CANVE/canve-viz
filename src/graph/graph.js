import {inject, customElement, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {BindingEngine} from 'aurelia-binding';
import d3 from 'd3';
import GraphModel from './graph-model';
import {GraphLibD3} from './graphlib-d3';
import {GraphFinder} from './graph-finder';
import {GraphModifier} from './graph-modifier';
import {ActionManager} from './action-manager';

@customElement('graph')
@inject(Element, EventAggregator, GraphLibD3, GraphModel, GraphFinder, GraphModifier, ActionManager, BindingEngine)
export class Graph {
  @bindable data;
  @bindable graphInteractionModel;

  constructor(element, pubSub, graphLibD3, graphModel, graphFinder, graphModifier, actionManager, bindingEngine) {
    this.element = element;
    this.pubSub = pubSub;
    this.graphLibD3 = graphLibD3;
    this.graphModel = graphModel;
    this.graphFinder = graphFinder;
    this.graphModifier = graphModifier;
    this.actionManager = actionManager;
    this.bindingEngine = bindingEngine;

    this.windowSizeAdapter();

    this.displayNodes = [];
    this.displayEdges = [];

    this.pubSub.subscribe('search.node', nodeId => {
      this.addNodeAction([nodeId], true);
    });
  }

  /**
   * TODO Need to respond to window resize so that svg can resize.
   * TODO This is too big, need to subtract size of menu and search box
   */
  windowSizeAdapter() {
    this.presentationSVG = {
      width: window.innerWidth - 100,
      height: window.innerHeight - 200
    };
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
   */
  updateForceLayout() {
    let d3Data = this.graphLibD3.mapToD3(this.displayGraph),
      numNodes = d3Data.nodes.length,
      currentNode;

    let force = d3.layout.force()
       .nodes(d3Data.nodes)
       .links(d3Data.links)
       .size([this.presentationSVG.width, this.presentationSVG.height])
       .gravity(0.4)
       .linkDistance(100)
       .charge(-150);

    this.computeLayout(force, numNodes);

    // TODO: port collision detection or line adjustment from legacy

    this.updateDisplayData(d3Data);
  }

  computeLayout(force, numIterations) {
    force.start();
    for (var j = 0; j < numIterations; ++j) force.tick();
    force.stop();
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
