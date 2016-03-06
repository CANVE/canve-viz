export class NodeCalculator {

  constructor() {}

  radius(boundingBox, fontSize) {
    return Math.max(boundingBox.width, boundingBox.height) / 2 + fontSize;
  }

  centerVertically(boundingBox) {
    return -(boundingBox.height / 4);
  }

  // For now just handles y position cut off from top
  adjustPositionToFit(radius, currentY) {
    let adjustedY = currentY;

    if (currentY - radius < 0) {
      adjustedY = radius;
    }

    return adjustedY;
  }
}
