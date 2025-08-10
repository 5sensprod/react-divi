// utils/columnUtils.js

export function getNodesForColumn(rootNode, columnIndex, columnLayout) {
  if (!rootNode.children || columnLayout.count === 1) {
    return columnIndex === 0 ? rootNode.children || [] : [];
  }

  return rootNode.children.filter((node, index) => {
    // Si le nœud a une métadonnée columnIndex, l'utiliser
    if (typeof node.columnIndex === "number") {
      return node.columnIndex === columnIndex;
    }
    // Sinon, répartition séquentielle par défaut
    return index % columnLayout.count === columnIndex;
  });
}

export function redistributeNodesAcrossColumns(rootNode, columnCount) {
  if (!rootNode.children || columnCount === 1) {
    // Supprimer les métadonnées de colonne si on revient à 1 colonne
    return {
      ...rootNode,
      children: rootNode.children?.map((child) => {
        const { columnIndex, ...nodeWithoutColumn } = child;
        return nodeWithoutColumn;
      }),
    };
  }

  // Répartir les nœuds dans les colonnes
  const newChildren = rootNode.children.map((node, index) => ({
    ...node,
    columnIndex: index % columnCount,
  }));

  return {
    ...rootNode,
    children: newChildren,
  };
}

export function addNodeToColumn(rootNode, parentId, nodeToAdd, columnIndex) {
  const nodeWithColumn = {
    ...nodeToAdd,
    columnIndex,
  };

  return addNodeImmutably(rootNode, parentId, nodeWithColumn);
}

export function insertNodeAtPosition(
  rootNode,
  parentId,
  nodeToAdd,
  insertIndex,
  columnIndex
) {
  const nodeWithColumn = {
    ...nodeToAdd,
    columnIndex,
  };

  if (parentId === "root") {
    const newChildren = [...(rootNode.children || [])];
    newChildren.splice(insertIndex, 0, nodeWithColumn);

    return {
      ...rootNode,
      children: newChildren,
    };
  }

  // Pour les autres parents, utiliser la logique existante
  return addNodeImmutably(rootNode, parentId, nodeWithColumn);
}
