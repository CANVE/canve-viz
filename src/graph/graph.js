import {inject} from 'aurelia-framework';
import {customElement, bindable} from 'aurelia-framework';
import d3 from 'd3';
import GraphModel from './graph-model';
import GraphLibD3 from './graphlib-d3';
import {GraphFinder} from './graph-finder';
import GraphModifier from './graph-modifier';
import {ActionManager} from './action-manager';

@customElement('graph')
@inject(Element, GraphLibD3, GraphModel, GraphFinder, GraphModifier, ActionManager)
export class Graph {
  @bindable data;

  constructor(element, graphLibD3, graphModel, graphFinder, graphModifier, actionManager) {
    this.element = element;
    this.graphLibD3 = graphLibD3;
    this.graphModel = graphModel;
    this.graphFinder = graphFinder;
    this.graphModifier = graphModifier;
    this.actionManager = actionManager;

    this.windowSizeAdapter();
  }

  /**
   * TODO Need to respond to window resize so that svg can resize.
   * TODO This is too big, need to subtract size of menu and search box
   */
  windowSizeAdapter() {
    this.presentationSVG = {
      width: window.innerWidth -1,
      height: window.innerHeight -1
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
    let d3Data = this.graphLibD3.mapToD3(this.displayGraph);

    d3.layout.force()
       .nodes(d3Data.nodes)
       .links(d3Data.links)
       .size([this.presentationSVG.width, this.presentationSVG.height])
       .linkDistance([50])
       .charge([-100])
       .start();

    this.displayNodes = d3Data.nodes;
  }

  // get displayNodes() {
  //   return this.displayGraph.nodes();
  // }

}
