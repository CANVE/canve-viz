import {NodeCalculator} from '../../../src/node/node-calculator';

describe('NodeCalculator', () => {
  let nodeCalculator;

  beforeEach( () => {
    nodeCalculator = new NodeCalculator();
  });

  describe('radius', () => {

    it('is a function of font size, and width when greater than height', () => {
      // Given
      let boundingBox = { width: 10, height: 5};
      let fontSize = 2;

      // When
      let result = nodeCalculator.radius(boundingBox, fontSize);

      // Then
      expect(result).toEqual(7);
    });

    it('is a function of font size, and height when greater than width', () => {
      // Given
      let boundingBox = { width: 10, height: 20};
      let fontSize = 2;

      // When
      let result = nodeCalculator.radius(boundingBox, fontSize);

      // Then
      expect(result).toEqual(12);
    });

  });

  describe('centerVertically', () => {

    it('is a function of height', () => {
      // Given
      let boundingBox = { width: 20, height: 40};

      // When
      let result = nodeCalculator.centerVertically(boundingBox);

      // Then
      expect(result).toEqual(-10);
    });

  });

  describe('adjustPositionToFit', () => {

    it('sets y position to radius if difference is less than zero', () => {
      // Given
      let radius = 10,
        currentY = 5;

      // When
      let result = nodeCalculator.adjustPositionToFit(radius, currentY);

      // Then
      expect(result).toEqual(10);
    });

    it('returns original y position if difference is greater than zero', () => {
      // Given
      let radius = 10,
        currentY = 20;

      // When
      let result = nodeCalculator.adjustPositionToFit(radius, currentY);

      // Then
      expect(result).toEqual(20);
    });

  });

});
