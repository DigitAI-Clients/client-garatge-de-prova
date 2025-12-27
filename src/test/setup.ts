import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// 🌍 1. SETUP D'ENTORN (MOCKS DE VARIABLES)
// ---------------------------------------------------------------------------

// SUPABASE MOCKS
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-123456789';
process.env.NEXT_PUBLIC_ORG_ID = 'test-org-uuid-v4';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// STRIPE MOCKS
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_12345'; 
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret_12345';

// GEMINI / GOOGLE AI MOCKS (👇 AFEGIT)
process.env.GEMINI_API_KEY = 'fake-gemini-key-for-testing';

// ---------------------------------------------------------------------------
// 🛠️ 2. MOCKS GLOBALS DEL NAVEGADOR
// ---------------------------------------------------------------------------

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(), 
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});