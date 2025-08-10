import React from "react";
import { Save, Undo2, Redo2, Download, Upload, Layout } from "lucide-react";
import { Button, Separator } from "../ui";
import useEditor from "../../hooks/useEditor.js";

function Topbar() {
  const { state, dispatch, services } = useEditor();

  const onSave = () => services.get("persistence").save(state.doc);
  const onLoad = () => {
    const d = services.get("persistence").load();
    if (d) dispatch({ type: "LOAD_DOC", doc: d });
  };
  const onExport = () => services.get("exporter").download(state.doc);
  const onImport = async () => {
    const file = await services.get("importer").pickFile();
    if (file) dispatch({ type: "LOAD_DOC", doc: file });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-xl border shadow-sm">
      <Button size="sm" onClick={() => dispatch({ type: "UNDO" })}>
        <Undo2 className="h-4 w-4 mr-1" />
        Undo
      </Button>
      <Button size="sm" onClick={() => dispatch({ type: "REDO" })}>
        <Redo2 className="h-4 w-4 mr-1" />
        Redo
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button size="sm" onClick={onSave}>
        <Save className="h-4 w-4 mr-1" />
        Sauver
      </Button>
      <Button size="sm" variant="secondary" onClick={onLoad}>
        <Upload className="h-4 w-4 mr-1" />
        Charger
      </Button>
      <Button size="sm" variant="outline" onClick={onExport}>
        <Download className="h-4 w-4 mr-1" />
        Exporter JSON
      </Button>
      <Button size="sm" variant="outline" onClick={onImport}>
        <Upload className="h-4 w-4 mr-1" />
        Importer JSON
      </Button>
      {state.errors.length > 0 && (
        <div className="ml-2 text-xs text-red-600">{state.errors[0]}</div>
      )}
      <div className="ml-auto flex items-center gap-2 text-xs text-neutral-500">
        <Layout className="h-4 w-4" /> {state.doc.name}
      </div>
    </div>
  );
}

export default Topbar;
