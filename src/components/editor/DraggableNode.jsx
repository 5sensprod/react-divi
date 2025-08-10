import { useDragNode } from "../../hooks/useDragDrop.js";

function DraggableNode({ nodeId, children, className = "" }) {
  const { dragRef, dragAttributes, dragListeners, isDragging } =
    useDragNode(nodeId);

  return (
    <div
      ref={dragRef}
      {...dragAttributes}
      {...dragListeners}
      className={`${className} ${
        isDragging ? "opacity-50 cursor-grabbing" : "cursor-grab"
      } transition-opacity`}
      style={{
        transform: isDragging ? "rotate(2deg)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export default DraggableNode;
