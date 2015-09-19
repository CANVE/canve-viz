import {inject} from 'aurelia-framework';
import GraphModel from 'graph-model';
import { calcBBox } from 'graph-text';

@inject(GraphModel)
export default class GraphModifier {

  constructor(graphModel) {
    this.graphModel = graphModel;
  }

  /**
   * Add node neighbors to display graph
   */
  addNodeNeighbors(graph, id, degree, svgText) {
    if (degree === 0) {
      return;
    }

    this.graphModel.globalGraphModel.nodeEdges(id).forEach(edge => {
      this.addNodeToDisplay(graph, edge.v, svgText);
      this.addNodeToDisplay(graph, edge.w, svgText);
      graph.setEdge(edge.v, edge.w, this.graphModel.globalGraphModel.edge(edge.v, edge.w));

      if (edge.v !== id) {
        this.addNodeNeighbors(graph, edge.v, degree - 1, svgText);
      }
      if (edge.w !== id) {
        this.addNodeNeighbors(graph, edge.w, degree - 1, svgText);
      }
    });
  }

  /**
   * Adds node's links to all other nodes already on the display.
   */
  addNeighborLinksToDisplay(graph, id) {
    this.graphModel.globalGraphModel.nodeEdges(id).forEach(edge => {
      if (edge.v === id && graph.hasNode(edge.w) || edge.w === id && graph.hasNode(edge.v)) {
        graph.setEdge(edge, this.graphModel.globalGraphModel.edge(edge));
      }
    });
  }

  addNodeToDisplay(graph, id, svgText) {
    if (graph.node(id) === undefined) {

      let node = this.graphModel.globalGraphModel.node(id);
      node.id              = id;
      node.expandStatus    = 'collapsed';
      node.selectStatus    = 'unselected';
      node.highlightStatus = 'unhighlighted';

      // Bbox calcs to 0 here because not really in the DOM yet,
      // However, force layout gets stuck if this code doesn't run
      node.textBbox = calcBBox(svgText, node);

      graph.setNode(id, node);

      this.addNeighborLinksToDisplay(graph, id);
    }
  }

  /**
   * This is a naive implementation meant for very small values of degree.
   * for any humbly large degree, this needs to be re-implemented for efficient Big O(V,fembelish),
   * as the current one is very naive in that sense.
   */
  addNodeEnv(graph, id, degree, svgText) {
    this.addNodeToDisplay(graph, id, svgText);
    this.addNodeNeighbors(graph, id, degree, svgText);
    return graph;
  }

}
