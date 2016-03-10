import {inject} from 'aurelia-framework';
import {GraphPresentationModel} from '../models/graph-presentation-model.js';

@inject(GraphPresentationModel)
export class GraphPresentationService {

  constructor(graphPresentationModel) {
    this.graphPresentationModel = graphPresentationModel;
  }

  updateDimensions(width, height) {
    this.graphPresentationModel.width = width;
    this.graphPresentationModel.height = height;
  }

}
