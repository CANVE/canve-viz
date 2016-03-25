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

  });

});
