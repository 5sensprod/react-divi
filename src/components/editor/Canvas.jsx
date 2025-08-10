import React from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import useEditor from "../../hooks/useEditor.js";
import NodeView from "./NodeView.jsx";
import EmptyState from "./EmptyState.jsx";
import DropZone from "./DropZone.jsx";

function Canvas() {
  const editorCtx = useEditor(); // Récupère tout le contexte
  const { state, dispatch, bus, registry } = editorCtx;
  const root = state.doc.root;

  const handleDragStart = (event) => {
    console.log("Drag started:", event.active.id);
  };

  const handleDragOver = (event) => {
    // Logique de survol pendant le drag
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const draggedNodeId = active.id;
    const dropTarget = over.id;

    // Utiliser editorCtx qui contient tout
    if (dropTarget === "root") {
      await bus.exec(editorCtx, {
        type: "MOVE_NODE",
        nodeId: draggedNodeId,
        newParentId: "root",
      });
    } else if (dropTarget.endsWith("-children")) {
      const parentId = dropTarget.replace("-children", "");
      await bus.exec(editorCtx, {
        type: "MOVE_NODE",
        nodeId: draggedNodeId,
        newParentId: parentId,
      });
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
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <DropZone dropId="root" placeholder="Déposez des blocs ici">
            <SortableContext
              items={root.children?.map((n) => n.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {root.children?.length ? (
                root.children.map((n, idx) => (
                  <NodeView key={n.id} nodeId={n.id} index={idx} />
                ))
              ) : (
                <EmptyState />
              )}
            </SortableContext>
          </DropZone>
        </div>

        {/* Overlay pendant le drag */}
        <DragOverlay>
          {/* Ici on pourrait afficher un aperçu du bloc dragué */}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default Canvas;
