import { MetadataRoute } from 'next';
import { getProductsAction } from '@/features/ecommerce/actions';

// 🛠️ SOLUCIÓ MESTRA: Forcem mode dinàmic
// Això evita que el build exploti per culpa de les cookies de Supabase
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://la-teva-web.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Pàgines Estàtiques (Hardcoded o del Config)
  const staticRoutes = [
    '',
    '/services',
    '/shop',
    '/book',
    '/auth/login'
  ].map(route => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  try {
    // 2. Productes Dinàmics
    // Ara podem cridar l'acció tranquil·lament
    const products = await getProductsAction();
    
    // Si l'acció retorna null o falla, gestionem l'error per no trencar el sitemap
    const productList = Array.isArray(products) ? products : [];

    const productRoutes = productList.map(product => ({
      url: `${BASE_URL}/shop/${product.slug}`,
      lastModified: new Date(), // O product.created_at si ho tens
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];

  } catch (error) {
    console.error("⚠️ Error generant sitemap de productes:", error);
    // En cas d'error (ex: DB caiguda), retornem almenys les estàtiques
    return staticRoutes;
  }
}