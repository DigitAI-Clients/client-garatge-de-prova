import { getAdminOrdersAction } from '@/features/ecommerce/actions';
import { requireAdmin } from '@/lib/auth/guards';
import { format } from 'date-fns';
import { BadgeEuro, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

// Helper per estats
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Pagat</span>;
    case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pendent</span>;
    case 'shipped': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Truck size={12}/> Enviat</span>;
    default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> {status}</span>;
  }
};

export default async function OrdersPage() {
  await requireAdmin();
  const orders = await getAdminOrdersAction();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Comandes</h1>
      
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">ID / Data</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Mètode</th>
              <th className="px-6 py-4">Estat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-mono text-xs text-slate-400">#{order.id.slice(0,8)}</div>
                  <div className="text-slate-700 font-medium">
                    {format(new Date(order.created_at), 'dd MMM yyyy HH:mm')}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {order.customer_email}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total_amount)}
                </td>
                <td className="px-6 py-4 capitalize text-slate-600">
                  <div className="flex items-center gap-2">
                    <BadgeEuro size={16} /> {order.payment_method}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(order.status)}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        Encara no hi ha vendes.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}