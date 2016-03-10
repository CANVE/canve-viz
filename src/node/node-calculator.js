import {inject} from 'aurelia-framework';
import {GraphPresentationModel} from '../models/graph-presentation-model';

@inject(GraphPresentationModel)
export class NodeCalculator {

  constructor(graphPresentationModel) {
    this.graphPresentationModel = graphPresentationModel;
  }

  radius(boundingBox, fontSize) {
    return Math.max(boundingBox.width, boundingBox.height) / 2 + fontSize;
  }

  centerVertically(boundingBox) {
    return -(boundingBox.height / 4);
  }

  /**
   * Detect if any nodes are positioned out of display bounds
   * and adjust them to fit within the display area bounded
   * on the top left by (0,0) and on the bottom right by
   * (this.graphPresentationModel.width, this.graphPresentationModel.height)
   */
  adjustPositionToFit(radius, currentY) {
    let adjustedY = currentY;

    // Push it down if cut off top
    if (currentY - radius < 0) {
      adjustedY = radius;
    }

    // Push it up if cut off bottom
    if (currentY + radius >= this.graphPresentationModel.height ) {
      adjustedY = this.graphPresentationModel.height - radius;
    }

    return adjustedY;
  }
}
