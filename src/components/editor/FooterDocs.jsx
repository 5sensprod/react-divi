import React from "react";
import { Type } from "lucide-react";
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
          <TabsList>
            <TabsTrigger value="bloc">Nouveau bloc</TabsTrigger>
            <TabsTrigger value="cmd">Nouvelle commande</TabsTrigger>
            <TabsTrigger value="svc">Service métier</TabsTrigger>
          </TabsList>
          <TabsContent value="bloc">
            <pre className="text-xs bg-neutral-50 p-3 rounded-lg overflow-auto">
              {`// 1) Créez un nouveau fichier dans components/blocks/
const ProductBlock = {
  type: "product-card",
  label: "Produit",
  icon: Type,
  defaultData: () => ({ sku: "SKU123", price: 29.9 }),
  render: (data, ctx) => (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold">{data.sku}</h3>
      <p className="text-2xl">{data.price}€</p>
    </div>
  ),
  inspector: (data, onChange) => (
    <div className="space-y-2">
      <Input 
        value={data.sku} 
        onChange={e=>onChange({ sku: e.target.value })}
        placeholder="SKU"
      />
      <Input 
        type="number"
        value={data.price} 
        onChange={e=>onChange({ price: parseFloat(e.target.value)||0 })}
        placeholder="Prix"
      />
    </div>
  )
};

export default ProductBlock;`}
            </pre>
          </TabsContent>
          <TabsContent value="cmd">
            <pre className="text-xs bg-neutral-50 p-3 rounded-lg overflow-auto">
              {`// 2) Une commande réutilisable côté métier
bus.register('APPLY_DISCOUNT', (ctx, { id, percent }) => {
  const node = ctx.nodeIndex.get(id)?.node;
  if(node?.type !== 'product-card') return;
  const price = node.data.price;
  const newPrice = Math.max(0, price * (1 - (percent/100)));
  ctx.dispatch({ type: 'UPDATE_NODE', id, patch: { price: newPrice } });
});

// Utilisation:
// bus.exec(ctx, { type: 'APPLY_DISCOUNT', id: 'node123', percent: 20 });`}
            </pre>
          </TabsContent>
          <TabsContent value="svc">
            <pre className="text-xs bg-neutral-50 p-3 rounded-lg overflow-auto">
              {`// 3) Un service (ex: API catalogue)
services.set('catalog', {
  async findBySku(sku){
    const response = await fetch('/api/catalog/' + sku);
    return response.json();
  },
  async searchProducts(query) {
    const response = await fetch('/api/search?q=' + query);
    return response.json();
  }
});

// Utilisation depuis un bloc/inspector:
const { services } = useEditor();
const catalog = services.get('catalog');
const product = await catalog.findBySku('SKU123');`}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default FooterDocs;
