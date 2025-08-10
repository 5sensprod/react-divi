import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button, Separator } from "../ui";
import useEditor from "../../hooks/useEditor.js";

const NodeView = React.memo(
  function NodeView({ nodeId, index }) {
    const { state, registry, dispatch } = useEditor();
    const info = state.nodeIndex.get(nodeId);
    if (!info) return null;

    const node = info.node;
    const def = registry.get(node.type);
    const selected = state.selection === node.id;
    const hovered = state.hover === node.id;

    return (
      <div
        onMouseEnter={() => dispatch({ type: "HOVER", id: node.id })}
        onMouseLeave={() => dispatch({ type: "HOVER", id: null })}
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: "SELECT", id: node.id });
        }}
        className={`relative rounded-xl border bg-white transition-all cursor-pointer ${
          selected
            ? "ring-2 ring-blue-500"
            : hovered
            ? "ring-1 ring-neutral-300"
            : ""
        }`}
      >
        <AnimatePresence>
          {(selected || hovered) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute -top-3 left-3 z-10"
            >
              <div className="px-2 py-1 text-xs rounded-md bg-neutral-900 text-white shadow flex items-center gap-2">
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

        <div className="p-6">
          {def?.render ? (
            def.render(node.data || {}, { node, index })
          ) : (
            <div className="text-sm text-neutral-500">Bloc sans rendu</div>
          )}
        </div>
      </div>
    );
  },
  (prev, next) => prev.nodeId === next.nodeId && prev.index === next.index
);

export default NodeView;
