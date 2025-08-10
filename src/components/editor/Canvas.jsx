import React from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import useEditor from "../../hooks/useEditor.js";
import NodeView from "./NodeView.jsx";
import EmptyState from "./EmptyState.jsx";

function Canvas() {
  const editorCtx = useEditor();
  const { state, dispatch, bus, registry } = editorCtx;
  const root = state.doc.root;

  const handleDragStart = (event) => {
    console.log("Drag started:", event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    console.log("=== DRAG END DEBUG ===");
    console.log("Over.id:", over?.id);

    if (!over) {
      console.log("No drop target");
      return;
    }

    const draggedNodeId = active.id;
    const dropTarget = over.id;

    console.log("Drop target detected:", dropTarget);

    try {
      if (dropTarget === "root" || dropTarget === "root-empty") {
        console.log("Moving to root");
        await bus.exec(editorCtx, {
          type: "MOVE_NODE",
          nodeId: draggedNodeId,
          newParentId: "root",
        });
      } else if (dropTarget.includes("-children")) {
        const parentId = dropTarget.replace("-children", "");
        console.log("Moving to section:", parentId);
        await bus.exec(editorCtx, {
          type: "MOVE_NODE",
          nodeId: draggedNodeId,
          newParentId: parentId,
        });
      }
    } catch (error) {
      console.error("Drag & drop error:", error);
    }
  };

  return (
    <div className="relative w-full h-full bg-neutral-50 border rounded-2xl p-6">
      {state.flags.guidelines && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30 rounded-2xl"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          {/* PAS de zone de drop ici - elle interfère */}
          <div className="min-h-[400px] space-y-4">
            {root.children?.length ? (
              root.children.map((n, idx) => (
                <NodeView key={n.id} nodeId={n.id} index={idx} />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        <DragOverlay>{null}</DragOverlay>
      </DndContext>
    </div>
  );
}

export default Canvas;
