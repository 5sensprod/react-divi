import { useDraggable, useDroppable } from "@dnd-kit/core";

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
