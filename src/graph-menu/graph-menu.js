import {inject, customElement, bindable} from 'aurelia-framework';
import {ActionManager} from '../graph/action-manager';
import {GraphInteractionModel} from './graph-interaction-model';

@customElement('graph-menu')
@inject(Element, ActionManager, GraphInteractionModel)
export class GraphMenu {

  constructor(element, actionManager, graphInteractionModel) {
    this.element = element;
    this.actionManager = actionManager;
    this.graphInteractionModel = graphInteractionModel;
  }

  // maybe don't need an update method now that graphInteractionModel is bound to graph
  update() {
    console.log(`=== graph-menu.update: interaction model = ${JSON.stringify(this.graphInteractionModel, null, 2)}`);
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

}
