import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/modules/ecommerce/cart-drawer';
import { ChatWidget } from '@/components/modules/ai/chat-widget';
import { createClient } from '@/lib/supabase/server';
import { PublicMobileBar } from '@/components/layout/public-mobil-bar';
import { authService } from '@/services/container'; // 👈 Necessitem el servei per buscar el perfil/rol
import { CONFIG } from "@/config/digitai.config"; // 👈 Importa la config
// Definim el tipus aquí o l'importem d'un lloc comú
type UserSummary = {
  email: string;
  full_name?: string | null;
  role?: string;
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1. Obtenim l'usuari cru de Supabase
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = process.env.NEXT_PUBLIC_ORG_ID!;

  // 2. Preparem l'objecte UserSummary (amb el Rol)
  let userData: UserSummary | null = null;

  if (user) {
    // Busquem el perfil per saber si és admin
    const profile = await authService.getProfile(user.id, orgId);

    userData = {
      email: user.email || '', // 👈 Solucionem l'error 'undefined' amb un fallback
      full_name: profile?.full_name,
      role: profile?.role // 👈 Aquí tenim el rol correcte
    };
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* NOTA: Si el Navbar encara fa servir el tipus 'User' de Supabase, 
          li passem 'user'. Si ja el vas actualitzar a UserSummary, passa-li 'userData'.
          Aquí assumeixo que Navbar encara accepta el tipus original o és compatible.
      */}
      <Navbar user={user} />

      <CartDrawer />

      {/* 👇 NOMÉS ES RENDERITZA SI EL MÒDUL ESTÀ ACTIU */}
      {CONFIG.modules.chatbot && <ChatWidget />}

      <main className="grow pb-20 md:pb-0"> {/* Padding per no tapar amb la barra mòbil */}
        {children}
      </main>

      {/* 👇 ARA SÍ: Passem l'objecte amb el tipus correcte */}
      <PublicMobileBar user={userData} />

      <Footer />
    </div>
  );
}