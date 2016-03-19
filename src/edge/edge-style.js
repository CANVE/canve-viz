import d3 from 'd3';

const DEFAULT_STROKE_COLOR = d3.rgb('grey');
const edgeKindToStrokeColorMap = {
  'declares member' : d3.rgb('white').darker(2),
  'extends' : d3.rgb('blue'),
  'is of type' : d3.rgb('blue'),
  'uses' : d3.rgb('green')
};

const DEFAULT_STROKE_DASH = 'none';
const edgeKindToStrokeDashMap = {
  'declares member' : 'none',
  'extends' : '4,3',
  'is of type' : '4,3',
  'uses' : 'none'
};

export class EdgeStyle {

  constructor() { }

  strokeColor(edgeKind) {
    let result = edgeKindToStrokeColorMap[edgeKind];
    if (!result) {
      result = DEFAULT_STROKE_COLOR;
    }
    return result;
  }

  strokeDash(edgeKind) {
    let result = edgeKindToStrokeDashMap[edgeKind];
    if (!result) {
      result = DEFAULT_STROKE_DASH;
    }
    return result;
  }

}
