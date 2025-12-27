import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction, registerAction } from '../actions';
import { authService } from '@/services/container';
import { redirect } from 'next/navigation';
// Importem tipus reals (o els simulem si no els tenim a l'scope actual)
import type { User } from '@supabase/supabase-js'; 

vi.mock('@/services/container', () => ({
  authService: {
    login: vi.fn(),
    getRedirectPath: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(() => Promise.resolve('ca')),
}));

vi.mock('@/lib/email/email-service', () => ({
  EmailService: {
    sendWelcomeEmail: vi.fn(),
  },
}));

describe('Auth Actions', () => {
  const mockFormData = new FormData();
  mockFormData.append('email', 'test@test.com');
  mockFormData.append('password', '123456');

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ORG_ID = 'org_123';
  });

  describe('loginAction', () => {
    it('hauria de redirigir si el login és correcte', async () => {
      // ✅ CORRECTE: Fem servir 'as unknown as User' per simular l'objecte de retorn
      const mockUser = { id: 'user_1', email: 'test@test.com' };
      vi.mocked(authService.login).mockResolvedValue(mockUser as unknown as User);
      vi.mocked(authService.getRedirectPath).mockResolvedValue('/dashboard');

      try {
        await loginAction(null, mockFormData);
      } catch (e) {
        console.log(e)
        // Ignorem l'error intern de redirect
      }

      expect(authService.login).toHaveBeenCalledWith('test@test.com', '123456', 'org_123');
      expect(redirect).toHaveBeenCalledWith('/ca/dashboard');
    });

    it('hauria de retornar error si credencials són invàlides', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid login credentials'));

      const result = await loginAction(null, mockFormData);

      expect(result).toEqual({ error: 'invalid_credentials' });
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('registerAction', () => {
    it('hauria de registrar i redirigir', async () => {
      mockFormData.append('fullName', 'Test User');
      // ✅ CORRECTE: Retornem void o l'objecte esperat sense any
      vi.mocked(authService.register).mockResolvedValue(undefined);

      await registerAction(null, mockFormData);

      expect(authService.register).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/ca/auth/login?message=registered');
    });
  });
});