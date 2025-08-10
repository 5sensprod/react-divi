import { useDropZone } from "../../hooks/useDragDrop.js";

function DropZone({
  dropId,
  children,
  acceptTypes = ["node"],
  className = "",
  placeholder = "Déposez ici",
}) {
  const { dropRef, isOver } = useDropZone(dropId, acceptTypes);

  return (
    <div
      ref={dropRef}
      className={`${className} ${
        isOver
          ? "bg-blue-50 border-2 border-blue-300 border-dashed"
          : "border-2 border-transparent"
      } transition-all duration-200 rounded-lg min-h-[100px]`}
    >
      {children || (
        <div
          className={`flex items-center justify-center h-24 text-gray-400 ${
            isOver ? "text-blue-500" : ""
          }`}
        >
          {isOver ? "👆 Relâchez ici" : placeholder}
        </div>
      )}
    </div>
  );
}

export default DropZone;
