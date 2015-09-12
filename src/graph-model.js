import Dagre from 'npm:dagre@0.7.4/index.js';

export default class GraphModel {

  constructor(){
    this.globalGraph = new Dagre.graphlib.Graph({ multigraph: true});
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
    console.dir(this.globalGraph);
  }

}
