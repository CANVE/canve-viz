export class NodeCalculator {

  constructor() {
    
  }

  radius(boundingBox, fontSize) {
    return Math.max(boundingBox.width, boundingBox.height) / 2 + fontSize;
  }

  centerVertically(boundingBox) {
    return -(boundingBox.height / 4);
  }

}
