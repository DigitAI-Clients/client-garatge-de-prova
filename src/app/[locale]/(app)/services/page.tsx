import Link from 'next/link';
import { getServices, deleteServiceAction } from '@/features/booking/actions';
import { CONFIG } from '@/config/digitai.config';
import { Plus, Trash2, Clock, Euro } from 'lucide-react';

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Protecció de Mòdul
  if (!CONFIG.modules.booking) return <div>Mòdul no actiu</div>;

  const services = await getServices();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Els meus Serveis</h1>
          <p className="text-muted-foreground">Defineix què poden reservar els teus clients.</p>
        </div>
        <Link href={`/${locale}/services/new`}>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" /> Nou Servei
          </button>
        </Link>
      </div>

      {/* Grid de Targetes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <div key={service.id} className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
            
            <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">
              {service.description || "Sense descripció"}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="flex items-center gap-1 text-slate-600">
                   <Clock className="w-4 h-4" /> {service.duration_minutes} min
                </span>
                <span className="flex items-center gap-1 text-primary">
                   <Euro className="w-4 h-4" /> {service.price}
                </span>
              </div>

              {/* Botó d'Esborrar (Server Action Inline) */}
              <form action={deleteServiceAction}>
                  <input type="hidden" name="id" value={service.id} />
                  <button type="submit" className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                  </button>
              </form>
            </div>
          </div>
        ))}

        {services?.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                <p className="text-muted-foreground">Encara no has creat cap servei.</p>
            </div>
        )}
      </div>
    </div>
  );
}