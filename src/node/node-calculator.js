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

}
