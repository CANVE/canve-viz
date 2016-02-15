import {GraphTextService} from '../../../src/graph/graph-text-service';

describe('GraphTextService', () => {

  describe('formattedText', () => {
    let graphTextService;

    beforeEach(() => {
      graphTextService = new GraphTextService();
    });

    it('splits into lines by spaces and camelCase', () => {
      // Given
      let node = { displayName: 'class SingletonIo' };

      // When
      let result = graphTextService.formattedText(node);

      // Then
      expect(result.length).toEqual(3);
      expect(result[0].line).toEqual('class ');
      expect(result[0].x).toEqual(0);
      expect(result[0].dy).toEqual('0');

      expect(result[1].line).toEqual('Singleton');
      expect(result[1].x).toEqual(0);
      expect(result[1].dy).toEqual(graphTextService.verticalOffset);

      expect(result[2].line).toEqual('Io');
      expect(result[2].x).toEqual(0);
      expect(result[2].dy).toEqual(graphTextService.verticalOffset);
    });

    it('splits into one line for single word', () => {
      // Given
      let node = { displayName: 'constructor' };

      // When
      let result = graphTextService.formattedText(node);

      // Then
      expect(result.length).toEqual(1);
      expect(result[0].line).toEqual('constructor');
      expect(result[0].x).toEqual(0);
      expect(result[0].dy).toEqual('0');
    });

    it('splits into two lines for space and no camel casing', () => {
      // Given
      let node = { displayName: 'value evidence$2' };

      // When
      let result = graphTextService.formattedText(node);

      // Then
      expect(result.length).toEqual(2);
      expect(result[0].line).toEqual('value ');
      expect(result[0].x).toEqual(0);
      expect(result[0].dy).toEqual('0');

      expect(result[1].line).toEqual('evidence$2');
      expect(result[1].x).toEqual(0);
      expect(result[1].dy).toEqual(graphTextService.verticalOffset);
    });

  });

});
