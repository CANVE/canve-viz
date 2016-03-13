import d3 from 'd3';

const edgeKindToStrokeColorMap = {
  'declares member' : d3.rgb('white').darker(2),
  'extends' : d3.rgb('blue'),
  'is of type' : d3.rgb('blue'),
  'uses' : d3.rgb('green')
};

const edgeKindToStrokeDashMap = {
  'declares member' : 'none',
  'extends' : '4,3',
  'is of type' : '4,3',
  'uses' : 'none'
};

export class EdgeStyle {

  constructor() { }

  strokeColor(edgeKind) {
    return edgeKindToStrokeColorMap[edgeKind];
  }

  strokeDash(edgeKind) {
    return edgeKindToStrokeDashMap[edgeKind];
  }

}
