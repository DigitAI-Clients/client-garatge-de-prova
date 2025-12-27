//src\app\[locale]\(public)\shop\page.tsx

import { getProductsAction } from '@/features/ecommerce/actions';
import { ProductGrid } from '@/components/modules/ecommerce/product-grid';
import { ShoppingBag } from 'lucide-react';
import { CONFIG } from '@/config/digitai.config';

export const metadata = {
  title: `Botiga | ${CONFIG.identity.name}`,
  description: 'Descobreix els nostres productes exclusius.',
};

export default async function ShopPage() {
  // 1. Fetch de dades al servidor (Ràpid i segur)
  const products = await getProductsAction();

  return (
    <div className="min-h-screen bg-background">
      {/* Header de la Botiga */}
      <div className="bg-secondary/5 border-b border-border py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6 text-primary">
                <ShoppingBag className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
                La Nostra Botiga
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explora la nostra col·lecció de productes seleccionats especialment per a tu. Qualitat garantida.
            </p>
        </div>
      </div>

      {/* Grid de Productes */}
      <div className="container mx-auto px-4 py-16">
         {products.length > 0 ? (
             <ProductGrid products={products} />
         ) : (
             <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                 <p className="text-xl text-muted-foreground">Encara no hi ha productes disponibles.</p>
                 <p className="text-sm mt-2">Torna més tard!</p>
             </div>
         )}
      </div>
    </div>
  );
}