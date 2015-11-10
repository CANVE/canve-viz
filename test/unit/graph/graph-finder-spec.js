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

  describe('findNodesByEdgeRelationship', () => {

    it('finds source nodes for selected nodes that are the target of "uses" edge kind', () => {
      // Given
      let selectedNodeIds = ['3', '4'];
      let edgeKind = 'uses';
      let relationship = 'target';
      let graph = new Dagre.graphlib.Graph({ multigraph: true});
      let nodes = [
        {id: '1', name: 'node1', kind: 'Classs', displayName: 'Node 1'},
        {id: '2', name: 'node2', kind: 'Classs', displayName: 'Node 2'},
        {id: '3', name: 'node3', kind: 'Classs', displayName: 'Node 3'},
        {id: '4', name: 'node4', kind: 'Classs', displayName: 'Node 4'},
        {id: '5', name: 'node5', kind: 'Classs', displayName: 'Node 5'},
      ];
      let edges = [
        {id1: '1', id2: '3', edgeKind: 'uses'},
        {id1: '2', id2: '3', edgeKind: 'uses'},
        {id1: '3', id2: '4', edgeKind: 'uses'},
        {id1: '3', id2: '5', edgeKind: 'uses'},
      ];
      nodes.forEach(node => {
        graph.setNode(node.id, {
          name:         node.name,
          kind:         node.kind,
          displayName:  node.displayName,
          selectStatus: node.selectStatus
        });
      });
      edges.forEach(edge => {
        graph.setEdge(edge.id1, edge.id2, { edgeKind: edge.edgeKind });
      });

      // When
      let result = sut.findNodesByEdgeRelationship(graph, selectedNodeIds, edgeKind, relationship);

      // Then
      expect(result.length).toEqual(3);
      expect(result.includes('1')).toBe(true);
      expect(result.includes('2')).toBe(true);
      expect(result.includes('3')).toBe(true);

    });

  });

});
