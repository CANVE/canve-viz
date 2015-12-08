import {fillColor} from '../../../src/node/node-style';
import d3 from 'd3';

describe('node-style', () => {

  describe('fillColor', () => {

    it('Returns a color based on node kind', () => {
      // Given
      let node = { id: '1', kind: 'anonymous class' };

      // When
      let result = fillColor(node);

      // Then
      expect(result).toEqual(d3.rgb('gray').brighter(0.9));
    });

    it('Returns a gradient when node kind is constructor', () => {
      // Given
      let node = { id: '1', kind: 'constructor' };

      // When
      let result = fillColor(node);

      // Then
      expect(result).toEqual('url(#MyRadialGradientDef)');
    });

  });

});
