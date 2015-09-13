import Dagre from 'npm:dagre@0.7.4/index.js';

export default class GraphModel {

  constructor(){
    this.globalGraph = new Dagre.graphlib.Graph({ multigraph: true});
  }

  get globalGraphModel() {
    return this.globalGraph;
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

}
