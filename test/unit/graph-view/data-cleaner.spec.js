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

    it('Converts qualified value to unnamed value', () => {
      // Given
      let node = {
        kind: 'value',
        name: 'qual$1'
      };

      // When
      sut.adjustNames(node);

      // Then
      expect(node.name).toEqual('unnamed value');
      expect(node.displayName).toEqual('unnamed value');
    });

  });

  describe('ownerShipNormalize', () => {

    it('Converts owned-by to declares-member and changes direction', () => {
      // Given
      let edge = {
        edgeKind: 'owned by',
        id1: 'node-1',
        id2: 'node-2'
      };

      // When
      sut.ownerShipNormalize(edge);

      // Then
      expect(edge.edgeKind).toEqual('declares member');
      expect(edge.id1).toEqual('node-2');
      expect(edge.id2).toEqual('node-1');
    });

    it('Does not modify non owned-by edge kind', () => {
      // Given
      let edge = {
        edgeKind: 'uses',
        id1: 'node-1',
        id2: 'node-2'
      };

      // When
      sut.ownerShipNormalize(edge);

      // Then
      expect(edge.edgeKind).toEqual('uses');
      expect(edge.id1).toEqual('node-1');
      expect(edge.id2).toEqual('node-2');
    });

  });

});
