export class GraphPresentationModel {

  constructor(width, height) {
    this._width = width;
    this._height = height;
  }

  get width() {
    return this._width;
  }

  set width(width) {
    this._width = width;
  }

  get height() {
    return this._height;
  }

  set height(height) {
    this._height = height;
  }
}
