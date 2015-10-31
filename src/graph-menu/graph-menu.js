import {inject, customElement, bindable} from 'aurelia-framework';
import {ActionManager} from '../graph/action-manager';

@customElement('graph-menu')
@inject(Element, ActionManager)
export class SearchGraph {
  @bindable data;

  constructor(element, actionManager) {
    this.element = element;
    this.actionManager = actionManager;
  }

  dataChanged(newVal) {
    this.graphInteractionModel = newVal;
  }

  // maybe don't need an update method now that graphInteractionModel is bound to graph
  // but even if user clicks in UI, doesn't seem to be updating model???
  update() {
    console.log(`=== graph-menu interaction model: ${JSON.stringify(this.graphInteractionModel, null, 2)}`);
  }

  undo() {
    this.actionManager.undo();
    // temp debug
    console.log(`=== graph-menu interaction model: ${JSON.stringify(this.graphInteractionModel, null, 2)}`);
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

}
