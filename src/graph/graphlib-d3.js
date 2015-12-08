export class GraphLibD3 {

  /**
   * Map from graphlib graph representation to d3 graph representation:
   *
   * for d3, links must be specified as pairs of d3 nodes array *indices*
   * via `source` and `target` attributes, as per:
   *
   *   https://github.com/mbostock/d3/wiki/Force-Layout#nodes
   *   https://github.com/mbostock/d3/wiki/Force-Layout#links
   *
   * other than that we pass on properties appended to the graphlib representation,
   * currently only the initial dagre computed initial location
   */
  mapToD3(displayGraph) {

    var nodeIdIndex = {};

    var nodes = displayGraph.nodes().map((id, index) => {
      nodeIdIndex[id] = index;

      var d3Node = displayGraph.node(id);
      //d3Node.id = id // pass on the graphlib node id

      // set the initial location via px, py
      d3Node.px = displayGraph.node(id).x;
      d3Node.py = displayGraph.node(id).y;
      return d3Node;
    });

    var links = displayGraph.edges().map(edge => {
      return { source: nodeIdIndex[edge.v], // vertex specified as index into nodes array
               target: nodeIdIndex[edge.w], // vertex specified as index into nodes array
               v: edge.v,                   // pass on the graphlib node id
               w: edge.w,                   // pass on the graphlib node id
               edgeKind: displayGraph.edge(edge).edgeKind };
    });

    return { nodes, links };
  }

  /**
   * Check if the given node is contained in the nodes list, by matching id.
   * If it is, then return it, otherwise return undefined.
   */
  containsNode(nodes, node) {
    return nodes.find( displayNode => {
      return node.id === displayNode.id;
    });
  }

  /**
   * Check if the given edge is contained in the edges list, by matching edgeKind
   * and source and target node ids. If it is, then return it, otherwise return displayEdge.
   */
  containsEdge(edges, edge) {
    return edges.find( displayEdge => {
      return edge.edgeKind === displayEdge.edgeKind &&
        edge.source.id === displayEdge.source.id &&
        edge.target.id === displayEdge.target.id;
    });
  }


}
