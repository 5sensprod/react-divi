import React from "react";
import { Plus, Mouse } from "lucide-react";
import { Button } from "../ui";
import useEditor from "../../hooks/useEditor.js";
import { uid } from "../../utils/helpers.js";

function EmptyState() {
  const { registry, dispatch } = useEditor();

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
    <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white">
      <div className="flex items-center justify-center gap-2 text-neutral-500">
        <Mouse className="h-5 w-5" />
        Déposez des blocs ici
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
