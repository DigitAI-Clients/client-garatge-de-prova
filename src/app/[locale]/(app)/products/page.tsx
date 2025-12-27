import { getProductsAction } from '@/features/ecommerce/actions';
import { requireAdmin } from '@/lib/auth/guards';
import Link from 'next/link';
import { Plus, Edit, Eye, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

// Helper per formatar moneda (Professional touch)
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export default async function ProductsManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // 🛡️ 1. SEGURETAT: Firewall d'Admin
  // Si l'usuari no és admin, aquesta funció llança un error i atura la renderització.
  await requireAdmin();

  // 📥 2. DADES: Recuperem tots els productes de l'organització
  const products = await getProductsAction();

  return (
    <div className="space-y-6">
      {/* Capçalera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Productes</h1>
          <p className="text-slate-500">Gestiona el catàleg, preus i inventari de la teva botiga.</p>
        </div>
        <Link href={`/${locale}/products/new`}>
          <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            Nou Producte
          </button>
        </Link>
      </div>

      {/* Taula de Productes */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {products.length === 0 ? (
          // Estat Buit (Empty State)
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Encara no tens productes</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Comença a afegir productes per omplir la teva botiga online.
            </p>
            <Link href={`/${locale}/products/new`}>
               <span className="text-primary font-bold hover:underline">Crear el primer producte &rarr;</span>
            </Link>
          </div>
        ) : (
          // Taula de Dades
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-20">Imatge</th>
                  <th className="px-6 py-4">Nom del Producte</th>
                  <th className="px-6 py-4">Preu</th>
                  <th className="px-6 py-4">Estoc</th>
                  <th className="px-6 py-4">Estat</th>
                  <th className="px-6 py-4 text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* Columna Imatge */}
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 relative">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Columna Nom */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-400 font-mono truncate max-w-[150px]">
                        /{product.slug}
                      </div>
                    </td>

                    {/* Columna Preu */}
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatPrice(product.price)}
                    </td>

                    {/* Columna Estoc (amb lògica visual) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span>{product.stock} u.</span>
                        {product.stock === 0 ? (
                             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">Esgotat</span>
                        ) : product.stock < 5 ? (
                             <AlertTriangle className="w-4 h-4 text-amber-500"  />
                        ) : null}
                      </div>
                    </td>

                    {/* Columna Estat */}
                    <td className="px-6 py-4">
                      {product.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3" /> Actiu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          <XCircle className="w-3 h-3" /> Inactiu
                        </span>
                      )}
                    </td>

                    {/* Columna Accions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Veure a la botiga (Públic) */}
                        <Link 
                            href={`/${locale}/shop/${product.slug}`} 
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Veure a la botiga"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                        
                        {/* Editar (Admin) - Ruta que crearem després si cal */}
                        <Link 
                            href={`/${locale}/products/${product.id}/edit`}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}