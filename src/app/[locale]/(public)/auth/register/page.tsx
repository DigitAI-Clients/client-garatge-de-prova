'use client';

import { useActionState } from 'react';
import { registerAction } from '@/features/auth/actions'; // Importem l'acció
import { CONFIG } from '@/config/digitai.config';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Missatges d'error traduïbles
const ERROR_MESSAGES: Record<string, string> = {
  account_exists: "Aquest correu ja està registrat. Prova d'iniciar sessió.",
  generic: "Hi ha hagut un error al crear el compte. Torna-ho a provar.",
  invalid_data: "Les dades introduïdes no són vàlides."
};

const initialState = { error: '', message: '' };

export default function RegisterPage() {
  // 1. Hook per connectar amb la Server Action
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  
  // Llegim errors externs també (per si de cas)
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const activeError = state?.error || urlError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/5 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-2xl shadow-xl border border-border">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Crea el teu compte
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Uneix-te a {CONFIG.identity.name}
          </p>
        </div>

        {/* 🚨 Zona d'Errors */}
        {activeError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">
              {ERROR_MESSAGES[activeError] || ERROR_MESSAGES.generic}
            </div>
          </div>
        )}

        {/* Formulari */}
        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4">
            
            {/* Nom Complet */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1">Nom Complet</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="w-full p-3 border border-border rounded-lg bg-muted/10 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Joan Garcia"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Correu Electrònic</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full p-3 border border-border rounded-lg bg-muted/10 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="nom@exemple.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Contrasenya</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full p-3 border border-border rounded-lg bg-muted/10 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Mínim 6 caràcters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99]"
          >
            {isPending ? 'Creant compte...' : 'Registrar-se'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-sm pt-4 border-t border-border">
          <p className="text-muted-foreground">
            Ja tens compte?{' '}
            <Link href="/auth/login" className="font-bold text-primary hover:underline">
              Inicia sessió
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}