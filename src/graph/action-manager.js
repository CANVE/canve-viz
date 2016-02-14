import {inject} from 'aurelia-framework';
// import UndoManager from 'npm:undo-manager@1.0.4/undomanager.js';
import UndoManager from 'undo-manager/undomanager';

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
    if (this.canUndo()) {
      this.undoManager.undo();
    }
  }

  redo() {
    if (this.canRedo()) {
      this.undoManager.redo();
    }
  }

  canUndo() {
    return this.undoManager.hasUndo();
  }

  canRedo() {
    return this.undoManager.hasRedo();
  }
}
