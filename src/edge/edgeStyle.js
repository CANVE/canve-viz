import d3 from 'd3';

let edgeKindToStrokeColorMap = {
  'declares member' : d3.rgb('white').darker(2),
  'extends' : d3.rgb('blue'),
  'is of type' : d3.rgb('blue'),
  'uses' : d3.rgb('green')
};

let edgeKindToStrokeDashMap = {
  'declares member' : 'none',
  'extends' : '4,3',
  'is of type' : '4,3',
  'uses' : 'none'
};

export function strokeColor(edgeKind) {
  return edgeKindToStrokeColorMap[edgeKind];
}

export function strokeDash(edgeKind) {
  return edgeKindToStrokeDashMap[edgeKind];
}
