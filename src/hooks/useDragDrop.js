import { useContext } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import EditorContext from "../context/EditorContext.jsx";

export function useDragNode(nodeId) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: nodeId,
    data: {
      type: "node",
      nodeId,
    },
  });

  return {
    dragRef: setNodeRef,
    dragAttributes: attributes,
    dragListeners: listeners,
    isDragging,
  };
}

export function useDropZone(dropId, acceptTypes = ["node"]) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: {
      accepts: acceptTypes,
    },
  });

  return {
    dropRef: setNodeRef,
    isOver,
  };
}

// Hook simplifié sans le service DragDrop pour l'instant
export function useDragDrop() {
  const { emitter } = useContext(EditorContext);

  return {
    emitter,
    startDrag: (item) => emitter.emit("drag:start", { item }),
    endDrag: (result) => emitter.emit("drag:end", result),
    cancelDrag: (item) => emitter.emit("drag:cancel", { item }),
  };
}
