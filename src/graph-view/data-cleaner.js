export class DataCleaner {

  adjustNames(node) {
    if (node.kind === 'anonymous class' && node.name === '$anon') {
      node.name = 'unnamed class';
      node.displayName = node.name;
    }

    if (node.kind === 'value' && node.name.indexOf('qual$') === 0) {
      node.name = 'unnamed value';
      node.displayName = node.name;
    }

    if (node.kind === 'constructor' && node.name === '<init>') {
      node.name = 'constructor';
      node.displayName = node.name;
    }

    if (node.kind === 'method' && node.name.indexOf('<init>$default$') === 0) {
      node.name = 'default argument';
      node.displayName = node.name;
    }

    if (node.kind === 'value' && node.name.indexOf('x0$') === 0) { // a block argument
      node.name = 'a block argument';
      node.displayName = node.name;
    }

    if (node.kind === 'lazy value') { // because showing laziness seems a little over of scope...
      node.kind = 'value';
    }

    if (node.displayName === undefined) {
      node.displayName = node.kind + ' ' + node.name;
    }
  }

  // make an 'owned by' edge equivalent to a 'declares member' edge
  // the nature of the real-world difference will be sorted out by using this
  // code, but as it currently stands they are considered just the same here.
  // in the end, this will be handled in the Scala code itself
  ownerShipNormalize(edge) {
    if (edge.edgeKind === 'owned by') {
      // swap edge's direction
      let t = edge.id1;
      edge.id1 = edge.id2;
      edge.id2 = t;
      edge.edgeKind = 'declares member';
    }
  }

  cleanNodes(nodes) {
    nodes.forEach(node => this.adjustNames(node));
    return nodes;
  }

  cleanEdges(edges) {
    edges.forEach(edge => this.ownerShipNormalize(edge));
    return edges;
  }


}
