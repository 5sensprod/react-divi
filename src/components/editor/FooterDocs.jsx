import React from "react";
import { Type, Layout, Columns } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../ui";

function FooterDocs() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          Comment étendre (exemples rapides)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bloc">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="bloc">Nouveau bloc</TabsTrigger>
            <TabsTrigger value="section">Section avancée</TabsTrigger>
            <TabsTrigger value="cmd">Commande</TabsTrigger>
            <TabsTrigger value="svc">Service</TabsTrigger>
          </TabsList>

          <TabsContent value="bloc">
            <pre className="text-xs bg-neutral-50 p-3 rounded-lg overflow-auto">
              {`// 1) Créez un nouveau fichier dans components/blocks/
const ProductBlock = {
  type: "product-card",
  label: "Produit",
  icon: Type,
  defaultData: () => ({ sku: "SKU123", price: 29.9, inStock: true }),
  render: (data, ctx) => (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-bold text-lg">{data.sku}</h3>
      <p className="text-2xl text-green-600">{data.price}€</p>
      <span className={\`text-xs px-2 py-1 rounded \${
        data.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }\`}>
        {data.inStock ? 'En stock' : 'Rupture'}
      </span>
    </div>
  ),
  inspector: (data, onChange) => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-neutral-500 block mb-1">SKU</label>
        <Input 
          value={data.sku} 
          onChange={e=>onChange({ sku: e.target.value })}
          placeholder="SKU du produit"
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">Prix</label>
        <Input 
          type="number"
          step="0.01"
          value={data.price} 
          onChange={e=>onChange({ price: parseFloat(e.target.value)||0 })}
          placeholder="29.90"
        />
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="checkbox"
          checked={data.inStock}
          onChange={e=>onChange({ inStock: e.target.checked })}
        />
        <label className="text-xs text-neutral-600">En stock</label>
      </div>
    </div>
  )
};

// 2) L'enregistrer dans App.jsx
function registerBuiltinBlocks(reg) {
  reg.register(SectionBlock);
  reg.register(ProductBlock); // ← Ajouter ici
  // ... autres blocs
}

export default ProductBlock;`}
            </pre>
          </TabsContent>

          <TabsContent value="section">
            <pre className="text-xs bg-neutral-50 p-3 rounded-lg overflow-auto">
              {`// Section avec colonnes personnalisées
const CustomSectionBlock = {
  type: "hero-section",
  label: "Section Hero",
  icon: Layout,
  defaultData: () => ({ 
    bg: "bg-gradient-to-r from-blue-500 to-purple-600",
    padding: "py-20",
    // Colonnes par défaut 67/33
    columnLayout: { 
      count: 2, 
      distribution: [66.67, 33.33], 
      layoutId: "twothird-third" 
    }
  }),
  render: (data, ctx) => (
    <div className={\`\${data.bg} \${data.padding} text-white\`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Section Hero</h1>
          <p className="text-xl opacity-90">
            {ctx.node.children?.length || 0} élément(s) dans cette section
          </p>
        </div>
      </div>
    </div>
  ),
  inspector: (data, onChange) => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-neutral-500 block mb-1">
          Background (classes Tailwind)
        </label>
        <Input
          value={data.bg || ""}
          onChange={(e) => onChange({ bg: e.target.value })}
          placeholder="bg-gradient-to-r from-blue-500 to-purple-600"
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500 block mb-1">Padding</label>
        <Input
          value={data.padding || ""}
          onChange={(e) => onChange({ padding: e.target.value })}
          placeholder="py-20"
        />
      </div>
      <div className="text-xs text-gray-500 mt-2">
        💡 Utilisez le bouton "Colonnes" dans la section pour configurer la disposition
      </div>
    </div>
  ),
};`}
            </pre>
          </TabsContent>

          <TabsContent value="cmd">
            <pre className="text-xs bg-neutral-50 p-3 rounded-lg overflow-auto">
              {`// Commandes métier réutilisables
bus.register('APPLY_DISCOUNT', (ctx, { id, percent }) => {
  const node = ctx.nodeIndex.get(id)?.node;
  if(node?.type !== 'product-card') return;
  
  const currentPrice = node.data.price;
  const discountedPrice = Math.max(0, currentPrice * (1 - (percent/100)));
  
  ctx.dispatch({ 
    type: 'UPDATE_NODE', 
    id, 
    patch: { data: { price: discountedPrice } }
  });
  
  ctx.emitter.emit('product:discount-applied', { id, percent, newPrice: discountedPrice });
});

// Commande pour dupliquer une section avec ses colonnes
bus.register('DUPLICATE_SECTION', (ctx, { sectionId }) => {
  const section = ctx.nodeIndex.get(sectionId)?.node;
  if(section?.type !== 'section') return;
  
  const newSection = {
    ...section,
    id: uid(),
    children: section.children?.map(child => ({
      ...child,
      id: uid()
    })) || []
  };
  
  ctx.dispatch({ 
    type: 'ADD_NODE', 
    parentId: 'root', 
    node: newSection 
  });
});

// Utilisation:
// bus.exec(ctx, { type: 'APPLY_DISCOUNT', id: 'node123', percent: 20 });
// bus.exec(ctx, { type: 'DUPLICATE_SECTION', sectionId: 'section123' });`}
            </pre>
          </TabsContent>

          <TabsContent value="svc">
            <pre className="text-xs bg-neutral-50 p-3 rounded-lg overflow-auto">
              {`// Services métier externes
services.set('catalog', {
  async findBySku(sku) {
    const response = await fetch('/api/catalog/' + sku);
    if (!response.ok) throw new Error('Produit non trouvé');
    return response.json();
  },
  
  async searchProducts(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await fetch('/api/search?' + params);
    return response.json();
  },
  
  async updateStock(sku, quantity) {
    const response = await fetch('/api/catalog/' + sku + '/stock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    return response.json();
  }
});

// Service de templates
services.set('templates', {
  async saveAsTemplate(sectionId, name) {
    const { state } = useEditor();
    const section = state.nodeIndex.get(sectionId)?.node;
    
    const template = {
      name,
      type: section.type,
      data: section.data,
      columnLayout: section.columnLayout,
      children: section.children || []
    };
    
    // Sauvegarder dans API ou localStorage
    localStorage.setItem('template_' + name, JSON.stringify(template));
    return template;
  }
});

// Utilisation dans un bloc/inspector:
const { services } = useEditor();
const catalog = services.get('catalog');

// Dans un effet ou handler
useEffect(() => {
  async function loadProduct() {
    try {
      const product = await catalog.findBySku(data.sku);
      onChange({ price: product.price, inStock: product.stock > 0 });
    } catch (error) {
      console.error('Erreur chargement produit:', error);
    }
  }
  if (data.sku) loadProduct();
}, [data.sku]);`}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default FooterDocs;
