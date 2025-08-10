import useEditor from "../../hooks/useEditor.js";
import NodeView from "./NodeView.jsx";
import EmptyState from "./EmptyState.jsx";

function Droppable({ id, children }) {
  return (
    <div data-droppable-id={id} className="space-y-3">
      {children}
    </div>
  );
}

function Canvas() {
  const { state } = useEditor();
  const root = state.doc.root;

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
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <Droppable id={root.id}>
          {root.children?.length ? (
            root.children.map((n, idx) => (
              <NodeView key={n.id} nodeId={n.id} index={idx} />
            ))
          ) : (
            <EmptyState />
          )}
        </Droppable>
      </div>
    </div>
  );
}

export default Canvas;
