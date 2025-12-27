import { IAuthRepository, AuthResult } from '../interfaces/IAuthRepository';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { UserProfile, CreateProfileDTO } from '@/types/models';

export class SupabaseAuthRepository implements IAuthRepository {
  
  async signUp(email: string, password: string, meta: { full_name: string; org_id: string }): Promise<AuthResult> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: meta.full_name, org_id: meta.org_id }
      }
    });
    
    return { user: data.user, error };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  }

  async signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  async getProfile(userId: string, orgId: string): Promise<UserProfile | null> {
    const supabase = await createClient();
    // Use maybeSingle per no llançar error 406 si no existeix
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('organization_id', orgId)
      .maybeSingle(); 

    if (!data) return null;
    
    // Mapeig segur
    return {
        ...data,
        created_at: new Date(data.created_at || Date.now())
    } as UserProfile;
  }

  async createProfileForce(data: CreateProfileDTO): Promise<void> {
    // ⚠️ AQUI ESTÀ LA CLAU: Usem ADMIN client per saltar RLS
    const supabaseAdmin = createAdminClient();
    
    const { error } = await supabaseAdmin.from('profiles').insert({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        organization_id: data.organization_id,
        role: data.role || 'client'
    });

    if (error) throw new Error(`Error creant perfil: ${error.message}`);
  }
}