import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { Puzzle } from "lucide-react";
import {
  Canvas,
  Inspector,
  PluginPalette,
  Topbar,
  FooterDocs,
} from "./components/editor";

// Imports core
import Emitter from "./core/EventEmitter.js";
import CommandBus from "./core/CommandBus.js";
import Services from "./core/Services.js";
import BlockRegistry from "./core/BlockRegistry.js";
import reducer from "./core/reducer.js";

// Imports utils
import { uid, clone, debounce } from "./utils/helpers.js";
import { saveDoc, loadDoc } from "./utils/persistence.js";

import {
  findNodeById,
  removeNodeImmutably,
  addNodeImmutably,
  insertNodeAtPosition,
} from "./utils/nodeUtils.js";
// Imports des blocs
import {
  SectionBlock,
  HeroBlock,
  TextBlock,
  ButtonBlock,
  ImageBlock,
} from "./components/blocks";

// Imports des composants éditeur
// import {
//   Canvas,
//   Inspector,
//   PluginPalette,
//   Topbar,
//   FooterDocs,
// } from "./components/editor";

// Imports contexte
import EditorContext from "./context/EditorContext.jsx";
import { Button } from "./components/ui";

/***************************
 *  "DIVI-LIKE" STARTER KIT *
 *         v3 JSX           *
 ****************************/

/*****************
 * Feature Flags  *
 *****************/
const defaultFlags = {
  experimentalGrid: true,
  guidelines: true,
  autosave: true,
  snapping: false,
};

/***************************
 * État de l'éditeur (store)
 ***************************/
const initialDoc = () => ({
  id: uid(),
  name: "Ma page",
  root: { id: "root", type: "section", children: [] },
});

function indexDoc(root) {
  const map = new Map();
  (function walk(n, parentId = null) {
    map.set(n.id, { node: n, parentId });
    (n.children || []).forEach((c) => walk(c, n.id));
  })(root);
  return map;
}

const initialState = () => {
  const doc = initialDoc();
  return {
    doc,
    selection: null,
    hover: null,
    history: { past: [], future: [] },
    flags: defaultFlags,
    nodeIndex: indexDoc(doc.root),
    errors: [],
    // AJOUT: Configuration des colonnes
    columnLayout: {
      count: 1,
      distribution: [100],
      enabled: true,
    },
  };
};

/************************
 * Services par défaut   *
 ************************/
function createDefaultServices() {
  const s = new Services();

  s.set("persistence", {
    save: (doc) => saveDoc(doc),
    load: () => loadDoc(),
  });

  s.set("exporter", {
    download: (doc) => {
      const blob = new Blob([JSON.stringify(doc, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.name || "page"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  s.set("importer", {
    pickFile: () =>
      new Promise((resolve) => {
        const inp = document.createElement("input");
        inp.type = "file";
        inp.accept = "application/json";
        inp.onchange = () => {
          const file = inp.files?.[0];
          if (!file) return resolve(null);
          const reader = new FileReader();
          reader.onload = () => {
            try {
              resolve(JSON.parse(reader.result));
            } catch {
              resolve(null);
            }
          };
          reader.readAsText(file);
        };
        inp.click();
      }),
  });

  return s;
}

/*****************************
 * Bus de commandes par défaut
 *****************************/
function registerDefaultCommands(bus) {
  bus.register("ADD_BLOCK", (ctx, { parentId, type, data }) => {
    const def = ctx.registry.get(type);
    const node = {
      id: uid(),
      type,
      data: data ?? def?.defaultData?.(),
      children: [],
    };
    ctx.dispatch({ type: "ADD_NODE", parentId, node });
    ctx.emitter.emit("block:add", { parentId, node });
  });

  bus.register("SET_PROPERTY", (ctx, { id, patch }) => {
    ctx.dispatch({ type: "UPDATE_NODE", id, patch });
    ctx.emitter.emit("block:update", { id, patch });
  });

  bus.register("REMOVE_BLOCK", (ctx, { id }) => {
    ctx.dispatch({ type: "DELETE_NODE", id });
    ctx.emitter.emit("block:remove", { id });
  });

  // Nouvelle commande pour déplacer un nœud
  bus.register("MOVE_NODE", (ctx, { nodeId, newParentId, position = -1 }) => {
    try {
      // 1. Trouver le nœud à déplacer
      const oldRoot = ctx.state.doc.root;
      const nodeToMove = findNodeById(oldRoot, nodeId);
      if (!nodeToMove) {
        console.warn("Node not found:", nodeId);
        return;
      }

      // 2. Supprimer de l'ancien parent
      const rootWithoutNode = removeNodeImmutably(oldRoot, nodeId);

      // 3. Ajouter au nouveau parent
      let newRoot;
      if (position === -1) {
        // Ajouter à la fin
        newRoot = addNodeImmutably(rootWithoutNode, newParentId, nodeToMove);
      } else {
        // Insérer à une position spécifique
        newRoot = insertNodeAtPosition(
          rootWithoutNode,
          newParentId,
          nodeToMove,
          position
        );
      }

      // 4. Mettre à jour le document
      const newDoc = { ...ctx.state.doc, root: newRoot };
      ctx.dispatch({ type: "LOAD_DOC", doc: newDoc });

      // 5. Émettre l'événement
      ctx.emitter.emit("node:moved", { nodeId, newParentId, position });
    } catch (error) {
      console.error("Error moving node:", error);
      ctx.dispatch({
        type: "ADD_ERROR",
        error: `Erreur déplacement: ${error.message}`,
      });
    }
  });

  // Commande pour réorganiser les enfants
  bus.register("REORDER_NODES", (ctx, { parentId, oldIndex, newIndex }) => {
    ctx.dispatch({
      type: "REORDER_CHILDREN",
      parentId,
      from: oldIndex,
      to: newIndex,
    });

    ctx.emitter.emit("nodes:reordered", { parentId, oldIndex, newIndex });
  });

  // ✅ AJOUT : Nouvelles commandes pour les colonnes
  bus.register("SET_COLUMN_LAYOUT", (ctx, { count, distribution }) => {
    ctx.dispatch({
      type: "SET_COLUMN_LAYOUT",
      layout: { count, distribution, enabled: count > 1 },
    });
    ctx.emitter.emit("layout:changed", { count, distribution });
  });

  bus.register(
    "MOVE_NODE_TO_SECTION_COLUMN",
    (ctx, { nodeId, sectionId, columnIndex }) => {
      try {
        const oldRoot = ctx.state.doc.root;
        const nodeToMove = findNodeById(oldRoot, nodeId);
        if (!nodeToMove) return;

        // Supprimer de l'ancien parent
        const rootWithoutNode = removeNodeImmutably(oldRoot, nodeId);

        // Ajouter avec métadonnée de colonne
        const nodeWithColumn = { ...nodeToMove, columnIndex };
        const newRoot = addNodeImmutably(
          rootWithoutNode,
          sectionId,
          nodeWithColumn
        );

        const newDoc = { ...ctx.state.doc, root: newRoot };
        ctx.dispatch({ type: "LOAD_DOC", doc: newDoc });
      } catch (error) {
        console.error("Error moving node to section column:", error);
      }
    }
  );

  bus.register(
    "MOVE_NODE_TO_COLUMN",
    (ctx, { nodeId, targetColumnIndex, insertIndex }) => {
      ctx.dispatch({
        type: "MOVE_NODE_TO_COLUMN",
        nodeId,
        targetColumnIndex,
        insertIndex,
      });
      ctx.emitter.emit("node:movedToColumn", { nodeId, targetColumnIndex });
    }
  );
}

/*************************************
 * Enregistrement des blocs built-in
 *************************************/
function registerBuiltinBlocks(reg) {
  // Enregistrement des blocs importés
  reg.register(SectionBlock);
  reg.register(HeroBlock);
  reg.register(TextBlock);
  reg.register(ButtonBlock);
  reg.register(ImageBlock);
}

/***********************
 * Layout principal UI  *
 ***********************/
function EditorShell() {
  return (
    <div className="grid grid-cols-12 gap-3 h-[85vh]">
      <div className="col-span-3 h-full">
        <PluginPalette />
      </div>
      <div className="col-span-6 h-full">
        <Canvas />
      </div>
      <div className="col-span-3 h-full">
        <Inspector />
      </div>
    </div>
  );
}

/****************************************
 * Composant principal exporté (starter)
 ****************************************/
export default function DiviLikeStarter() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const registry = useMemo(() => BlockRegistry(), []);
  const emitter = useMemo(() => new Emitter(), []);
  const bus = useMemo(() => new CommandBus(), []);
  const services = useMemo(() => createDefaultServices(), []);

  // Enregistrement des blocs et commandes (une seule fois)
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    registerBuiltinBlocks(registry);
    registerDefaultCommands(bus);

    // Middleware d'analytics exemple
    bus.use((ctx, cmd, next) => {
      ctx.emitter.emit("analytics:cmd", cmd);
      return next(cmd);
    });
  }, [registry, bus, emitter]);

  // Autosave avec debounce
  const debouncedSave = useMemo(
    () => debounce((doc) => services.get("persistence").save(doc), 800),
    [services]
  );

  useEffect(() => {
    if (state.flags.autosave) debouncedSave(state.doc);
  }, [state.doc, state.flags.autosave, debouncedSave]);

  // Charger document si présent au boot
  useEffect(() => {
    const saved = loadDoc();
    if (saved) dispatch({ type: "LOAD_DOC", doc: saved });
  }, []);

  const ctx = useMemo(
    () => ({
      state,
      dispatch,
      registry,
      bus,
      emitter,
      services,
      nodeIndex: state.nodeIndex,
    }),
    [state, registry, bus, emitter, services]
  );

  return (
    <EditorContext.Provider value={ctx}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold flex items-center gap-2">
            <Puzzle className="h-5 w-5" /> Divi-like Starter
          </div>
          <div className="text-xs text-neutral-500">
            Template modulaire pour logique métier (plugins + commandes)
          </div>
          {state.errors.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => dispatch({ type: "CLEAR_ERRORS" })}
            >
              Effacer erreurs ({state.errors.length})
            </Button>
          )}
        </div>
        <Topbar />
        <EditorShell />
        <FooterDocs />
      </div>
    </EditorContext.Provider>
  );
}
