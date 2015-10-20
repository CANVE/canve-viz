import {inject, customElement} from 'aurelia-framework';
import {ActionManager} from '../graph/action-manager';
import {GraphInteractionModel} from './graph-interaction-model';

@customElement('graph-menu')
@inject(Element, ActionManager, GraphInteractionModel)
export class SearchGraph {

  constructor(element, actionManager, graphInteractionModel) {
    this.element = element;
    this.actionManager = actionManager;
    this.graphInteractionModel = graphInteractionModel;
  }

  update() {
    console.log(`=== graph-menu interaction model: ${JSON.stringify(this.graphInteractionModel)}`);
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
