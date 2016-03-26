import {Edge} from '../../../src/edge/edge';

describe('Edge', function() {
  const edgeStyleColor = 'grey';
  let edge, mockElement, mockEventAggregator, mockEdgeStyle, mockEdgeTextService;

  beforeEach( () => {
    mockElement = {};
    mockEventAggregator = {};
    mockEdgeStyle = {
      strokeColor: function() { return edgeStyleColor; }
    };
    mockEdgeTextService = {
      isUpsideDown: function() { return 'M0,0L10,10'; }
    };
    edge = new Edge(mockElement, mockEventAggregator, mockEdgeStyle, mockEdgeTextService);
  });

  describe('edgeColor', () => {

    it('Returns highlight color for source', () => {
      // Given
      let displayEdge = { edgeKind: 'extends', highlightSource: true };
      edge.displayEdge = displayEdge;

      // Then
      expect(edge.edgeColor).toEqual('orange');
    });

    it('Returns highlight color for target', () => {
      // Given
      let displayEdge = { edgeKind: 'extends', highlightTarget: true };
      edge.displayEdge = displayEdge;

      // Then
      expect(edge.edgeColor).toEqual('rgb(60, 234, 245)');
    });

    it('Returns color based on edge style', () => {
      // Given
      spyOn(mockEdgeStyle, 'strokeColor').and.callThrough();
      let displayEdge = { edgeKind: 'extends'};
      edge.displayEdge = displayEdge;

      // Then
      expect(edge.edgeColor).toEqual(edgeStyleColor);
      expect(mockEdgeStyle.strokeColor).toHaveBeenCalled();
    });

  });

  describe('highlightEdges', () => {

    it('Sets edge to be highlighted as source', () => {
      // Given
      let node = { id: '111'};
      let displayEdge = { source: {id: '111'}, target: {id: '222'}};
      edge.displayEdge = displayEdge;

      // When
      edge.highlightEdges(node);

      // Then
      expect(edge.displayEdge.highlightSource).toBe(true);
      expect(edge.displayEdge.highlightTarget).toBeUndefined();
    });

    it('Sets edge to be highlighted as target', () => {
      // Given
      let node = { id: '222'};
      let displayEdge = { source: {id: '111'}, target: {id: '222'}};
      edge.displayEdge = displayEdge;

      // When
      edge.highlightEdges(node);

      // Then
      expect(edge.displayEdge.highlightTarget).toBe(true);
      expect(edge.displayEdge.highlightSource).toBeUndefined();
    });

  });

});
