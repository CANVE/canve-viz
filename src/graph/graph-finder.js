export class GraphFinder {

  getMembers(graph, nodeId) {
    return graph
      .nodeEdges(nodeId)
      .filter(edge => {
        return edge.v === nodeId && graph.edge(edge).edgeKind === 'declares member';
      })
      .map(edge => { return edge.w; });
  }

  getUsers(graph, nodeId) {
    return graph
      .nodeEdges(nodeId).filter(edge => {
        return edge.w === nodeId && graph.edge(edge).edgeKind === 'uses';
      })
      .map(edge => { return edge.v; });
  }

  isTypeNode(graph, nodeId) {
    return graph.node(nodeId).kind === 'class'  ||
           graph.node(nodeId).kind === 'object' ||
           graph.node(nodeId).kind === 'trait';
  }

  typeUsersCount(graph, nodeId) {
    // is anyone using it?
    var users = 0;
    graph.nodeEdges(nodeId).forEach(edge => {
      if (edge.w === nodeId) {
        if (graph.edge(edge).edgeKind === 'extends') {
          users += 1;
        }
        if (graph.edge(edge).edgeKind === 'is of type') {
          users += 1;
        }
        if (graph.edge(edge).edgeKind === 'uses') {
          users += 1;
        }
      }
    });

    // is anyone using its subtypes if any?
    graph.nodeEdges(nodeId).forEach(edge => {
      if (edge.v === nodeId && graph.edge(edge).edgeKind === 'declares member')
        if (this.isTypeNode(graph, edge.w)) {
          users += this.typeUsersCount(graph, edge.w);
        }
    });

    // is it an object being used without "instantiation"?
    // in such case should check if any of its members are being used,
    // because the compiler will not indicate the usage other
    // than by the usage of the members, in such case. Other than with
    // an object, this additional check would be unnecessary as
    // a class must be instantiated to be used (AFAIK).
    if (graph.node(nodeId).kind === 'object') {
      this.getMembers(graph, nodeId).forEach(memberNode => {
        users += this.getUsers(graph, memberNode).length;
      });
    }

    return users;
  }

  /**
   * This is a naive implementation that assumes
   * there is not a lot of type nesting -
   * it doesn't try to avoid some repetition
   */
  findUnusedTypes(graph) {

    var projectNodes = graph.nodes().filter(nodeId => {
      return graph.node(nodeId).definition === 'project';
    });

    var projectTypeNodes = projectNodes.filter(nodeId => {
      return this.isTypeNode(graph, nodeId);
    });

    return projectTypeNodes.filter(nodeId => {
      return this.typeUsersCount(graph, nodeId) === 0;
    });
  }

  findSelectedNodeIds(graph) {
    return graph.nodes().filter( nodeId => graph.node(nodeId).selectStatus === 'selected' );
  }

  /**
   * https://github.com/cpettitt/graphlib/wiki/API-Reference#node-and-edge-representation
   *  v: the id of the source or tail node of an edge
   *  w: the id of the target or head node of an edge
   */
  findNodesByEdgeRelationship(graph, selectedNodeIds, edgeKind, relationship) {
    let results = [],
      edgeProperty = relationship === 'target' ? 'w' : 'v';

    selectedNodeIds.forEach( nodeId => {
      let edges = graph.nodeEdges(nodeId).filter( edge => {
        let currentEdge = graph.edge(edge);
        return currentEdge.edgeKind === edgeKind && edge[edgeProperty] === nodeId;
      });
      edges.forEach( edge => {
        results.push(edge[edgeProperty]);
      });
    });

    return results;
  }

}
