import {inject} from 'aurelia-framework';
import UndoManager from 'npm:undo-manager@1.0.3/undomanager.js';

// Experiment
import {Router} from 'aurelia-router';

@inject(UndoManager, Router)
export class ActionManager {

  constructor(undoManager, router) {
    this.undoManager = undoManager;
    this.router = router;
  }

  addAction(context, undoAction, undoArgs, redoAction, redoArgs) {
    this.undoManager.add({
      undo: () => undoAction.apply(context, undoArgs),
      redo: () => redoAction.apply(context, redoArgs)
    });

    // Experiment
    let url = this.router.generate('start', { action: 'foo' });
    this.router.navigate(url);
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
