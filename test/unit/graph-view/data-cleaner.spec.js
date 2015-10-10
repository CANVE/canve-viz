import {DataCleaner} from '../../../src/graph-view/data-cleaner';

describe('Data Cleaner', () => {

  let sut;

  beforeEach( () => {
    sut = new DataCleaner();
    expect(sut).toBeDefined();
  });

  describe('adjustNames', () => {

    it('Converts anonymous class to unnamed', () => {
      // Given
      let node = {
        kind: 'anonymous class',
        name: '$anon'
      };

      // When
      sut.adjustNames(node);

      // Then
      expect(node.name).toEqual('unnamed class');
      expect(node.displayName).toEqual('unnamed class');
    });

  });


});
