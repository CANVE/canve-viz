import {GraphModifier} from '../../../src/graph/graph-modifier';
import Dagre from 'npm:dagre@0.7.4/index.js';

describe('GraphModifier', () => {

  let sut;

  beforeEach( () => {
    sut = new GraphModifier();
    expect(sut).toBeDefined();
  });

  describe('makeCopy', () => {

    it('Makes a copy of the given graph', () => {
      // Given
      let graph = new Dagre.graphlib.Graph();
      graph.setNode('1', {name: 'node1', kind: 'Classs', displayName: 'Node 1'});
      graph.setNode('2', {name: 'node2', kind: 'Classs', displayName: 'Node 2'});

      // When
      var result = sut.makeCopy(graph);
      expect(result.nodeCount()).toEqual(2);
      expect(result.node('1').name).toEqual('node1');
      expect(result.node('2').name).toEqual('node2');

      // Modify original graph
      graph.setNode('3', {name: 'node3', kind: 'Classs', displayName: 'Node 3'});

      // Expect copy to be unchanged
      expect(result.nodeCount()).toEqual(2);
    });

  });

});
