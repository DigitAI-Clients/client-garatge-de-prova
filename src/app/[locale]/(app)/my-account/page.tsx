import { createClient } from '@/lib/supabase/server';
import { ecommerceService, bookingService } from '@/services/container';
import { Package, Calendar, Clock, } from 'lucide-react';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import Link from 'next/link';

export default async function MyAccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');


  // Executem les dues consultes en paral·lel per velocitat
  const [orders, bookings] = await Promise.all([
    ecommerceService.getOrdersByUser(user.id),
    bookingService.getBookingsByUser(user.id)
  ]);

  return (
    <div className="space-y-8 pb-20"> {/* Padding bottom per al MobileBar */}
      
      {/* Capçalera Perfil */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
         <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <span className="text-3xl font-bold">{(user.user_metadata.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}</span>
         </div>
         <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.user_metadata.full_name || 'Usuari'}</h1>
            <p className="text-slate-500">{user.email}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                Client
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         
         {/* 📦 Historial de Comandes */}
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold text-slate-900">Les meves comandes</h2>
            </div>
            
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Comanda #{order.id.slice(0, 6)}</p>
                                <p className="text-xs text-slate-500">{format(new Date(order.created_at), 'PPP', { locale: ca })}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900">{order.total_amount} €</p>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                    order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm mb-4">No has comprat res encara.</p>
                    <Link href="/shop" className="text-primary text-sm font-bold hover:underline">Anar a la Botiga</Link>
                </div>
            )}
         </div>

         {/* 📅 Pròximes Cites */}
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold text-slate-900">Les meves reserves</h2>
            </div>

            {bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-2">{booking.services?.title || 'Servei'}</h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {format(new Date(booking.start_time), 'PPP', { locale: ca })}</div>
                                <div className="flex items-center gap-1"><Clock className="w-3 h-3"/> {format(new Date(booking.start_time), 'HH:mm')}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm mb-4">No tens cites programades.</p>
                    <Link href="/book" className="text-primary text-sm font-bold hover:underline">Reservar ara</Link>
                </div>
            )}
         </div>

      </div>
    </div>
  );
}