import { FeaturedProductsContent } from '@/types/models';
import { getProductsAction } from '@/features/ecommerce/actions';
import { ProductGrid } from '../ecommerce/product-grid'; // Importem el nostre grid animat
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { features } from '@/lib/site-config'; // 👈 IMPORTEM ELS FEATURES


export async function FeaturedProductsSection({ data }: { data: FeaturedProductsContent }) {
    // 🛑 GUARDRAIL: Si l'ecommerce està desactivat al JSON, no renderitzem res.
  if (!features.ecommerce) {
    return null;
  }
  // 1. Fetch dels productes (al servidor)
  const allProducts = await getProductsAction();
  
  // 2. Filtrem els N primers (o els que tinguin flag 'featured' si en tens)
  const productsToShow = allProducts.slice(0, data.limit || 4);

  if (productsToShow.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      
      {/* Elements decoratius de fons */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* HEADER DE SECCIÓ ANIMAT */}
        {/* Nota: Com que estem en un Server Component, podem usar classes d'animació CSS 
            o crear un petit wrapper 'SectionHeader' client si volem Framer Motion aquí també.
            Per simplicitat i rendiment, usarem un layout net.
        */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        <Sparkles size={16} />
                    </span>
                    <span className="text-sm font-bold tracking-widest text-primary uppercase">
                        Selecció Exclusiva
                    </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-[1.1]">
                    {data.title}
                </h2>
                <p className="mt-4 text-xl text-muted-foreground leading-relaxed max-w-lg">
                    {data.subtitle}
                </p>
            </div>

            <Link href="/shop" className="group">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-secondary/10 hover:bg-secondary/20 transition-all text-secondary-foreground font-bold">
                    <span>Veure tota la col·lecció</span>
                    <div className="bg-background rounded-full p-1.5 group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-4 h-4 text-foreground" />
                    </div>
                </div>
            </Link>
        </div>

        {/* GRID DE PRODUCTES (Client Component) */}
        <ProductGrid products={productsToShow} />
        
      </div>
    </section>
  );
}