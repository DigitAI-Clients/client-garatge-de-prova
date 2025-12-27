//src\app\[locale]\(public)\book\page.tsx
import { getServices } from '@/features/booking/actions';
import { BookingWidget } from '@/components/modules/booking/BookingWidget'; // Comprova majúscules/minúscules
import { CONFIG } from '@/config/digitai.config';
import { getTranslations } from 'next-intl/server';

export default async function PublicBookingPage() {
  const t = await getTranslations('Booking');

  // Feature Flag Check
  if (!CONFIG.modules.booking) {
    return (
        <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
            Aquest lloc no té les reserves activades.
        </div>
    );
  }

  // Fetch de dades al servidor (Ràpid i segur) 
  const services = await getServices();

  return (
    <div className="min-h-screen bg-slate-50/50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                {t('title', { defaultMessage: 'Reserva la teva cita' })}
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                {t('subtitle', { defaultMessage: 'Selecciona el servei, tria el dia que millor et vagi i confirma la teva assistència en menys d\'un minut.' })}
            </p>
        </div>
        
        <BookingWidget services={services || []} />
      </div>
    </div>
  );
}