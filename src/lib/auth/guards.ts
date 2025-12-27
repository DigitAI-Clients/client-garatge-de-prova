import { authService } from '@/services/container';
import { createClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticat");

  const orgId = process.env.NEXT_PUBLIC_ORG_ID!;
  const isAdmin = await authService.isAdmin(user.id, orgId);

  if (!isAdmin) {
    throw new Error("ACCÉS DENEGAT: Es requereixen permisos d'administrador.");
  }

  return user;
}