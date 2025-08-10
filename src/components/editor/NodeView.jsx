import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, GripVertical } from "lucide-react";
import { Button, Separator } from "../ui";
import useEditor from "../../hooks/useEditor.js";
import { useDragNode, useDropZone } from "../../hooks/useDragDrop.js";

const NodeView = React.memo(
  function NodeView({ nodeId, index }) {
    const { state, registry, dispatch } = useEditor();
    const info = state.nodeIndex.get(nodeId);
    if (!info) return null;

    const node = info.node;
    const def = registry.get(node.type);
    const selected = state.selection === node.id;
    const hovered = state.hover === node.id;

    // Hooks pour drag & drop
    const { dragRef, dragAttributes, dragListeners, isDragging } =
      useDragNode(nodeId);
    const { dropRef: sectionDropRef, isOver } = useDropZone(
      `${node.id}-children`
    );

    return (
      <div className="space-y-2">
        {/* Le nœud principal */}
        <div
          onMouseEnter={() => dispatch({ type: "HOVER", id: node.id })}
          onMouseLeave={() => dispatch({ type: "HOVER", id: null })}
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: "SELECT", id: node.id });
          }}
          className={`relative rounded-xl border bg-white transition-all ${
            selected
              ? "ring-2 ring-blue-500"
              : hovered
              ? "ring-1 ring-neutral-300"
              : ""
          } ${isDragging ? "opacity-50" : ""}`}
        >
          {/* Toolbar */}
          <AnimatePresence>
            {(selected || hovered) && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute -top-3 left-3 z-10"
              >
                <div className="px-2 py-1 text-xs rounded-md bg-neutral-900 text-white shadow flex items-center gap-2">
                  <div
                    ref={dragRef}
                    {...dragAttributes}
                    {...dragListeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-neutral-700 rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="h-3 w-3 opacity-50" />
                  </div>
                  <span className="opacity-80">{def?.label}</span>
                  <Separator
                    orientation="vertical"
                    className="h-4 bg-neutral-700"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-white hover:bg-neutral-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: "DELETE_NODE", id: node.id });
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contenu du bloc */}
          <div className="p-6">
            {def?.render ? (
              def.render(node.data || {}, { node, index })
            ) : (
              <div className="text-sm text-neutral-500">Bloc sans rendu</div>
            )}
          </div>
        </div>

        {/* Enfants (seulement pour les sections) */}
        {def?.type === "section" && (
          <div
            ref={sectionDropRef} // ← IMPORTANT
            className={`ml-4 space-y-2 min-h-[60px] border-l-2 border-dashed pl-4 transition-colors ${
              isOver ? "bg-blue-50 border-blue-400" : "border-gray-300"
            }`}
          >
            <div className="min-h-[60px] space-y-2">
              {node.children?.length ? (
                node.children.map((child, childIndex) => (
                  <NodeView
                    key={child.id}
                    nodeId={child.id}
                    index={childIndex}
                  />
                ))
              ) : (
                <div
                  className={`text-center py-4 border-2 border-dashed rounded-lg transition-colors ${
                    isOver
                      ? "text-blue-500 border-blue-400 bg-blue-50"
                      : "text-gray-400 border-gray-200 bg-gray-50"
                  }`}
                >
                  {isOver ? "👆 Relâchez ici" : "Glissez des blocs ici"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
  (prev, next) => prev.nodeId === next.nodeId && prev.index === next.index
);

export default NodeView;
