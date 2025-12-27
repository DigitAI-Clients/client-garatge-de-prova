// PROJECTE: Master Template
// FITXER: src/types/config.ts

// ==========================================
// 1. Definicions de Seccions
// ==========================================

// A. Els noms de les seccions disponibles
export type SectionType = 
  | 'hero' 
  | 'features' 
  | 'services' 
  | 'contact' 
  | 'testimonials' 
  | 'map' 
  | 'stats' 
  | 'faq' 
  | 'cta_banner' 
  | 'featured_products' 
  | 'about';

// B. La definició d'objecte (necessària per la Factory)
export interface SectionConfig {
  id: string;
  type: SectionType;
}

// C. El tipus híbrid (accepta String legacy o Objecte nou)
export type ConfigLandingSection = SectionType | SectionConfig;

// ==========================================
// 2. Configuració de Contingut Estàtic
// ==========================================

export interface AboutConfigInput {
  title?: string;
  description?: string;
  image_url?: string;
  stats?: Array<{ label: string; value: string }>;
}

export interface HeroConfigInput {
  title?: string;
  subtitle?: string;
  cta?: string;
}

export interface AIItem {
  title: string;
  description: string;
  icon?: string;
}

export interface ServicesIntroConfigInput {
  title: string;
  subtitle: string;
  items?: AIItem[];
}

export interface TestimonialItem {
  text: string;
  author: string;
  role: string;
  rating: number;
}

export interface StaticContentConfig {
  hero?: HeroConfigInput;
  about?: AboutConfigInput;
  services_intro?: ServicesIntroConfigInput;
  testimonials?: {
    title: string;
    subtitle: string;
    items: TestimonialItem[];
  };
}

// ==========================================
// 3. Estructures Auxiliars
// ==========================================
export type ModuleStatus = boolean;

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SiteFooterConfig {
  columns: FooterColumn[];
  socials?: Record<string, string>;
  bottomText: string;
}

export interface SiteIdentity {
  name: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  address?: string;
  phone?: string; // <--- NOVA LÍNIA (Vital per mostrar el telèfon)
}

export interface SiteBranding {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
  };
  radius: number;
}

// ==========================================
// 4. Configuració de Mòduls
// ==========================================
export interface SiteModules {
  layout: {
    variant: 'modern' | 'shop';
    stickyHeader: boolean;
  };

  landing: {
    active: boolean;
    // Ara accepta tant strings com objectes
    sections: ConfigLandingSection[];
  };

  auth: {
    active: boolean;
    allowPublicRegistration: boolean;
    redirects: {
      admin: string;
      client: string;
    };
  };

  dashboard: ModuleStatus;
  booking: ModuleStatus;
  ecommerce: ModuleStatus;
  blog: ModuleStatus;
  inventory: ModuleStatus;
  accessControl: ModuleStatus;
  chatbot: ModuleStatus;
  gallery: boolean; // <--- AFEGIR
  faq: boolean;     // <--- AFEGIR (o mapejar a chatbot)
}

export interface I18nConfig {
  locales: string[];
  defaultLocale: string;
}

// ==========================================
// 🧠 CONFIGURACIÓ MESTRA
// ==========================================
export interface MasterConfig {
  organizationId?: string;
  identity: SiteIdentity;
  branding: SiteBranding;
  modules: SiteModules;
  i18n: I18nConfig;
  footer: SiteFooterConfig;
  content?: StaticContentConfig;
}