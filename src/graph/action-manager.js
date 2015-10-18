import {inject} from 'aurelia-framework';
import UndoManager from 'npm:undo-manager@1.0.3/undomanager.js';

@inject(UndoManager)
export class ActionManager {

  constructor(undoManager) {
    this.undoManager = undoManager;
  }

  addAction(context, undoAction, undoArgs, redoAction, redoArgs) {
    this.undoManager.add({
      undo: () => undoAction.apply(context, undoArgs),
      redo: () => redoAction.apply(context, redoArgs)
    });
  }

  undo() {
    this.undoManager.undo();
  }

  redo() {
    this.undoManager.redo();
  }
}
