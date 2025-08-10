import { clone } from "../utils/helpers.js";
import {
  findNodeById,
  collectIds,
  addNodeImmutably,
  updateNodeImmutably,
  removeNodeImmutably,
  reorderChildrenImmutably,
  indexDoc,
} from "../utils/nodeUtils.js";

function reducer(state, action) {
  // Fonction de commit qui préserve les Maps
  const commit = (nextState) => {
    return {
      ...nextState,
      history: {
        past: [
          ...state.history.past,
          { doc: clone(state.doc), selection: state.selection },
        ],
        future: [],
      },
    };
  };

  switch (action.type) {
    case "SELECT":
      return { ...state, selection: action.id };

    case "HOVER":
      return { ...state, hover: action.id };

    case "ADD_NODE": {
      const { parentId, node } = action;
      const nextRoot = addNodeImmutably(state.doc.root, parentId, node);
      const nextDoc = { ...state.doc, root: nextRoot };

      // Créer un nouvel index
      const newIndex = new Map(state.nodeIndex);
      const addedNode = findNodeById(nextRoot, node.id);
      newIndex.set(node.id, { node: addedNode, parentId });

      return commit({
        ...state,
        doc: nextDoc,
        selection: node.id,
        nodeIndex: newIndex,
      });
    }

    case "UPDATE_NODE": {
      const { id, patch } = action;
      const nextRoot = updateNodeImmutably(state.doc.root, id, patch);
      const nextDoc = { ...state.doc, root: nextRoot };

      const newIndex = new Map(state.nodeIndex);
      const prev = newIndex.get(id);
      const updated = findNodeById(nextRoot, id);
      newIndex.set(id, { node: updated, parentId: prev?.parentId ?? null });

      return commit({
        ...state,
        doc: nextDoc,
        nodeIndex: newIndex,
      });
    }

    case "DELETE_NODE": {
      const id = action.id;
      const toRemove = findNodeById(state.doc.root, id);
      const nextRoot = removeNodeImmutably(state.doc.root, id);
      const nextDoc = { ...state.doc, root: nextRoot };

      const newIndex = new Map(state.nodeIndex);
      if (toRemove) {
        for (const rid of collectIds(toRemove)) {
          newIndex.delete(rid);
        }
      }

      return commit({
        ...state,
        doc: nextDoc,
        selection: "root",
        nodeIndex: newIndex,
      });
    }

    case "REORDER_CHILDREN": {
      const { parentId, from, to } = action;
      const nextRoot = reorderChildrenImmutably(
        state.doc.root,
        parentId,
        from,
        to
      );
      const nextDoc = { ...state.doc, root: nextRoot };

      return commit({
        ...state,
        doc: nextDoc,
      });
    }

    case "UNDO": {
      if (state.history.past.length === 0) return state;

      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      const newFuture = [
        { doc: state.doc, selection: state.selection },
        ...state.history.future,
      ];

      return {
        ...state,
        doc: previous.doc,
        selection: previous.selection,
        history: { past: newPast, future: newFuture },
        nodeIndex: indexDoc(previous.doc.root),
      };
    }

    case "REDO": {
      if (state.history.future.length === 0) return state;

      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      const newPast = [
        ...state.history.past,
        { doc: state.doc, selection: state.selection },
      ];

      return {
        ...state,
        doc: next.doc,
        selection: next.selection,
        history: { past: newPast, future: newFuture },
        nodeIndex: indexDoc(next.doc.root),
      };
    }

    case "LOAD_DOC": {
      const doc = action.doc;
      return {
        ...state,
        doc,
        selection: "root",
        history: { past: [], future: [] },
        nodeIndex: indexDoc(doc.root),
      };
    }

    case "TOGGLE_FLAG": {
      return {
        ...state,
        flags: { ...state.flags, [action.flag]: !state.flags[action.flag] },
      };
    }

    case "ADD_ERROR": {
      return {
        ...state,
        errors: [action.error, ...state.errors].slice(0, 10),
      };
    }

    case "CLEAR_ERRORS": {
      return { ...state, errors: [] };
    }

    default:
      return state;
  }
}

export default reducer;
