export default class DataCleaner {

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
  }

  clean(nodes) {
    nodes.forEach(node => this.adjustNames(node));
    return nodes;
  }


}
