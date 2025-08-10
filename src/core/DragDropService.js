class DragDropService {
  constructor(emitter) {
    this.emitter = emitter;
    this.draggedItem = null;
    this.dropTarget = null;
  }

  startDrag(item) {
    this.draggedItem = item;
    this.emitter.emit("drag:start", { item });
  }

  updateDrag(target) {
    this.dropTarget = target;
    this.emitter.emit("drag:over", { item: this.draggedItem, target });
  }

  endDrag(result) {
    const finalResult = {
      dragged: this.draggedItem,
      target: this.dropTarget,
      ...result,
    };

    this.emitter.emit("drag:end", finalResult);

    // Nettoyage
    this.draggedItem = null;
    this.dropTarget = null;

    return finalResult;
  }

  cancelDrag() {
    this.emitter.emit("drag:cancel", { item: this.draggedItem });
    this.draggedItem = null;
    this.dropTarget = null;
  }

  getDraggedItem() {
    return this.draggedItem;
  }

  getDropTarget() {
    return this.dropTarget;
  }
}

export default DragDropService;
