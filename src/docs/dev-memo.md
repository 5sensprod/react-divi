# 📋 Memo Développeur - Architecture Divi-like Builder

> **Guide complet pour comprendre et étendre l'architecture modulaire**  
> Destiné aux développeurs et IA pour faciliter l'ajout de fonctionnalités

---

## 🏗️ **Vue d'ensemble de l'architecture**

### **Principes fondamentaux**
- ✅ **Immutabilité stricte** : Tous les changements d'état créent de nouveaux objets
- ✅ **Séparation des responsabilités** : Chaque module a un rôle précis
- ✅ **Inversion de dépendances** : Services injectés via le conteneur
- ✅ **CQRS Pattern** : Commandes séparées des requêtes
- ✅ **Event-driven** : Communication découplée via événements

### **Structure de fichiers**
```
src/
├── components/
│   ├── ui/           # Composants UI réutilisables (Button, Card, Input...)
│   ├── editor/       # Composants spécifiques à l'éditeur (Canvas, Inspector...)
│   └── blocks/       # Définitions des blocs de contenu
├── core/             # Architecture de base (CommandBus, EventEmitter...)
├── utils/            # Fonctions utilitaires pures
├── hooks/            # Hooks React personnalisés
├── context/          # Contextes React
└── App.jsx          # Point d'entrée principal
```

---

## 🧱 **Système de blocs extensible**

### **Anatomie d'un bloc**
```javascript
const MonBloc = {
  type: "mon-bloc",           // Identifiant unique
  label: "Mon Bloc",          // Nom affiché dans la palette
  icon: MonIcon,              // Icône Lucide React
  defaultData: () => ({       // Données par défaut
    title: "Titre par défaut",
    color: "#000000"
  }),
  render: (data, ctx) => (    // Rendu dans le canvas
    <div style={{ color: data.color }}>
      {data.title}
    </div>
  ),
  inspector: (data, onChange) => ( // Panneau de propriétés
    <div>
      <Input 
        value={data.title} 
        onChange={e => onChange({ title: e.target.value })}
      />
    </div>
  )
};
```

### **Ajouter un nouveau bloc**
1. **Créer** `src/components/blocks/MonBloc.jsx`
2. **Exporter** dans `src/components/blocks/index.js`
3. **Importer** dans `App.jsx`
4. **Enregistrer** dans `registerBuiltinBlocks()`

```javascript
// 1. Créer le bloc
export default MonBloc;

// 2. L'exporter
export { default as MonBloc } from './MonBloc.jsx';

// 3. L'importer
import { MonBloc } from './components/blocks';

// 4. L'enregistrer
function registerBuiltinBlocks(reg) {
  reg.register(MonBloc);
}
```

---

## 🔄 **Gestion d'état immutable**

### **Principe de l'immutabilité**
❌ **Éviter (mutation directe)**
```javascript
// MAUVAIS - modifie l'objet existant
node.data.title = "Nouveau titre";
state.doc.root.children.push(newNode);
```

✅ **Préférer (immutabilité)**
```javascript
// BON - crée de nouveaux objets
const newNode = { ...node, data: { ...node.data, title: "Nouveau titre" } };
const newRoot = { ...root, children: [...root.children, newNode] };
```

### **Helpers immutables disponibles**
```javascript
// Dans utils/nodeUtils.js
updateNodeImmutably(node, id, patch)    // Met à jour un nœud
addNodeImmutably(node, parentId, child) // Ajoute un enfant
removeNodeImmutably(node, id)           // Supprime un nœud
reorderChildrenImmutably(node, ...)     // Réordonne les enfants
```

---

## 🚌 **Command Bus Pattern**

### **Anatomie d'une commande**
```javascript
const command = {
  type: "MA_COMMANDE",    // Type unique
  payload: {              // Données de la commande
    id: "node123",
    value: "nouvelle valeur"
  }
};
```

### **Enregistrer une nouvelle commande**
```javascript
// Dans registerDefaultCommands()
bus.register('MA_COMMANDE', (ctx, command) => {
  const { id, value } = command;
  
  // Logique métier
  const node = ctx.nodeIndex.get(id)?.node;
  if (!node) return;
  
  // Dispatch d'action Redux-like
  ctx.dispatch({ 
    type: 'UPDATE_NODE', 
    id, 
    patch: { value } 
  });
  
  // Émettre un événement
  ctx.emitter.emit('node:updated', { id, value });
});
```

### **Utiliser une commande**
```javascript
const { bus } = useEditor();

// Exécuter une commande
await bus.exec(ctx, {
  type: 'MA_COMMANDE',
  id: 'node123',
  value: 'nouvelle valeur'
});
```

---

## 📡 **Système d'événements**

### **Émettre un événement**
```javascript
const { emitter } = useEditor();

emitter.emit('mon-evenement', { 
  data: 'payload' 
});
```

### **Écouter un événement**
```javascript
useEffect(() => {
  const unsubscribe = emitter.on('mon-evenement', (payload) => {
    console.log('Événement reçu:', payload);
  });
  
  return unsubscribe; // Nettoyage
}, [emitter]);
```

### **Événements prédéfinis**
- `block:add` - Bloc ajouté
- `block:update` - Bloc mis à jour  
- `block:remove` - Bloc supprimé
- `command:error` - Erreur de commande
- `analytics:cmd` - Tracking des commandes

---

## 🛠️ **Services & Injection de dépendances**

### **Créer un service**
```javascript
// Dans createDefaultServices()
services.set('monService', {
  async fetchData(id) {
    const response = await fetch(`/api/data/${id}`);
    return response.json();
  },
  
  processData(data) {
    return data.map(item => ({ ...item, processed: true }));
  }
});
```

### **Utiliser un service**
```javascript
const { services } = useEditor();

const monService = services.get('monService');
const data = await monService.fetchData('123');
const processed = monService.processData(data);
```

### **Services disponibles**
- `persistence` - Sauvegarde localStorage
- `exporter` - Export JSON
- `importer` - Import JSON

---

## 🎨 **Composants UI réutilisables**

### **Composants disponibles**
```javascript
import { 
  Button,           // Boutons avec variants
  Card, CardHeader, CardTitle, CardContent, // Cards
  Input,            // Champs de saisie
  Toggle,           // Boutons toggle
  Separator,        // Séparateurs
  ScrollArea,       // Zone de scroll
  Tabs, TabsList, TabsTrigger, TabsContent // Onglets
} from './components/ui';
```

### **Créer un nouveau composant UI**
```javascript
// src/components/ui/MonComposant.jsx
const MonComposant = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-white",
    primary: "bg-blue-500"
  };
  
  return (
    <div className={variants[variant]}>
      {children}
    </div>
  );
};

export default MonComposant;
```

---

## 🔗 **Hooks personnalisés**

### **useEditor - Hook principal**
```javascript
const { 
  state,        // État global de l'éditeur
  dispatch,     // Fonction de dispatch Redux-like
  registry,     // Registre des blocs
  bus,          // Command bus
  emitter,      // Event emitter
  services,     // Container de services
  nodeIndex     // Index optimisé des nœuds
} = useEditor();
```

### **Créer un hook personnalisé**
```javascript
// src/hooks/useMonHook.js
function useMonHook() {
  const { state, dispatch } = useEditor();
  
  const maFonction = useCallback(() => {
    // Logique personnalisée
    dispatch({ type: 'MA_ACTION' });
  }, [dispatch]);
  
  return { maFonction };
}
```

---

## 🎯 **Patterns pour ajouter des fonctionnalités**

### **1. Nouvelle fonctionnalité UI**
```javascript
// Créer le composant
const MaFonctionnalite = () => {
  const { state, dispatch } = useEditor();
  // Logique
};

// L'ajouter au layout
<EditorShell>
  <MaFonctionnalite />
</EditorShell>
```

### **2. Nouvelle logique métier**
```javascript
// Créer la commande
bus.register('MA_LOGIQUE', (ctx, cmd) => {
  // Implémentation
});

// Créer le service si nécessaire
services.set('monService', {
  // Méthodes
});
```

### **3. Nouveau type de données**
```javascript
// Étendre le reducer
case "MON_ACTION": {
  return {
    ...state,
    maNouvelleProprietee: action.value
  };
}
```

---

## 🐛 **Debugging et monitoring**

### **Logs automatiques**
```javascript
// Middleware de logging déjà en place
bus.use((ctx, cmd, next) => { 
  console.log('Command:', cmd.type, cmd);
  ctx.emitter.emit('analytics:cmd', cmd); 
  return next(cmd); 
});
```

### **Gestion d'erreurs**
```javascript
// Ajouter une erreur à l'UI
dispatch({ 
  type: 'ADD_ERROR', 
  error: 'Message d\'erreur' 
});

// Nettoyer les erreurs
dispatch({ type: 'CLEAR_ERRORS' });
```

---

## ⚡ **Performance et optimisations**

### **Index des nœuds O(1)**
```javascript
// Utiliser l'index au lieu de findNodeById récursif
const node = state.nodeIndex.get(nodeId)?.node;
// ✅ O(1) au lieu de O(n)
```

### **React.memo pour les composants**
```javascript
const MonComposant = React.memo(({ nodeId }) => {
  // Composant optimisé
}, (prev, next) => prev.nodeId === next.nodeId);
```

### **Debouncing**
```javascript
const debouncedFunction = useMemo(() => 
  debounce(maFonction, 300), 
  []
);
```

---

## 🚀 **Checklist pour nouvelles fonctionnalités**

### **Avant d'ajouter du code**
- [ ] Respecter l'immutabilité
- [ ] Utiliser les patterns existants
- [ ] Séparer les responsabilités
- [ ] Prévoir la testabilité

### **Nouveau bloc**
- [ ] Créer le fichier dans `blocks/`
- [ ] Définir `type`, `label`, `icon`, `defaultData`, `render`, `inspector`
- [ ] Exporter dans `index.js`
- [ ] Enregistrer dans `registerBuiltinBlocks()`
- [ ] Tester l'ajout, modification, suppression

### **Nouvelle commande**
- [ ] Enregistrer dans `registerDefaultCommands()`
- [ ] Gérer les erreurs
- [ ] Émettre les événements appropriés
- [ ] Documenter l'usage

### **Nouveau service**
- [ ] Ajouter dans `createDefaultServices()`
- [ ] Rendre testable (injection de dépendances)
- [ ] Gérer les cas d'erreur
- [ ] Documenter l'API

---

## 📚 **Ressources et références**

### **Patterns utilisés**
- **CQRS** (Command Query Responsibility Segregation)
- **Event Sourcing** light
- **Dependency Injection**
- **Observer Pattern** (EventEmitter)
- **Command Pattern** (CommandBus)

### **Libraries principales**
- **React** - Interface utilisateur
- **Framer Motion** - Animations
- **Lucide React** - Icônes
- **Tailwind CSS** - Styles

---

## 🎪 **Réponse sur FooterDocs**

**Le FooterDocs est-il utile dans la console ?**

**Recommandation : Garder FooterDocs** 🎯

**Pourquoi le garder :**
- ✅ **Documentation intégrée** - Exemples accessibles directement dans l'app
- ✅ **Onboarding développeurs** - Nouveaux devs comprennent rapidement
- ✅ **Référence rapide** - Pas besoin de chercher dans la doc externe
- ✅ **Exemples vivants** - Code qu'on peut copier-coller directement

**Alternatives si vous voulez l'optimiser :**
- 🔄 Le rendre **collapsible**
- 🎚️ Ajouter un **toggle dans les settings**
- 📱 Le rendre **responsive** (masquer sur mobile)
- 🎨 En faire un **modal** au lieu d'un footer fixe

**Code pour le rendre optionnel :**
```javascript
// Dans les flags
footerDocsVisible: true

// Dans l'UI
{state.flags.footerDocsVisible && <FooterDocs />}
```

Le FooterDocs reste précieux pour la DX (Developer Experience) ! 🚀