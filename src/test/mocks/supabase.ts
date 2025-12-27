import { vi } from 'vitest';
import { PostgrestError } from '@supabase/supabase-js';

// Mock base de Supabase
export const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
};

// Interface per a la resposta de Supabase
interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

// Helper tipat amb Generics <T>
export const mockSupabaseResponse = <T>(data: T): SupabaseResponse<T> => ({
  data,
  error: null,
});

// Helper d'error tipat corregit
export const mockSupabaseError = (message: string, code = '400'): SupabaseResponse<null> => ({
  data: null,
  error: {
    message,
    code,
    details: '',
    hint: '',
    name: 'PostgrestError', // 👈 AFEGEIX AQUESTA LÍNIA
  },
});