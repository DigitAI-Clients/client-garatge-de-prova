'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createServiceAction } from '@/features/booking/actions';
import { ServiceFormBuilder } from '@/components/modules/booking/ServiceFormBuilder'
import { FormField } from '@/types/models';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner'; // 👈 IMPORTAR TOAST

export default function NewServicePage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [customFields, setCustomFields] = useState<FormField[]>([]);

  // Eliminem l'acció directa del <form> per tenir control total
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evitem el reload natiu
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    formData.append('form_schema', JSON.stringify(customFields));

    // Cridem al Server Action
    // ✅ CORRECCIÓ (Passa 'undefined' com a primer argument):
    const result = await createServiceAction(undefined, formData);

    if (result.success) {
      // ✅ ÈXIT: Toast Verd + Redirecció
      toast.success(result.message);
      router.push('/services');
      router.refresh(); // Assegura que la llista es carrega de nou
    } else {
      // ❌ ERROR: Toast Vermell + Mantenim dades
      toast.error(result.message);
      setIsPending(false); // Parem de carregar perquè l'usuari corregeixi
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="flex items-center gap-4">
        <Link href="/services" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nou Servei</h1>
      </div>

      {/* Usem onSubmit en lloc de action */}
      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom del Servei</label>
            <input name="title" required placeholder="Ex: Canvi d'Oli" className="w-full p-2 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preu (€)</label>
              <input name="price" type="number" step="0.01" required className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Durada (min)</label>
              <input name="duration" type="number" required defaultValue={60} className="w-full p-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripció</label>
            <textarea name="description" rows={3} className="w-full p-2 border rounded-lg" />
          </div>
        </div>

        {/* Builder de Formulari */}
        <ServiceFormBuilder onChange={setCustomFields} />

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            {isPending ? 'Guardant...' : 'Crear Servei'}
          </button>
        </div>

      </form>
    </div>
  );
}