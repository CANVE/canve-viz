import {EdgeText} from '../../../src/edge/edge-text';
import {PointModel} from '../../../src/models/point-model';

describe('EdgeText', function() {
  let edgeText;
  let mockGraphPresentationModel;

  beforeEach( () => {
    mockGraphPresentationModel = {
      width: 100,
      height: 100
    };
    edgeText = new EdgeText(mockGraphPresentationModel);
  });

  describe('angleInDegreesBetweenPoints', () => {

    it('Returns 90 degrees', () => {
      // Given
      let point1 = new PointModel(0, 0);
      let point2 = new PointModel(1, 1);
      let fixedPoint = new PointModel(1, 0);

      // When
      let result = edgeText.angleInDegreesBetweenPoints(point1, point2, fixedPoint);

      // Then
      expect(result).toEqual(90);
    });

    it('Returns 90 degrees (absolute value)', () => {
      // Given
      let point1 = new PointModel(1, 0);
      let point2 = new PointModel(0, 1);
      let fixedPoint = new PointModel(0, 0);

      // When
      let result = edgeText.angleInDegreesBetweenPoints(point1, point2, fixedPoint);

      // Then
      expect(result).toEqual(90);
    });

    it('Accounts for given svg height', () => {
      // Given
      let svgHeight = 693;
      let point1 = new PointModel(658, 428, svgHeight);
      let point2 = new PointModel(431, 393, svgHeight);
      let fixedPoint = new PointModel(638, 428, svgHeight);

      // When
      let result = edgeText.angleInDegreesBetweenPoints(point1, point2, fixedPoint);

      // Then
      expect(result).toBeWithinRange(170, 171);
    });

  });

  describe('isUpsideDown', () => {

    it('Returns false when target point is above and to the right of source point', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 75;
      let targetY = 25;

      // When
      let result = edgeText.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(false);
    });

    it('Returns false when target point is below and to the right of source point', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 75;
      let targetY = 75;

      // When
      let result = edgeText.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(false);
    });

    it('Returns true when target point is above and to the left of source point', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 25;
      let targetY = 25;

      // When
      let result = edgeText.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(true);
    });

    it('Returns true when target point is below and to the left of source point', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 25;
      let targetY = 75;

      // When
      let result = edgeText.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(true);
    });


  });

});
