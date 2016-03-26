import {inject} from 'aurelia-framework';
import {PointModel} from '../models/point-model';
import {GraphPresentationModel} from '../models/graph-presentation-model';

@inject(GraphPresentationModel)
export class EdgeTextService {

  constructor(graphPresentationModel) {
    this.graphPresentationModel = graphPresentationModel;
  }

  calculatePath(sourceX, sourceY, targetX, targetY) {
    if (this.isUpsideDown(sourceX, sourceY, targetX, targetY)) {
      return `M${targetX} ${targetY} L${sourceX} ${sourceY}`;
    } else {
      return `M${sourceX} ${sourceY} L${targetX} ${targetY}`;
    }
  }

  /**
  * Any angle between 0 and 90 (inclusive) is right side up
  * Between 91 and 270 is upside down
  * Between 271 and 360 is right side up
  */
  isUpsideDown(sourceX, sourceY, targetX, targetY) {
    let targetPoint = new PointModel(targetX, targetY, this.graphPresentationModel.height),
      sourcePrimePoint = new PointModel(this.graphPresentationModel.width, sourceY, this.graphPresentationModel.height),
      fixedPoint = new PointModel(sourceX, sourceY, this.graphPresentationModel.height),
      response = false;

    let angle = this.angleInDegreesBetweenPoints(sourcePrimePoint, targetPoint, fixedPoint);

    if (this.isNumberBetweenInclusive(angle, 91, 270)) {
      response = true;
    }

    return response;
  }

  angleInDegreesBetweenPoints(point1, point2, fixedPoint) {
    let angle1 = Math.atan2(point1.y - fixedPoint.y, point1.x - fixedPoint.x),
      angle2 = Math.atan2(point2.y - fixedPoint.y, point2.x - fixedPoint.x);

    let angleInDegrees =  (angle1 - angle2) * (180/Math.PI);

    if (angleInDegrees < 0) {
      return Math.abs(angleInDegrees);
    } else {
      return 360 - Math.abs(angleInDegrees);
    }
  }

  isNumberBetweenInclusive(num, startVal, endVal) {
    return num >= startVal && num <= endVal;
  }

}
