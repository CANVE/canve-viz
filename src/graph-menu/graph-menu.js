import {inject, customElement, bindable} from 'aurelia-framework';
import {ActionManager} from '../graph/action-manager';

@customElement('graph-menu')
@inject(Element, ActionManager)
export class GraphMenu {
  @bindable graphInteractionModel;

  constructor(element, actionManager) {
    this.element = element;
    this.actionManager = actionManager;
    this.show = false;
  }

  showGraph() {
    this.show = true;
  }

  hideGraph() {
    this.show = false;
  }

  undo() {
    this.actionManager.undo();
  }

  redo() {
    this.actionManager.redo();
  }

  get canUndo() {
    return this.actionManager.canUndo();
  }

  get canRedo() {
    return this.actionManager.canRedo();
  }

  graphInteractionModelChanged(newValue) {
    this.graphInteractionModel = newValue;
    this.interactionOptions = ['of it', 'by it'];
  }

}
