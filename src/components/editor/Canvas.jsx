import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import useEditor from "../../hooks/useEditor.js";
import NodeView from "./NodeView.jsx";
import EmptyState from "./EmptyState.jsx";

function Canvas() {
  const editorCtx = useEditor();
  const { state, dispatch, bus, registry } = editorCtx;
  const root = state.doc.root;

  const handleDragStart = (event) => {
    // Drag started
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const draggedNodeId = active.id;
    const dropTarget = over.id;

    try {
      if (dropTarget === "root" || dropTarget === "root-empty") {
        await bus.exec(editorCtx, {
          type: "MOVE_NODE",
          nodeId: draggedNodeId,
          newParentId: "root",
        });
      } else if (dropTarget.includes("-children")) {
        const parentId = dropTarget.replace("-children", "");
        await bus.exec(editorCtx, {
          type: "MOVE_NODE",
          nodeId: draggedNodeId,
          newParentId: parentId,
        });
      } else if (
        dropTarget.includes("section-") &&
        dropTarget.includes("-column-")
      ) {
        const parts = dropTarget.split("-");
        const sectionId = parts[1];
        const columnIndex = parseInt(parts[3]);
        await bus.exec(editorCtx, {
          type: "MOVE_NODE_TO_SECTION_COLUMN",
          nodeId: draggedNodeId,
          sectionId: sectionId,
          columnIndex: columnIndex,
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
