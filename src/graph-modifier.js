import {inject} from 'aurelia-framework';
import GraphModel from 'graph-model';

@inject(GraphModel)
export default class GraphModifier {

  constructor(graphModel) {
    this.graphModel = graphModel;
  }

  /**
   * Adds node's links to all other nodes already on the display.
   */
  addNeighborLinksToDisplay(graph, id) {
    this.graphModel.globalGraphModel.nodeEdges(id).forEach(function(edge) {
      if (edge.v === id && graph.hasNode(edge.w) || edge.w === id && graph.hasNode(edge.v)) {
        graph.setEdge(edge, this.graphModel.globalGraphModel.edge(edge));
      }
    });
  }

  addNodeToDisplay(graph, id) {
    if (graph.node(id) === undefined) {
      let node = this.graphModel.globalGraphModel.node(id);
      node.id              = id;
      node.expandStatus    = 'collapsed';
      node.selectStatus    = 'unselected';
      node.highlightStatus = 'unhighlighted';
      graph.setNode(id, node);

      this.addNeighborLinksToDisplay(graph, id);
    }
  }

  /**
   * This is a naive implementation meant for very small values of degree.
   * for any humbly large degree, this needs to be re-implemented for efficient Big O(V,fembelish),
   * as the current one is very naive in that sense.
   */
  addNodeEnv(graph, id, degree) {
    this.addNodeToDisplay(id);
    this.addNodeNeighbors(graph, id, degree);
    return graph;
  }

}
