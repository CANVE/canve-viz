import {GraphLibD3} from '../../../src/graph/graphlib-d3.js';

describe('GraphLibD3', () => {

  let sut;

  beforeEach( () => {
    sut = new GraphLibD3();
    expect(sut).toBeDefined();
  });

  describe('containsNode', () => {

    it('Returns the node if its contained in the list of nodes', () => {
      // Given
      let nodes = [
        {id: '1', kind: 'class', name: 'Object', x: 600, y: 500, px: 700, py: 550},
        {id: '2', kind: 'package', name: 'Pipleline', x: 602, y: 502, px: 702, py: 552},
        {id: '3', kind: 'trait', name: '"Ai2SimpleStepInfo"', x: 603, y: 503, px: 703, py: 553}
      ];
      let node = {id: '2', kind: 'package', name: 'Pipleline', x: 100, y: 200, px: 300, py: 400};

      // When
      let result = sut.containsNode(nodes, node);

      // Then
      expect(result.id).toEqual('2');
    });

    it('Returns undefined if the node is not contained in the list of nodes', () => {
      // Given
      let nodes = [
        {id: '1', kind: 'class', name: 'Object', x: 600, y: 500, px: 700, py: 550},
        {id: '2', kind: 'package', name: 'Pipleline', x: 602, y: 502, px: 702, py: 552},
        {id: '3', kind: 'trait', name: '"Ai2SimpleStepInfo"', x: 603, y: 503, px: 703, py: 553}
      ];
      let node = {id: '8', kind: 'method', name: 'read', x: 100, y: 200, px: 300, py: 400};

      // When
      let result = sut.containsNode(nodes, node);

      // Then
      expect(result).toBe(undefined);
    });

  });

  describe('containsEdge', () => {

    it('Returns the edge if its contained in the list of edges', () => {
      // Given
      let edges = [
        {edgeKind: 'declares member', source: { id: 1}, target: { id: 2}},
        {edgeKind: 'uses', source: { id: 2}, target: { id: 3}},
        {edgeKind: 'extends', source: { id: 3}, target: { id: 4}}
      ];
      let edge = {edgeKind: 'extends', source: { id: 3}, target: { id: 4}};

      // When
      let result = sut.containsEdge(edges, edge);

      // Then
      expect(result.edgeKind).toEqual('extends');
      expect(result.source.id).toEqual(3);
      expect(result.target.id).toEqual(4);
    });

    it('Returns undefined if the edge is not contained in the list of edges', () => {
      // Given
      let edges = [
        {edgeKind: 'declares member', source: { id: 1}, target: { id: 2}},
        {edgeKind: 'uses', source: { id: 2}, target: { id: 3}},
        {edgeKind: 'extends', source: { id: 3}, target: { id: 4}}
      ];
      let edge = {edgeKind: 'declares member', source: { id: 1}, target: { id: 3}};

      // When
      let result = sut.containsEdge(edges, edge);

      // Then
      expect(result).toBe(undefined);
    });

  });

});
