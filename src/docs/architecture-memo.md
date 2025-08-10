# 📋 Mémo Architecture - Éditeur de Page Style Divi

## 🎯 **Philosophie Générale**

### **Vision Produit**
Éditeur de pages modulaire inspiré de Divi, permettant de construire des layouts complexes avec un système de blocs et de colonnes par section.

### **Principes de Design**
- **🧩 Modulaire** : Chaque bloc est un composant autonome et réutilisable
- **🔄 Extensible** : Architecture plugin-ready avec registry et command bus
- **🎨 Visual-First** : Interface intuitive avec drag & drop et configuration visuelle
- **⚡ Performance** : Immutabilité, mémoization et re-renders optimisés

---

## 🏗️ **Architecture Technique**

### **Pattern Principal : Flux Unidirectionnel**
```
UI Action → Command Bus → Reducer → State → Re-render
```

### **Couches Architecturales**
1. **Couche UI** : Composants React + Drag & Drop (@dnd-kit)
2. **Couche Logique** : Command Bus + Services + Registry  
3. **Couche État** : Reducer + Immutable Updates
4. **Couche Persistence** : LocalStorage + Export/Import JSON

---

## 📁 **Fichiers Maîtres**

### **🎮 Core (Logique Métier)**
- **`App.jsx`** - Bootstrap de l'app + Context Provider + Commands
- **`core/reducer.js`** - State management avec historique undo/redo
- **`core/CommandBus.js`** - Pattern Command pour découpler les actions
- **`core/BlockRegistry.js`** - Registry des types de blocs disponibles

### **🎨 Composants Éditeur**
- **`Canvas.jsx`** - Zone principale d'édition + Drag & Drop global
- **`NodeView.jsx`** - Rendu récursif des nœuds + Gestion colonnes sections
- **`Inspector.jsx`** - Panneau de propriétés contextuel
- **`PluginPalette.jsx`** - Palette des blocs disponibles

### **🧱 Système de Blocs**
- **`components/blocks/SectionBlock.jsx`** - Bloc section avec support colonnes
- **`components/blocks/TextBlock.jsx`** - Bloc de texte basique
- **`components/blocks/[...]Block.jsx`** - Autres types de blocs

### **🛠️ Utilitaires**
- **`utils/nodeUtils.js`** - Manipulations immutables de l'arbre de nœuds
- **`utils/columnUtils.js`** - Gestion des layouts de colonnes
- **`hooks/useEditor.js`** - Hook pour accéder au contexte éditeur
- **`hooks/useDragDrop.js`** - Abstractions pour @dnd-kit

---

## 🌊 **Flux de Données**

### **Structure de Document**
```javascript
{
  id: "doc-123",
  name: "Ma Page",
  root: {
    id: "root",
    type: "section", 
    children: [
      {
        id: "section-1",
        type: "section",
        data: { bg: "bg-white", padding: "py-12" },
        columnLayout: { count: 2, distribution: [60, 40] },
        children: [
          { id: "text-1", type: "text", columnIndex: 0, data: {...} },
          { id: "button-1", type: "button", columnIndex: 1, data: {...} }
        ]
      }
    ]
  }
}
```

### **Cycle de Vie d'une Action**
1. **Trigger** : User clique/drag dans l'UI
2. **Command** : `bus.exec(ctx, { type: "MOVE_NODE", ... })`
3. **Reducer** : Update immutable du state
4. **Re-index** : Reconstruction de la `nodeIndex` Map
5. **Re-render** : React met à jour l'UI

---

## 🎛️ **Systèmes Clés**

### **💎 Registry Pattern**
Permet d'enregistrer dynamiquement des types de blocs :
```javascript
registry.register({
  type: "custom-block",
  label: "Mon Bloc",
  render: (data, ctx) => <div>...</div>,
  inspector: (data, onChange) => <Input .../>,
  defaultData: () => ({ title: "Hello" })
});
```

### **📡 Command Bus Pattern**
Découple les actions de leur exécution :
```javascript
bus.register("CUSTOM_ACTION", (ctx, payload) => {
  // Logique métier réutilisable
  ctx.dispatch({ type: "UPDATE_NODE", ... });
});
```

### **🏛️ Colonnes par Section**
Chaque section peut avoir son propre layout de colonnes :
- 15+ layouts prédéfinis (50/50, 67/33, 25/50/25...)
- Zones de drop individuelles par colonne
- Métadonnée `columnIndex` sur les blocs enfants

### **🎯 Drag & Drop Intelligent**
- **Global** : Entre sections et root
- **Sectionnel** : Entre colonnes d'une même section  
- **IDs de drop** : `section-{id}-column-{index}` pour ciblage précis

---

## 🔧 **Points d'Extension**

### **Ajouter un Nouveau Bloc**
1. Créer `components/blocks/MonBlock.jsx`
2. L'enregistrer dans `registerBuiltinBlocks()`
3. Exporter dans `components/blocks/index.js`

### **Ajouter une Commande Métier**
1. Ajouter `bus.register()` dans `registerDefaultCommands()`
2. Utiliser via `bus.exec(ctx, { type: "MA_COMMANDE" })`

### **Ajouter un Service**
1. Enregistrer dans `createDefaultServices()`
2. Accéder via `services.get('mon-service')`

---

## 🎨 **Choix de Design**

### **Pourquoi cette Architecture ?**
- ✅ **Scalable** : Facile d'ajouter de nouveaux blocs et fonctionnalités
- ✅ **Testable** : Logic découplée de l'UI via Command Bus
- ✅ **Maintenable** : Séparation claire des responsabilités
- ✅ **Performant** : Updates immutables + React.memo optimisations

### **Trade-offs Assumés**
- **Complexité initiale** vs **Flexibilité long terme**
- **Abstractions** vs **Performance pure**
- **Architecture riche** vs **Simplicité beginner-friendly**

---

## 🚀 **Roadmap Technique**

### **V1 - Actuel ✅**
- [x] Système de blocs modulaire
- [x] Drag & Drop global
- [x] Colonnes par section avec layouts prédéfinis
- [x] Historique undo/redo
- [x] Persistence localStorage

### **V2 - Extensions 🔄**
- [ ] Layouts responsives (mobile/tablet)
- [ ] Blocs conditionnels et dynamiques
- [ ] Templates et snippets réutilisables
- [ ] Collaboration temps réel

### **V3 - Advanced 🚀**
- [ ] Plugin system externe
- [ ] Backend API integration
- [ ] Performance optimizations avancées
- [ ] A/B testing intégré

---

*"L'architecture qui grandit avec votre produit"* 🌱