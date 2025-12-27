export interface SectionConfig {
  id: string;
  type: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  sector: string;
  features: {
    booking: boolean;
    ecommerce: boolean;
    blog: boolean;
    gallery: boolean;
    faq: boolean;
  };
  theme: {
    primary: string;
    layout: 'modern' | 'shop';
  };
  landing?: {
    sections: SectionConfig[]; // 👈 IMPORTANT: Array d'objectes, no strings
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
    socials?: {
      instagram?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
}