import {GraphFinder} from '../../../src/graph/graph-finder';
import Dagre from 'npm:dagre@0.7.4/index.js';

describe('GraphFinder', () => {

  let sut;

  beforeEach( () => {
    sut = new GraphFinder();
    expect(sut).toBeDefined();
  });

  describe('findSelectedNodeIds', () => {

    it('returns array of selected node ids', () => {
      // Given
      let graph = new Dagre.graphlib.Graph({ multigraph: true});
      let nodes = [
        {id: 1, name: 'node1', kind: 'Classs', displayName: 'Node 1', selectStatus: 'selected' },
        {id: 2, name: 'node2', kind: 'Classs', displayName: 'Node 2', selectStatus: 'unselected' }
      ];
      nodes.forEach(node => {
        graph.setNode(node.id, {
          name:         node.name,
          kind:         node.kind,
          displayName:  node.displayName,
          selectStatus: node.selectStatus
        });
      });

      // When
      let result = sut.findSelectedNodeIds(graph);

      // Then
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual('1');
    });

    it('returns empty array when no nodes are selected', () => {
      // Given
      let graph = new Dagre.graphlib.Graph({ multigraph: true});
      let nodes = [
        {id: 1, name: 'node1', kind: 'Classs', displayName: 'Node 1', selectStatus: 'unselected' },
        {id: 2, name: 'node2', kind: 'Classs', displayName: 'Node 2', selectStatus: 'unselected' }
      ];
      nodes.forEach(node => {
        graph.setNode(node.id, {
          name:         node.name,
          kind:         node.kind,
          displayName:  node.displayName,
          selectStatus: node.selectStatus
        });
      });

      // When
      let result = sut.findSelectedNodeIds(graph);

      // Then
      expect(result.length).toEqual(0);
    });

  });

});
