import Dagre from 'npm:dagre@0.7.4/index.js';

export default class GraphModel {

  constructor(){
    this.globalGraph = new Dagre.graphlib.Graph({ multigraph: true});
  }

  get globalGraphModel() {
    return this.globalGraph;
  }

  initRadii() {
    this.globalGraph.nodes().forEach(nodeId => {
      this.globalGraph.node(nodeId).collapsedRadius = Math.log(this.globalGraph.nodeEdges(nodeId).length * 250);
      this.globalGraph.node(nodeId).radius = this.globalGraph.node(nodeId).collapsedRadius;
    });
  }

  populateModel(graphData) {
    graphData.nodes.forEach(node => {
      this.globalGraph.setNode(node.id, {
        name:         node.name,
        kind:         node.kind,
        displayName:  node.displayName,
        notSynthetic: node.notSynthetic,
        definition:   node.definition
      });
    });
    graphData.edges.forEach(edge => {
      this.globalGraph.setEdge(edge.id1, edge.id2, { edgeKind: edge.edgeKind });
    });
  }

  emptyGraph() {
    var graph = new Dagre.graphlib.Graph({ multigraph: true});
    graph.setGraph({});
    return graph;
  }

}
