import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

// Validació de variables d'entorn (Fail Fast)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("❌ Error Crític: Falten les variables d'entorn de Supabase públiques.");
}

/**
 * 1. CLIENT ESTÀNDARD (User Context)
 * Utilitza aquest client el 99% de les vegades.
 * - Llegeix les cookies de l'usuari.
 * - Respecta les polítiques de seguretat (RLS).
 * - Sap qui és l'usuari actual.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorem errors de cookie en Server Components purs
            // (Això es gestiona automàticament pel Middleware)
          }
        },
      },
    }
  );
}

/**
 * 2. CLIENT ADMINISTRADOR (Service Role)
 * ⚠️ PERILL: Aquest client té permisos de "DÉU".
 * - Ignora totes les polítiques RLS.
 * - Pot llegir/escriure/esborrar qualsevol dada de qualsevol organització.
 * - Utilitza-ho NOMÉS per:
 * - Crear l'usuari inicial (Sign Up).
 * - Webhooks (Stripe).
 * - Tasques de manteniment (Cron Jobs).
 */
export function createAdminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("❌ Error Crític: Falta SUPABASE_SERVICE_ROLE_KEY. No es pot crear el client Admin.");
  }

  return createSupabaseClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false, // No guardem sessió, és una petició d'API pura
      }
    }
  );
}