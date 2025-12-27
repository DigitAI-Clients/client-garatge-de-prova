'use client';

import { Service, FormField } from '@/types/models';
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BookingActionState } from '@/features/booking/actions';

interface Props {
  service: Service;
  date: Date;
  time: string;
  formAction: (payload: FormData) => void;
  isPending: boolean;
  state: BookingActionState;
  onBack: () => void;
}

export function BookingForm({ service, date, time, formAction, isPending, state, onBack }: Props) {
  
  // Helper intern per camps dinàmics (SRP: La lògica de renderitzar inputs és aquí)
  const renderDynamicField = (field: FormField) => {
    const commonClasses = "w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all";
    const inputName = `custom_${field.key}`;

    if (field.type === 'textarea') {
        return <textarea name={inputName} required={field.required} placeholder={field.label} className={commonClasses} rows={3} />;
    }
    return <input type={field.type} name={inputName} required={field.required} placeholder={field.label} className={commonClasses} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="max-w-md mx-auto w-full"
    >
      <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1">
        ← Canviar hora
      </button>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Les teves dades</h2>
      <p className="text-slate-500 mb-8">Completa el formulari per confirmar.</p>

      <form action={formAction} className="space-y-4">
        {/* Hidden Inputs (Context) */}
        <input type="hidden" name="serviceId" value={service.id} />
        <input type="hidden" name="date" value={format(date, 'yyyy-MM-dd')} />
        <input type="hidden" name="time" value={time} />

        {/* Standard Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nom</label>
            <input name="name" required placeholder="Joan Vila" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <input name="email" type="email" required placeholder="joan@exemple.com" className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
        </div>

        {/* Dynamic Fields */}
        {service.form_schema && service.form_schema.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase">Informació addicional</p>
            {service.form_schema.map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                {renderDynamicField(field)}
              </div>
            ))}
          </div>
        )}

        {/* Error Feedback */}
        {state.message && !state.success && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} /> {state.message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all mt-6 flex justify-center items-center gap-2"
        >
          {isPending ? <Loader2 className="animate-spin" /> : 'Confirmar Reserva'}
        </button>
      </form>
    </motion.div>
  );
}