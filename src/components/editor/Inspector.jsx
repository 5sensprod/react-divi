import React from "react";
import { Settings, Settings2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Input, Toggle } from "../ui";
import useEditor from "../../hooks/useEditor.js";
import { clone } from "../../utils/helpers.js";

function Inspector() {
  const { state, registry, dispatch } = useEditor();
  const sel = state.selection || "root";
  const node = sel === "root" ? state.doc.root : state.nodeIndex.get(sel)?.node;
  const def = registry.get(node?.type);

  if (!node || node.id === "root") {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" /> Page
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-500 block mb-1">
                Nom de la page
              </label>
              <Input
                value={state.doc.name || ""}
                onChange={(e) => {
                  const d = clone(state.doc);
                  d.name = e.target.value;
                  dispatch({ type: "LOAD_DOC", doc: d });
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Toggle
                pressed={state.flags.guidelines}
                onPressedChange={() =>
                  dispatch({ type: "TOGGLE_FLAG", flag: "guidelines" })
                }
              >
                Guides
              </Toggle>
              <Toggle
                pressed={state.flags.experimentalGrid}
                onPressedChange={() =>
                  dispatch({ type: "TOGGLE_FLAG", flag: "experimentalGrid" })
                }
              >
                Grille
              </Toggle>
              <Toggle
                pressed={state.flags.snapping}
                onPressedChange={() =>
                  dispatch({ type: "TOGGLE_FLAG", flag: "snapping" })
                }
              >
                Snap
              </Toggle>
              <Toggle
                pressed={state.flags.autosave}
                onPressedChange={() =>
                  dispatch({ type: "TOGGLE_FLAG", flag: "autosave" })
                }
              >
                Autosave
              </Toggle>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" /> Propriétés
        </CardTitle>
      </CardHeader>
      <CardContent>
        {def?.inspector ? (
          def.inspector(
            node.data || {},
            (patch) => dispatch({ type: "UPDATE_NODE", id: node.id, patch }),
            { node }
          )
        ) : (
          <div className="text-sm text-neutral-500">
            Pas de panneau pour ce bloc.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Inspector;
