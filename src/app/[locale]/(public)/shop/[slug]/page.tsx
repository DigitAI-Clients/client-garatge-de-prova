//src\app\[locale]\(public)\shop\[slug]\page.tsx

import { getProductBySlugAction } from '@/features/ecommerce/actions';
import { ProductGallery } from '@/components/modules/ecommerce/product-gallery';
import { ProductActions } from '@/components/modules/ecommerce/product-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, ShieldCheck, Edit } from 'lucide-react';
import { authService } from '@/services/container';
import { createClient } from '@/lib/supabase/server';
interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugAction(slug);
  if (!product) return { title: 'Producte no trobat' };

  return {
    title: `${product.name} | Botiga`,
    description: product.description
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  const product = await getProductBySlugAction(slug);

  if (!product) notFound();
  // 1. Obtenim sessió
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Comprovem Admin
  const isAdmin = user ? await authService.isAdmin(user.id, process.env.NEXT_PUBLIC_ORG_ID!) : false;

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Breadcrumb / Back */}
        <Link href={`/${locale}/shop`} className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Tornar a la botiga
        </Link>
        {/* 👇 BOTÓ SECRET D'ADMIN */}
        {isAdmin && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-center">
            <span className="text-sm text-yellow-800 font-bold">Visió d'Administrador</span>
            <Link href={`/${locale}/admin/products/${product.id}/edit`}>
              <button className="flex items-center gap-2 bg-white border border-yellow-300 px-3 py-1 rounded text-sm hover:bg-yellow-100">
                <Edit size={14} /> Editar Producte
              </button>
            </Link>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">

          {/* Esquerra: Galeria */}
          <div>
            <ProductGallery images={product.images} title={product.name} />
          </div>

          {/* Dreta: Informació */}
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-primary">{product.price} €</span>
                {product.stock < 5 && (
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                    Només {product.stock} unitats!
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-lg text-muted-foreground mb-8">
              <p>{product.description || "Sense descripció detallada per aquest producte."}</p>
            </div>

            <div className="mt-auto space-y-6">
              {/* Botó de compra (Client Component) */}
              <ProductActions product={product} />

              {/* Trust Badges (Estètica Pro) */}
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-6 border-t border-border">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>Enviament ràpid 24/48h</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>Garantia de devolució</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}