'use client';

import { useActionState } from 'react';
import { createProductAction , ActionState } from '@/features/ecommerce/actions';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// L'estat inicial ha de tenir EXACTAMENT la mateixa forma
const initialState: ActionState = {
    success: false,
    message: '',
    error: '' // Si error és opcional al tipus, aquí pot ser undefined o string buit
};

export default function NewProductPage() {
    
    const [state, formAction, isPending] = useActionState(createProductAction, initialState);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Link href="/products" className="flex items-center text-muted-foreground mb-6 hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Tornar al Dashboard
            </Link>

            <div className="bg-background border border-border rounded-xl p-8 shadow-sm">
                <h1 className="text-2xl font-bold mb-6">Nou Producte</h1>

                {state.error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium">
                        {state.error}
                    </div>
                )}
                {state.success && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 text-sm font-medium">
                        Producte creat! Pots continuar afegint-ne.
                    </div>
                )}

                <form action={formAction} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Nom del Producte</label>
                            <input name="name" required placeholder="Ex: Samarreta Vintage" className="w-full p-3 rounded-lg border border-border bg-muted/10" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Descripció</label>
                            <textarea name="description" rows={3} className="w-full p-3 rounded-lg border border-border bg-muted/10" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Preu (€)</label>
                            <input name="price" type="number" step="0.01" required className="w-full p-3 rounded-lg border border-border bg-muted/10" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Estoc Inicial</label>
                            <input name="stock" type="number" required defaultValue="10" className="w-full p-3 rounded-lg border border-border bg-muted/10" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">URL Imatge (Temporal)</label>
                            <input name="images" placeholder="https://..." className="w-full p-3 rounded-lg border border-border bg-muted/10" />
                            <p className="text-xs text-muted-foreground mt-1">Pots separar múltiples URLs amb comes.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50"
                    >
                        {isPending ? 'Guardant...' : <><Save size={18} /> Crear Producte</>}
                    </button>
                </form>
            </div>
        </div>
    );
}