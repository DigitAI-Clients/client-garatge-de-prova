import 'server-only';

// --- 1. Imports de Repositoris i Serveis ---
import { SupabaseBookingRepository } from '@/repositories/supabase/SupabaseBookingRepository';
import { SupabaseAuthRepository } from '@/repositories/supabase/SupabaseAuthRepository';
import { StaticContentRepository } from '@/repositories/static/StaticContentRepository';
import { SupabasePostRepository } from '@/repositories/supabase/SupabasePostRepository';
import { SupabaseEcommerceRepository } from '@/repositories/supabase/SupabaseEcommerceRepository';

import { EcommerceService } from '@/services/EcommerceService';
import { AIService } from '@/services/AIService';
import { BookingService } from '@/services/BookingService';
import { AuthService } from '@/services/AuthService';
import { MarketingService } from '@/services/MarketingService';
import { PostService } from '@/services/PostService';

// --- 2. Container Class (Singleton & Lazy Internal) ---
class ServiceContainer {
  private static instance: ServiceContainer;

  private _bookingService: BookingService | null = null;
  private _authService: AuthService | null = null;
  private _marketingService: MarketingService | null = null;
  private _postService: PostService | null = null;
  private _ecommerceService: EcommerceService | null = null;
  private _aiService: AIService | null = null;

  private constructor() { }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  // --- Getters amb Lazy Loading ---

  public get bookingService(): BookingService {
    if (!this._bookingService) {
      this._bookingService = new BookingService(new SupabaseBookingRepository());
    }
    return this._bookingService;
  }

  public get authService(): AuthService {
    if (!this._authService) {
      this._authService = new AuthService(new SupabaseAuthRepository());
    }
    return this._authService;
  }

  public get marketingService(): MarketingService {
    if (!this._marketingService) {
      // ✅ Correcte: Constructor buit
      this._marketingService = new MarketingService();
    }
    return this._marketingService;
  }

  public get postService(): PostService {
    if (!this._postService) {
      this._postService = new PostService(new SupabasePostRepository());
    }
    return this._postService;
  }

  public get ecommerceService(): EcommerceService {
    if (!this._ecommerceService) {
      this._ecommerceService = new EcommerceService(new SupabaseEcommerceRepository());
    }
    return this._ecommerceService;
  }

  public get aiService(): AIService {
    if (!this._aiService) {
      this._aiService = new AIService();
    }
    return this._aiService;
  }
}

const container = ServiceContainer.getInstance();

// --- 3. EXPORTS "MÀGICS" (Proxies) ---
// Aixo permet mantenir els imports antics sense trencar el build

function createLazyProxy<T extends object>(getter: () => T): T {
  return new Proxy({} as T, {
    get: (_target, prop) => {
      // Quan algú fa 'service.metode()', obtenim la instància real del container
      const instance = getter();
      const value = instance[prop as keyof T];

      // Si és una funció, la lliguem a la instància original per no perdre el 'this'
      return typeof value === 'function' ? value.bind(instance) : value;
    }
  });
}

// Ara exportem les constants que la resta de l'app espera, però són Proxies mandrosos
export const bookingService = createLazyProxy(() => container.bookingService);
export const authService = createLazyProxy(() => container.authService);
export const marketingService = createLazyProxy(() => container.marketingService);
export const postService = createLazyProxy(() => container.postService);
export const ecommerceService = createLazyProxy(() => container.ecommerceService);
export const aiService = createLazyProxy(() => container.aiService);

// També exportem el container per si algú el vol fer servir directament
export { container };