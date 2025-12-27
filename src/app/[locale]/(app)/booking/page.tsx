import { getDashboardBookings } from '@/features/booking/actions';
import { CONFIG } from '@/config/digitai.config';
// 👇 1. Importem el model per tipar
import { Booking } from '@/types/models';

export default async function BookingDashboardPage() {
  // 1. Verifiquem si el mòdul està actiu
  if (!CONFIG.modules.booking) {
    return <div>Mòdul no contractat.</div>;
  }

  // 2. Obtenim dades (Ara TypeScript sap que això és Booking[])
  const bookings = await getDashboardBookings();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestió de Cites</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          + Nova Cita Manual
        </button>
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Servei</th>
              <th className="px-6 py-3">Data i Hora</th>
              <th className="px-6 py-3">Estat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* 👇 2. Tipem explícitament (opcional si l'acció està ben feta, però recomanat) */}
            {bookings.map((booking: Booking) => (
              <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">
                  {booking.customer_name}
                  <div className="text-xs text-muted-foreground">{booking.customer_email}</div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {booking.services?.title || 'Servei Eliminat'}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(booking.start_time).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  Encara no hi ha reserves.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}