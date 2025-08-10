import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, GripVertical, Settings, ChevronDown } from "lucide-react";
import { Button, Separator } from "../ui";
import useEditor from "../../hooks/useEditor.js";
import { useDragNode, useDropZone } from "../../hooks/useDragDrop.js";

// Layouts prédéfinis pour les sections
const SECTION_LAYOUTS = {
  1: [
    {
      id: "single",
      name: "1 Colonne",
      distribution: [100],
      preview: "▓▓▓▓▓▓▓▓▓▓",
    },
  ],
  2: [
    {
      id: "half-half",
      name: "50% / 50%",
      distribution: [50, 50],
      preview: "▓▓▓▓▓ ▓▓▓▓▓",
    },
    {
      id: "third-twothird",
      name: "33% / 67%",
      distribution: [33.33, 66.67],
      preview: "▓▓▓ ▓▓▓▓▓▓▓",
    },
    {
      id: "twothird-third",
      name: "67% / 33%",
      distribution: [66.67, 33.33],
      preview: "▓▓▓▓▓▓▓ ▓▓▓",
    },
    {
      id: "quarter-threequarter",
      name: "25% / 75%",
      distribution: [25, 75],
      preview: "▓▓ ▓▓▓▓▓▓▓▓",
    },
    {
      id: "threequarter-quarter",
      name: "75% / 25%",
      distribution: [75, 25],
      preview: "▓▓▓▓▓▓▓▓ ▓▓",
    },
  ],
  3: [
    {
      id: "third-third-third",
      name: "33% / 33% / 33%",
      distribution: [33.33, 33.33, 33.33],
      preview: "▓▓▓ ▓▓▓ ▓▓▓",
    },
    {
      id: "quarter-half-quarter",
      name: "25% / 50% / 25%",
      distribution: [25, 50, 25],
      preview: "▓▓ ▓▓▓▓▓ ▓▓",
    },
    {
      id: "half-quarter-quarter",
      name: "50% / 25% / 25%",
      distribution: [50, 25, 25],
      preview: "▓▓▓▓▓ ▓▓ ▓▓",
    },
    {
      id: "quarter-quarter-half",
      name: "25% / 25% / 50%",
      distribution: [25, 25, 50],
      preview: "▓▓ ▓▓ ▓▓▓▓▓",
    },
  ],
  4: [
    {
      id: "quarter-quarter-quarter-quarter",
      name: "25% / 25% / 25% / 25%",
      distribution: [25, 25, 25, 25],
      preview: "▓▓ ▓▓ ▓▓ ▓▓",
    },
  ],
};

// Composant pour configurer les colonnes d'une section
function SectionColumnConfig({
  sectionId,
  currentLayout,
  onLayoutChange,
  isVisible,
  onClose,
}) {
  const [selectedColumnCount, setSelectedColumnCount] = useState(
    currentLayout?.distribution?.length || 1
  );

  if (!isVisible) return null;

  const availableLayouts = SECTION_LAYOUTS[selectedColumnCount] || [];

  return (
    <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">Configuration colonnes</h4>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Sélection du nombre de colonnes */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">
          Nombre de colonnes
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((count) => (
            <Button
              key={count}
              variant={selectedColumnCount === count ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedColumnCount(count)}
              className="flex-1"
            >
              {count}
            </Button>
          ))}
        </div>
      </div>

      {/* Sélection du layout */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">
          Disposition
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {availableLayouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() =>
                onLayoutChange(sectionId, {
                  count: selectedColumnCount,
                  distribution: layout.distribution,
                  layoutId: layout.id,
                })
              }
              className={`w-full p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                currentLayout?.layoutId === layout.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{layout.name}</span>
                <span className="text-xs text-gray-500">
                  {layout.distribution
                    .map((d) => `${Math.round(d)}%`)
                    .join(" / ")}
                </span>
              </div>
              <div className="text-xs font-mono text-gray-400 bg-gray-100 p-1 rounded">
                {layout.preview}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const NodeView = React.memo(
  function NodeView({ nodeId, index }) {
    const { state, registry, dispatch } = useEditor();
    const [showColumnConfig, setShowColumnConfig] = useState(false);

    const info = state.nodeIndex.get(nodeId);
    if (!info) return null;

    const node = info.node;
    const def = registry.get(node.type);
    const selected = state.selection === node.id;
    const hovered = state.hover === node.id;

    // Hooks pour drag & drop principal
    const { dragRef, dragAttributes, dragListeners, isDragging } =
      useDragNode(nodeId);
    const { dropRef: sectionDropRef, isOver } = useDropZone(
      `${node.id}-children`
    );

    // Configuration des colonnes pour les sections
    const isSection = def?.type === "section";
    const columnLayout = node.columnLayout ||
      node.data?.columnLayout || {
        count: 1,
        distribution: [100],
        layoutId: "single",
      };

    // ✅ CORRECTION: Créer les hooks pour toutes les colonnes possibles (max 4) de manière inconditionnelle
    const columnDropHooks = [
      useDropZone(`section-${node.id}-column-0`),
      useDropZone(`section-${node.id}-column-1`),
      useDropZone(`section-${node.id}-column-2`),
      useDropZone(`section-${node.id}-column-3`),
    ];

    // Répartir les enfants dans les colonnes (pour les sections)
    const childrenPerColumn = React.useMemo(() => {
      if (!isSection || !node.children || columnLayout.count === 1) {
        return [node.children || []];
      }

      const columns = Array.from({ length: columnLayout.count }, () => []);

      node.children.forEach((child, childIndex) => {
        // Si l'enfant a une métadonnée columnIndex, l'utiliser
        if (
          typeof child.columnIndex === "number" &&
          child.columnIndex < columnLayout.count
        ) {
          columns[child.columnIndex].push(child);
        } else {
          // Sinon, répartition séquentielle
          const colIndex = childIndex % columnLayout.count;
          columns[colIndex].push(child);
        }
      });

      return columns;
    }, [isSection, node.children, columnLayout]);
    const handleLayoutChange = (sectionId, newLayout) => {
      // Mettre à jour la section avec la nouvelle configuration
      dispatch({
        type: "UPDATE_NODE",
        id: sectionId,
        patch: {
          columnLayout: newLayout,
        },
      });

      // Redistribuer les enfants automatiquement si changement de nombre de colonnes
      if (newLayout.count !== columnLayout.count && node.children?.length > 0) {
        const redistributedChildren = node.children.map(
          (child, childIndex) => ({
            ...child,
            columnIndex: childIndex % newLayout.count,
          })
        );

        dispatch({
          type: "UPDATE_NODE",
          id: sectionId,
          patch: {
            children: redistributedChildren,
          },
        });
      }

      setShowColumnConfig(false);
    };

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

                  {/* Bouton colonnes pour les sections */}
                  {isSection && (
                    <>
                      <Separator
                        orientation="vertical"
                        className="h-4 bg-neutral-700"
                      />
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-white hover:bg-neutral-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowColumnConfig(!showColumnConfig);
                          }}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          {columnLayout.count}col
                        </Button>

                        <SectionColumnConfig
                          sectionId={node.id}
                          currentLayout={columnLayout}
                          onLayoutChange={handleLayoutChange}
                          isVisible={showColumnConfig}
                          onClose={() => setShowColumnConfig(false)}
                        />
                      </div>
                    </>
                  )}

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

        {/* Enfants (pour toutes les sections) */}
        {isSection && (
          <div className="ml-4 pl-4">
            {columnLayout.count === 1 ? (
              // Mode single colonne (comportement original)
              <div
                ref={sectionDropRef}
                className={`space-y-2 min-h-[60px] border-l-2 border-dashed transition-colors ${
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
            ) : (
              // Mode multi-colonnes
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: columnLayout.distribution
                    .map((percent) => `${percent}fr`)
                    .join(" "),
                }}
              >
                {childrenPerColumn.map((columnChildren, columnIndex) => {
                  // ✅ Utiliser les hooks précréés
                  const { dropRef: columnDropRef, isOver: columnIsOver } =
                    columnDropHooks[columnIndex];

                  return (
                    <div
                      key={columnIndex}
                      ref={columnDropRef}
                      className={`min-h-[100px] p-3 border-2 border-dashed rounded-lg transition-colors ${
                        columnIsOver
                          ? "bg-blue-50 border-blue-400"
                          : "border-gray-300"
                      }`}
                    >
                      <div className="text-xs font-medium text-gray-500 mb-3">
                        Colonne {columnIndex + 1} (
                        {Math.round(columnLayout.distribution[columnIndex])}%)
                      </div>

                      <div className="space-y-2">
                        {columnChildren.length > 0 ? (
                          columnChildren.map((child, childIndex) => (
                            <NodeView
                              key={child.id}
                              nodeId={child.id}
                              index={childIndex}
                            />
                          ))
                        ) : (
                          <div
                            className={`text-center py-6 text-sm transition-colors ${
                              columnIsOver ? "text-blue-600" : "text-gray-400"
                            }`}
                          >
                            {columnIsOver
                              ? "Relâchez ici"
                              : "Glissez des blocs ici"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
  (prev, next) => prev.nodeId === next.nodeId && prev.index === next.index
);

export default NodeView;
