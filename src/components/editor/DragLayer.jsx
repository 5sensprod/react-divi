import { DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";

function DragLayer({ children }) {
  return createPortal(
    <DragOverlay>
      {children && (
        <div className="bg-white border-2 border-blue-500 rounded-lg shadow-xl opacity-90 transform rotate-2">
          {children}
        </div>
      )}
    </DragOverlay>,
    document.body
  );
}

export default DragLayer;
