import React from "react";
import EditorContext from "../context/EditorContext.jsx";

function useEditor() {
  const ctx = React.useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside <DiviLikeEditor/>");
  return ctx;
}

export default useEditor;
