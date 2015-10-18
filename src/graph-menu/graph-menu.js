import {inject, customElement} from 'aurelia-framework';
import {ActionManager} from '../graph/action-manager';

@customElement('graph-menu')
@inject(Element, ActionManager)
export class SearchGraph {

  constructor(element, actionManager) {
    this.element = element;
    this.actionManager = actionManager;
  }

  undo() {
    this.actionManager.undo();
  }

  redo() {
    this.actionManager.redo();
  }

}
