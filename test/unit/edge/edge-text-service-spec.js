import {EdgeTextService} from '../../../src/edge/edge-text-service';
import {PointModel} from '../../../src/models/point-model';

describe('EdgeTextService', function() {
  let edgeTextService;
  let mockGraphPresentationModel;

  beforeEach( () => {
    mockGraphPresentationModel = {
      width: 100,
      height: 100
    };
    edgeTextService = new EdgeTextService(mockGraphPresentationModel);
  });

  describe('angleInDegreesBetweenPoints', () => {

    it('Returns 270 degrees', () => {
      // Given
      let point1 = new PointModel(0, 0);
      let point2 = new PointModel(1, 1);
      let fixedPoint = new PointModel(1, 0);

      // When
      let result = edgeTextService.angleInDegreesBetweenPoints(point1, point2, fixedPoint);

      // Then
      expect(result).toEqual(270);
    });

    it('Returns 90 degrees', () => {
      // Given
      let point1 = new PointModel(1, 0);
      let point2 = new PointModel(0, 1);
      let fixedPoint = new PointModel(0, 0);

      // When
      let result = edgeTextService.angleInDegreesBetweenPoints(point1, point2, fixedPoint);

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
      let result = edgeTextService.angleInDegreesBetweenPoints(point1, point2, fixedPoint);

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
      let result = edgeTextService.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(false);
    });

    it('Returns false when target point is below and to the right of source point', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 75;
      let targetY = 75;

      // When
      let result = edgeTextService.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(false);
    });

    it('Returns false when target point is to the right of soure point and on the same y plane', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 75;
      let targetY = 50;

      // When
      let result = edgeTextService.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(false);
    });

    it('Returns false when target point is above soure point and on the same x plane', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 50;
      let targetY = 25;

      // When
      let result = edgeTextService.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(false);
    });

    it('Returns true when target point is above and to the left of source point', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 25;
      let targetY = 25;

      // When
      let result = edgeTextService.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(true);
    });

    it('Returns true when target point is below and to the left of source point', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 25;
      let targetY = 75;

      // When
      let result = edgeTextService.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(true);
    });

    it('Returns true when target point is to the left of source point and on the same y plane', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 25;
      let targetY = 50;

      // When
      let result = edgeTextService.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(true);
    });

    it('Returns true when target point is below source point and on the same x plane', () => {
      let sourceX = 50;
      let sourceY = 50;
      let targetX = 50;
      let targetY = 100;

      // When
      let result = edgeTextService.isUpsideDown(sourceX, sourceY, targetX, targetY);

      // Then
      expect(result).toBe(true);
    });

  });

});
