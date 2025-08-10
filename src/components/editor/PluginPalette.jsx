import React from "react";
import { Puzzle, Plus } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ScrollArea,
} from "../ui";
import useEditor from "../../hooks/useEditor.js";
import { uid } from "../../utils/helpers.js";

function PluginPalette() {
  const { registry, dispatch } = useEditor();
  const defs = registry.list();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Puzzle className="h-4 w-4" /> Blocs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-2">
          <div className="grid grid-cols-2 gap-2">
            {defs.map((d) => (
              <Button
                key={d.type}
                variant="secondary"
                className="justify-start gap-2"
                onClick={() =>
                  dispatch({
                    type: "ADD_NODE",
                    parentId: "root",
                    node: {
                      id: uid(),
                      type: d.type,
                      data: d.defaultData?.() || {},
                      children: [],
                    },
                  })
                }
              >
                <d.icon className="h-4 w-4" />
                {d.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default PluginPalette;
