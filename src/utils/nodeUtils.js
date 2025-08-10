/********************
 * Helpers de graphe *
 ********************/

export function updateNodeImmutably(node, id, patch) {
  if (node.id === id) {
    return { ...node, data: { ...(node.data || {}), ...(patch || {}) } };
  }
  if (!node.children) return node;
  const children = node.children.map((c) => updateNodeImmutably(c, id, patch));
  return { ...node, children };
}

export function addNodeImmutably(node, parentId, newNode) {
  if (node.id === parentId) {
    const children = [...(node.children || []), newNode];
    return { ...node, children };
  }
  const children = (node.children || []).map((c) =>
    addNodeImmutably(c, parentId, newNode)
  );
  return { ...node, children };
}

export function removeNodeImmutably(node, id) {
  const children = (node.children || [])
    .filter((c) => c.id !== id)
    .map((c) => removeNodeImmutably(c, id));
  return { ...node, children };
}

export function reorderChildrenImmutably(node, parentId, from, to) {
  if (node.id === parentId) {
    const arr = [...(node.children || [])];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    return { ...node, children: arr };
  }
  const children = (node.children || []).map((c) =>
    reorderChildrenImmutably(c, parentId, from, to)
  );
  return { ...node, children };
}

export function findNodeById(node, id) {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const r = findNodeById(child, id);
    if (r) return r;
  }
  return null;
}

export function collectIds(node) {
  const ids = [node.id];
  (node.children || []).forEach((c) => ids.push(...collectIds(c)));
  return ids;
}

export function indexDoc(root) {
  const map = new Map();
  (function walk(n, parentId = null) {
    map.set(n.id, { node: n, parentId });
    (n.children || []).forEach((c) => walk(c, n.id));
  })(root);
  return map;
}
