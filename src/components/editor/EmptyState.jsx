import React from "react";
import { Plus, Mouse } from "lucide-react";
import { Button } from "../ui";
import useEditor from "../../hooks/useEditor.js";
import { useDropZone } from "../../hooks/useDragDrop.js";
import { uid } from "../../utils/helpers.js";

function EmptyState() {
  const { registry, dispatch } = useEditor();
  const { dropRef, isOver } = useDropZone("root-empty");

  const onAdd = () => {
    const first = registry.list()[0];
    if (first)
      dispatch({
        type: "ADD_NODE",
        parentId: "root",
        node: {
          id: uid(),
          type: first.type,
          data: first.defaultData?.(),
          children: [],
        },
      });
  };

  return (
    <div
      ref={dropRef}
      className={`text-center py-20 border-2 border-dashed rounded-xl transition-colors ${
        isOver
          ? "bg-blue-50 border-blue-300 text-blue-600"
          : "bg-white border-gray-300 text-gray-500"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Mouse className="h-5 w-5" />
        {isOver ? "Relâchez pour ajouter" : "Déposez des blocs ici"}
      </div>
      <div className="mt-4">
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter un bloc
        </Button>
      </div>
    </div>
  );
}

export default EmptyState;
