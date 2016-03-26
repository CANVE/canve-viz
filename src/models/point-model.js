export class PointModel {

  constructor(x, y, svgHeight) {
    this._x = x;
    this._y = y;
    this._svgHeight = svgHeight;
  }

  get x() {
    return this._x;
  }

  get y() {
    if (this._svgHeight) {
        return this._svgHeight - this._y;
    } else {
      return this._y;
    }
  }

}
