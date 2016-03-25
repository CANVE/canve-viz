import {EdgeText} from '../../../src/edge/edge-text';
import {PointModel} from '../../../src/models/point-model';

describe('EdgeText', function() {
  let edgeText;
  let mockGraphPresentationModel;

  beforeEach( () => {
    mockGraphPresentationModel = {
      width: 800,
      height: 600
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

    // wip
    xit('Returns true if given points would show text path as upside down', () => {
      // width="1340" height="693"
      // M638.5238852389741 428.9279798025884 L431.15192958012284 393.63176497853
    });

  });

});
