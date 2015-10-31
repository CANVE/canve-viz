import {inject, customElement, bindable} from 'aurelia-framework';
import {ActionManager} from '../graph/action-manager';

@customElement('graph-menu')
@inject(Element, ActionManager)
export class SearchGraph {
  @bindable data;

  constructor(element, actionManager) {
    this.element = element;
    this.actionManager = actionManager;

    // experiment debug radio binding
    // this.colors = ['red', 'green', 'blue'];
    // this.favoriteColor = 'red';
    //
    // this.myModel = {
    //   animals: ['cat', 'dog', 'goldfish'],
    //   favoriteAnimal: 'cat'
    // };
    //
    // this.myModel2 = [
    //   {
    //     display: 'My Test 1',
    //     options: [ 'pink', 'purple'],
    //     selectedVal: 'purple',
    //     randomThing: 'foobar'
    //   },
    //   {
    //     display: 'My Test 2',
    //     options: [ 'boy', 'girl'],
    //     selectedVal: 'boy',
    //     randomThing: 'zoobat'
    //   }
    // ];

    this.interactions = [
      {
        display: 'calls',
        options: [ 'of it', 'by it'],
        selectedVal: 'by it'
      },
      {
        display: 'foo',
        options: [ 'of it', 'by it'],
        selectedVal: 'of it'
      }
    ];

  }

  dataChanged(newVal) {
    this.graphInteractionModel = newVal;
    // console.log(`=== graph-menu interaction model: ${JSON.stringify(this.graphInteractionModel)}`);
  }

  // maybe don't need an update method now that graphInteractionModel is bound to graph
  // but even if user clicks in UI, doesn't seem to be updating model???
  update() {
    // console.log(`=== graph-menu interaction model 2: ${JSON.stringify(this.myModel2)}`);
    console.log(`=== graph-menu interaction model: ${JSON.stringify(this.graphInteractionModel, null, 2)}`);
    // console.log(`=== graph-menu favoriteColor = ${this.favoriteColor}`);
    // console.log(`=== graph-menu favoriteAnimal = ${this.myModel.favoriteAnimal}`);
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
