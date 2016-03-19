import {EdgeStyle} from '../../../src/edge/edge-style';
import d3 from 'd3';

describe('EdgeStyle', () => {
  let edgeStyle;

  beforeEach(() => {
    edgeStyle = new EdgeStyle();
  });

  describe('strokeColor', () => {

    it('Returns blue when edge kind is extends', () => {
      expect(edgeStyle.strokeColor('extends')).toEqual(d3.rgb('blue'));
    });

    it('Returns grey when edge kind is unknown', () => {
      expect(edgeStyle.strokeColor('foo')).toEqual(d3.rgb('grey'));
    });

    it('Returns grey when edge kind is undefined', () => {
      expect(edgeStyle.strokeColor()).toEqual(d3.rgb('grey'));
    });

    it('Returns grey when edge kind is null', () => {
      expect(edgeStyle.strokeColor(null)).toEqual(d3.rgb('grey'));
    });

  });

  describe('strokeDash', () => {

    it('Returns 4,3 when edge kind is "is of type"', () => {
      expect(edgeStyle.strokeDash('is of type')).toEqual('4,3');
    });

    it('Returns none when edge kind is unknown', () => {
      expect(edgeStyle.strokeDash('foo')).toEqual('none');
    });

    it('Returns none when edge kind is undefined', () => {
      expect(edgeStyle.strokeDash()).toEqual('none');
    });

    it('Returns none when edge kind is null', () => {
      expect(edgeStyle.strokeDash(null)).toEqual('none');
    });

  });

});
