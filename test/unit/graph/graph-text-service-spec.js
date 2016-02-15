import {GraphTextService} from '../../../src/graph/graph-text-service';

describe('GraphTextService', () => {

  describe('formattedText', () => {
    let graphTextService;

    beforeEach(() => {
      graphTextService = new GraphTextService();
    });

    it('splits into lines by camel case and increments vertical offset', () => {
      // Given
      let node = { displayName: 'class SingletonIo' };

      // When
      let result = graphTextService.formattedText(node);

      // Then
      expect(result.length).toEqual(3);
      expect(result[0].line).toEqual('class ');
      expect(result[0].x).toEqual(0);
      expect(result[0].dy).toEqual('0em');

      expect(result[1].line).toEqual('Singleton');
      expect(result[1].x).toEqual(0);
      expect(result[1].dy).toEqual('1.2em');

      expect(result[2].line).toEqual('Io');
      expect(result[2].x).toEqual(0);
      expect(result[2].dy).toEqual('2.4em');
    });

  });

});
