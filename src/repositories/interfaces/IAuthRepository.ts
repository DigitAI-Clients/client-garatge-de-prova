import { UserProfile, CreateProfileDTO } from '@/types/models';

// Resultat genèric d'Auth (pot ser de Supabase o qualsevol altre)
export type AuthResult = {
  user: { id: string; email?: string } | null;
  error?: { message: string; status?: number } | null;
};

export interface IAuthRepository {
  // Accions d'Identitat (Auth)
  signUp(email: string, password: string, meta: { full_name: string; org_id: string }): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;

  // Accions de Dades (Profile)
  getProfile(userId: string, orgId: string): Promise<UserProfile | null>;
  
  // Acció Privilegiada (requereix Admin Client internament)
  createProfileForce(data: CreateProfileDTO): Promise<void>;
}