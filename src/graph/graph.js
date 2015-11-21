import {inject} from 'aurelia-framework';
import {customElement, bindable} from 'aurelia-framework';
import d3 from 'd3';
import GraphModel from './graph-model';
import {GraphFinder} from './graph-finder';
import {ActionManager} from './action-manager';

@customElement('graph')
@inject(Element)
export class Graph {
  @bindable data;

  constructor(element) {
    this.element = element;
  }

  dataChanged(newVal) {
    if (newVal) {
      this.graphModel.initRadii();
      this.displayGraph = this.graphModel.emptyGraph();

      // TODO init force layout with all the graph nodes and edges (http://chimera.labs.oreilly.com/books/1230000000345/ch11.html#_force_layout)
      // so that each node will be assigned an x and y position

      // init the vis with a small sample of the total data
      let unusedTypes = this.graphFinder.findUnusedTypes(this.graphModel.globalGraphModel);
      this.addNodeAction([unusedTypes[0]], true);
    }
  }

  /**
   * Perform the add action, and register
   * undo and redo handlers.
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
  }

  removeAndDisplay(nodeIds, withNeighbours) {
    this.removeFromDisplayGraphModel(nodeIds, withNeighbours);
  }

}
