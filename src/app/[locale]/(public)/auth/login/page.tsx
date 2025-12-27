'use client';

import { useActionState } from 'react';
import { loginAction } from '@/features/auth/actions';
import { CONFIG } from '@/config/digitai.config';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "El correu o la contrasenya no són correctes.",
  no_access: "No tens permís per accedir a aquesta organització.",
  generic: "Hi ha hagut un error inesperat. Torna-ho a provar.",
  no_profile: "L'usuari existeix però no té perfil actiu."
};

// Estat inicial per al hook
const initialState = { error: '', message: '' };

export default function LoginPage() {
  // 1. Hook per gestionar el formulari
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  
  // 2. També mirem la URL per si venim d'un redirect extern
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const urlMessage = searchParams.get('message');

  // Prioritzem l'error de l'estat actual, sinó el de la URL
  const activeError = state?.error || urlError;
  const activeMessage = state?.message || urlMessage;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/5 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-2xl shadow-xl border border-border">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            {CONFIG.identity.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Inicia sessió</p>
        </div>

        {/* 🚨 Error Display */}
        {activeError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">
              {ERROR_MESSAGES[activeError] || ERROR_MESSAGES.generic}
            </div>
          </div>
        )}

        {/* ✅ Success Display */}
        {activeMessage === 'registered' && (
           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">
              Compte creat! Inicia sessió.
            </div>
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" name="email" type="email" required className="w-full p-3 border border-border rounded-lg bg-muted/10" placeholder="nom@exemple.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Contrasenya</label>
              <input id="password" name="password" type="password" required className="w-full p-3 border border-border rounded-lg bg-muted/10" placeholder="••••••••" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? 'Entrant...' : 'Entrar'}
          </button>
        </form>

        {CONFIG.modules.auth.allowPublicRegistration && (
            <div className="text-center text-sm pt-4 border-t border-border">
                <p className="text-muted-foreground">
                    No tens compte? <Link href="/auth/register" className="font-bold text-primary hover:underline">Registra't</Link>
                </p>
            </div>
        )}
      </div>
    </div>
  );
}