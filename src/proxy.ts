import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { CONFIG } from '@/config/digitai.config';

// 1. Configurem el middleware d'idiomes
const intlMiddleware = createMiddleware({
  locales: CONFIG.i18n.locales,
  defaultLocale: CONFIG.i18n.defaultLocale,
  localePrefix: 'always'
});

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/') ||
    /\.(.*)$/.test(request.nextUrl.pathname) // Detecta qualsevol extensió (.js, .png, .json, .webmanifest)
  ) {
    return NextResponse.next();
  }
  // 2. Primer, executem la lògica d'idiomes per tenir la resposta base
  // Això ens assegura que la URL ja té /ca o /es si cal.
  const response = intlMiddleware(request);

  // 3. Inicialitzem client Supabase per gestionar cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Aquesta part és crucial: passem les cookies de Supabase a la resposta de next-intl
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 4. Refresquem sessió (Important per RLS)
  // No ens importa el user aquí, només que la cookie es mantingui viva.
  const { data: { user } } = await supabase.auth.getUser();

  // 5. PROTECCIÓ DE RUTES (Firewall)
  // Si intenta entrar a una ruta privada (dashboard) sense usuari -> Login
  // Usem una RegExp per detectar /ca/dashboard, /es/dashboard, etc.
  const isPrivateRoute = /^\/(ca|es|en)\/\(app\)/.test(request.nextUrl.pathname) ||
    request.nextUrl.pathname.includes('/dashboard');

  if (isPrivateRoute && !user) {
    // Redirigim al login mantenint l'idioma
    const locale = request.nextUrl.pathname.split('/')[1] || CONFIG.i18n.defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    return NextResponse.redirect(url);
  }

  // 6. Si ja està loguejat i va al login -> Cap al dashboard
  if (request.nextUrl.pathname.includes('/auth/login') && user) {
    const locale = request.nextUrl.pathname.split('/')[1] || CONFIG.i18n.defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return response;
}


export const config = {
  // Ignorem fitxers estàtics i API
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};